/** @format */

import { MOCK_ENABLED } from "@/mock/config";
import { mockMediaApi } from "@/mock/handlers/mockMediaApi";

interface UploadMediaOptions {
  onProgress?: (progress: number) => void;
}

const realMediaApi = {
  async upload(file: File, options?: UploadMediaOptions) {
    const formData = new FormData();
    formData.append("file", file);

    // приклад майбутньої реалізації
    // const { data } = await api.post("/media", formData);

    // return data;

    // TODO: реалізувати після появи backend
    throw new Error("Media upload API is not implemented yet.");
  },
};

export const mediaApi = MOCK_ENABLED ? mockMediaApi : realMediaApi;
