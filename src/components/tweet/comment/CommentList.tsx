import { CommentItem } from "@/components/tweet/comment";

import type { Comment } from "@/types/comment";

interface CommentListProps {
  comments: Comment[];
  repliesByParentId: Map<string, Comment[]>;
  currentUserId?: string;
  onReply: (comment: Comment) => void;
  onDelete: (commentId: string) => Promise<void>;
}

export default function CommentList({
  comments,
  repliesByParentId,
  currentUserId,
  onReply,
  onDelete,
}: CommentListProps) {
  return (
    <div className="divide-y divide-border">
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          replies={repliesByParentId.get(comment.id) ?? []}
          repliesByParentId={repliesByParentId}
          currentUserId={currentUserId}
          depth={0}
          onReply={onReply}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
