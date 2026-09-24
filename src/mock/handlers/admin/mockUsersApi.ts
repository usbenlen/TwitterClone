import { sampleAuthors } from "@/mock/data/users";

export const mockUsersApi = {
    async getAll() {
        return [...sampleAuthors];
    },

    async block(userId: string): Promise<void> {
        const user = sampleAuthors.find(
            (currentUser) =>
                currentUser.id === userId,
        );

        if (!user) {
            throw new Error(
                "Користувача не знайдено",
            );
        }

        user.isBlocked = true;
    },

    async unblock(userId: string): Promise<void> {
        const user = sampleAuthors.find(
            (currentUser) =>
                currentUser.id === userId,
        );

        if (!user) {
            throw new Error(
                "Користувача не знайдено",
            );
        }

        user.isBlocked = false;
    },

    async delete(userId: string): Promise<void> {
        const index = sampleAuthors.findIndex(
            (currentUser) =>
                currentUser.id === userId,
        );

        if (index === -1) {
            throw new Error(
                "Користувача не знайдено",
            );
        }

        sampleAuthors.splice(index, 1);
    },
};