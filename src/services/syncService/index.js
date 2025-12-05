import { getPendingChanges, removePendingChange } from '../../db/indexDB.js';
import { updatePostOnServer } from '../posts/api.js';
import { isOnline } from '../index.js';

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; 

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const syncSingleChange = async (change, retryCount = 0) => {
    try {
        await updatePostOnServer(change.postId, change.updates);
        await removePendingChange(change.id);
        return { success: true, changeId: change.id };

    } catch (error) {
        if (retryCount < MAX_RETRIES) {
            await delay(RETRY_DELAY * (retryCount + 1));
            return syncSingleChange(change, retryCount + 1);
        }
        return { success: false, changeId: change.id, error };
    }
};
export const syncPendingChanges = async () => {
    if (!isOnline()) {
        return { success: false, message: 'Device is offline' };
    }

    try {
        const pendingChanges = await getPendingChanges();
        if (pendingChanges.length === 0) {
            return { success: true, synced: 0 };
        }
        const changesByPost = new Map();
        pendingChanges.forEach(change => {
            const existing = changesByPost.get(change.postId);
            if (!existing || change.timestamp > existing.timestamp) {
                changesByPost.set(change.postId, change);
            }
        });
        const results = [];
        for (const change of changesByPost.values()) {
            const result = await syncSingleChange(change);
            results.push(result);
        }

        const successCount = results.filter(r => r.success).length;
        const failCount = results.filter(r => !r.success).length;
        return {
            success: failCount === 0,
            synced: successCount,
            failed: failCount,
            results
        };

    } catch (error) {
        return { success: false, error };
    }
};

export const startAutoSync = (onSyncComplete) => {
    let syncInProgress = false;

    const performSync = async () => {
        if (syncInProgress) {
            return;
        }

        syncInProgress = true;
        try {
            const result = await syncPendingChanges();
            if (onSyncComplete) {
                onSyncComplete(result);
            }
        } finally {
            syncInProgress = false;
        }
    };
    const handleOnline = () => {
        performSync();
    };
    window.addEventListener('online', handleOnline);
    if (isOnline()) {
        performSync();
    }
    return () => {
        window.removeEventListener('online', handleOnline);
    };
};
