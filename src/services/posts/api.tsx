/* eslint-disable @typescript-eslint/no-unused-vars */
import { readData, updateData } from "../http-service";
import type { Work, WorkList } from "./type";


export const getPosts = async (): Promise<WorkList> => {
    const res = await readData<WorkList>("/todos?_limit=10");
    return res;
};

export const updatePost = async (post: Work): Promise<Work> => {
    const { pendingSync, ...rest } = post;
    const res: Work = await updateData(`/todos/${post.id}`, { ...rest });
    return res;
};