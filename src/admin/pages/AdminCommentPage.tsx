import { useParams } from "react-router";

export default function AdminCommentPage() {
    const { commentId } = useParams<{
        commentId: string;
    }>();

    return (
        <div>
            <h1>Комментарий</h1>
            <p>ID: {commentId}</p>
        </div>
    );
}