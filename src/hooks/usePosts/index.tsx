/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQuery } from "@tanstack/react-query";
import { getPosts, updatePost as updatePostApi } from "../../services/posts/api";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getAllPosts, getPendingSyncPosts, hasData, saveAllPosts, updatePost } from "../../db/indexDB.js";
import { queryClient } from "../../libs/react-query.js";
import type { Work } from "../../services/posts/type.js";

const usePosts = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [filter, setFilter] = useState({ type: "", value: "" });

    const { data, isLoading, isError, isPending } = useQuery<Work[]>({
        queryKey: ['posts'],
        queryFn: async () => {
            if (isOnline) {
                try {
                    const posts = await getPosts();
                    await saveAllPosts(posts);
                    return posts;
                } catch (error) {
                    const hasLocal = await hasData();
                    if (hasLocal) return await getAllPosts();
                    throw error;
                }
            } else {
                return await getAllPosts();
            }
        },
    });

    const syncPendingChanges = async () => {
        try {
            const pending = await getPendingSyncPosts();

            if (pending.length === 0) return;

            for (const post of pending) {
                try {
                    const { pendingSync, ...postData } = post;
                    await updatePostApi(postData);

                    await updatePost({
                        ...post,
                        pendingSync: 0
                    });

                } catch (err) {
                    console.error("Sync error:", err);
                }
            }

            await queryClient.invalidateQueries({ queryKey: ['posts'] });

        } catch (err) {
            console.error("Error syncing:", err);
        }
    };

    const updatePostMutation = useMutation({
        mutationFn: async (post: Work) => {
            const { pendingSync, ...postData } = post;

            await updatePostApi(postData as Work);
            await updatePost({ ...post, pendingSync: 0 });
        },

        onMutate: async (updatedPost) => {
            await queryClient.cancelQueries({ queryKey: ['posts'] });

            const prev = queryClient.getQueryData<Work[]>(['posts']);

            queryClient.setQueryData(['posts'], (old: any) =>
                old
                    ? old.map((p: { id: number; }) => p.id === updatedPost.id ? updatedPost : p)
                    : [updatedPost]
            );

            return { prev };
        },

        onError: (_err, _post, context) => {
            if (context?.prev) {
                queryClient.setQueryData(['posts'], context.prev);
            }
        },

        onSettled: async () => {
            await queryClient.invalidateQueries({ queryKey: ['posts'] });
        }
    });

    const sortedItems = useMemo(() => {
        if (!data) return [];

        if (!filter.type || !filter.value) return [...data];

        const sorted = [...data];
        const { type, value } = filter;

        if (type === "Decending" && value === "Time")
            sorted.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
        else if (type === "Ascending" && value === "Time")
            sorted.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
        else if (type === "Decending" && value === "Type")
            sorted.sort((a, b) => b.type.localeCompare(a.type));
        else if (type === "Ascending" && value === "Type")
            sorted.sort((a, b) => a.type.localeCompare(b.type));

        return sorted;
    }, [data, filter]);

    const handleFilter = useCallback((type: string, value: string) => {
        setFilter({ type, value });
    }, []);

    useEffect(() => {
        if (isOnline) syncPendingChanges();
    }, [isOnline]);
    useEffect(() => {
        const onOnline = () => setIsOnline(true);
        const onOffline = () => setIsOnline(false);

        window.addEventListener('online', onOnline);
        window.addEventListener('offline', onOffline);

        return () => {
            window.removeEventListener('online', onOnline);
            window.removeEventListener('offline', onOffline);
        };
    }, []);

    return {
        items: sortedItems,
        isOnline,
        updatePost: updatePostMutation.mutate,
        updatePostAsync: updatePostMutation.mutateAsync,
        isUpdating: updatePostMutation.isPending,
        syncPendingChanges,
        handleFilter,
        isPending, isLoading, isError
    };
};

export default usePosts;
