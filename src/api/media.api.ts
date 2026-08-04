/** @format */

import { MOCK_ENABLED } from "@/mock/handlers/mock";
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

    throw new Error("ще не готово");
  },
};

export const mediaApi = MOCK_ENABLED ? mockMediaApi : realMediaApi;
