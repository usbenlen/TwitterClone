import { userApi } from "@/api/profileApi";

import type { User } from "@/types/user";

import { appApi, request } from "@/store/appApi";

export const profileQueries = appApi.injectEndpoints({
  endpoints: (build) => ({
    getProfile: build.query<User, string>({
      queryFn: (username) => request(() => userApi.getByUsername(username)),
      providesTags: (_data, _error, username) => [
        { type: "Profile", id: username },
      ],
    }),
  }),
});

export const {
  useGetProfileQuery,
} = profileQueries;
