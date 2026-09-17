export const USERS_ITEMS_PER_PAGE = 10;

export const USER_STATUS_FILTERS = [
    {
        value: "all",
        label: "Усі",
    },
    {
        value: "active",
        label: "Активні",
    },
    {
        value: "blocked",
        label: "Заблоковані",
    },
] as const;

export type UserStatusFilter = (typeof USER_STATUS_FILTERS)[number]["value"];