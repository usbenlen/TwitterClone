import { apiClient } from "@/api/client";
import { ENDPOINTS } from "@/api/config";

import { MOCK_ENABLED } from "@/mock/config";
import { mockUsersApi } from "@/mock/handlers/admin/mockUsersApi.ts";

import type {
    UsersListParams,
    UsersListResponse,
} from "@/admin/types/users";

const realAdminUsersApi = {
    getAll: async (
        params: UsersListParams = {},
    ): Promise<UsersListResponse> => {
        const searchParams =
            new URLSearchParams();

        if (params.page) {
            searchParams.set(
                "page",
                String(params.page),
            );
        }

        if (
            params.search &&
            params.search.trim()
        ) {
            searchParams.set(
                "search",
                params.search.trim(),
            );
        }

        if (
            params.status &&
            params.status !== "all"
        ) {
            searchParams.set(
                "status",
                params.status,
            );
        }

        if (params.sort) {
            searchParams.set(
                "sort",
                params.sort,
            );
        }

        const query = searchParams.toString();

        const endpoint = query
            ? `${ENDPOINTS.admin.users.all}?${query}`
            : ENDPOINTS.admin.users.all;

        return apiClient.get<UsersListResponse>(endpoint);
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

export const usersApi = MOCK_ENABLED ? mockUsersApi : realAdminUsersApi;