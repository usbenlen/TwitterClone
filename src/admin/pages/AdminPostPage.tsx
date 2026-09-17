import { useParams } from "react-router";

export default function AdminUserPage() {
    const { postId } = useParams<{
        postId: string;
    }>();

    return (
        <div>
            <h1>Пост</h1>
            <p>@{postId}</p>
        </div>
    );
}