import { useParams } from "react-router";

export default function AdminUserPage() {
    const { username } = useParams<{
        username: string;
    }>();

    return (
        <div>
            <h1>Пользователь</h1>
            <p>@{username}</p>
        </div>
    );
}