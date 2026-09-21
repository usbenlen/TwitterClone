import { apiClient } from "@/api/client";
import { ENDPOINTS } from "@/api/config";

import { MOCK_ENABLED } from "@/mock/config";
import { mockAdminUsersApi } from "@/mock/handlers/admin/mockAdminUsersApi";

import type { User } from "@/types";

const realAdminUsersApi = {
    getAll: async (): Promise<User[]> => {
        return apiClient.get<User[]>(
            ENDPOINTS.admin.users.all,
        );
    },

    block: async (userId: string): Promise<void> => {
        await apiClient.put(
            ENDPOINTS.admin.users.block(userId),
        );
    },

    unblock: async (userId: string): Promise<void> => {
        await apiClient.put(
            ENDPOINTS.admin.users.unblock(userId),
        );
    },

    delete: async (userId: string): Promise<void> => {
        await apiClient.delete(
            ENDPOINTS.admin.users.delete(userId),
        );
    },
};

export const usersApi = MOCK_ENABLED ? mockAdminUsersApi : realAdminUsersApi;