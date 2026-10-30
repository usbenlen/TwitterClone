import { userApi } from "@/features/profiles/api/profileApi";
import { appApi, request } from "@/shared/store/appApi";

import type { User } from "@/features/profiles/types";

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
