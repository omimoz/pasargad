
const dbName = import.meta.env.VITE_DB_NAME;
const dbVersion = import.meta.env.VITE_DB_VERSION;
const storeName = import.meta.env.VITE_STORE_NAME;
export const openDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, Number(dbVersion));
        request.onupgradeneeded = (event) => {
            const db = event.target.result;

            if (!db.objectStoreNames.contains(storeName)) {
                const objectStore = db.createObjectStore(storeName, { keyPath: 'id' });
                objectStore.createIndex('pendingSync', 'pendingSync', { unique: 0 });
                objectStore.createIndex('lastModified', 'lastModified', { unique: 0 });
            }
        };

        request.onsuccess = (event) => {
            resolve(event.target.result);
        };

        request.onerror = (event) => {
            reject('database error: ' + event.target.error);
        };
    });
};

export const getAllPosts = async () => {
    const db = await openDB();
    const transaction = db.transaction([storeName], 'readonly');
    const objectStore = transaction.objectStore(storeName);

    return new Promise((resolve, reject) => {
        const request = objectStore.getAll();

        request.onsuccess = (event) => {
            db.close();
            const posts = event.target.result.sort((a, b) => a.id - b.id);
            resolve(posts);
        };

        request.onerror = () => {
            db.close();
            reject('get all posts error on database');
        };
    });
};


export const saveAllPosts = async (posts) => {
    const db = await openDB();
    const transaction = db.transaction([storeName], 'readwrite');
    const objectStore = transaction.objectStore(storeName);
    const postsWithMetadata = posts.map(post => ({
        ...post,
        pendingSync: 0,
        lastModified: Date.now()
    }));
    for (const post of postsWithMetadata) {
        objectStore.put(post);
    }

    return new Promise((resolve, reject) => {
        transaction.oncomplete = () => {
            db.close();
            resolve();
        };
        transaction.onerror = () => {
            db.close();
            reject('save posts error on database');
        };
    });
};

export const updatePost = async (updatedPost) => {
    const db = await openDB();
    const transaction = db.transaction([storeName], 'readwrite');
    const objectStore = transaction.objectStore(storeName);
    
    const postToSave = {
        ...updatedPost,
        pendingSync: updatedPost.pendingSync ?? 0, 
        lastModified: Date.now()
    };

    return new Promise((resolve, reject) => {
        const request = objectStore.put(postToSave);

        request.onsuccess = () => {
            transaction.oncomplete = () => {
                db.close();
                resolve(postToSave);
            };
        };

        request.onerror = () => {
            db.close();
            reject("error updating post");
        };
    });
};

export const getPendingSyncPosts = async () => {
    const db = await openDB();
    const transaction = db.transaction([storeName], 'readonly');
    const objectStore = transaction.objectStore(storeName);
    const index = objectStore.index('pendingSync');

    return new Promise((resolve, reject) => {
        const posts = [];
        const request = index.openCursor(IDBKeyRange.only(1)); 

        request.onsuccess = (event) => {
            const cursor = event.target.result;
            if (cursor) {
                posts.push(cursor.value);
                cursor.continue();
            } else {
                db.close();
                const sortedPosts = posts.sort((a, b) => b.lastModified - a.lastModified);
                resolve(sortedPosts);
            }
        };

        request.onerror = () => {
            db.close();
            reject('get pending sync posts error on database');
        };
    });
};

export const hasData = async () => {
    const db = await openDB();
    const transaction = db.transaction([storeName], 'readonly');
    const objectStore = transaction.objectStore(storeName);

    return new Promise((resolve, reject) => {
        const request = objectStore.count();

        request.onsuccess = (event) => {
            db.close();
            resolve(event.target.result > 0);
        };

        request.onerror = () => {
            db.close();
            reject('has data error on database');
        };
    });
};