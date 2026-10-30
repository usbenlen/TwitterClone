import LinkPreviewCard from "@/features/content/components/posts/LinkPreviewCard";
import PostLocation from "@/features/content/components/posts/PostLocation";
import PostMedia from "@/features/content/components/posts/PostMedia";
import PostPoll from "@/features/content/components/posts/PostPoll";
import QuotedPostCard from "@/features/content/components/posts/QuotedPostCard";
import { removePreviewUrl } from "@/features/content/lib/composer/linkPreview";
import { normalizeDisplayText } from "@/shared/lib/displayText";
import { TwemojiText } from "@/shared/ui";

import type { Post } from "@/features/content/types";

interface PostContentProps {
  post: Post;
  readOnly?: boolean;
}

export default function PostContent({
  post,
  readOnly = false,
}: PostContentProps) {
  const displayContent = normalizeDisplayText(
    removePreviewUrl(post.content, post.linkPreview?.url),
  );

  return (
    <div className="min-w-0">
      {displayContent && (
        <TwemojiText
          text={displayContent}
          className="block min-w-0 overflow-hidden wrap-anywhere whitespace-pre-wrap"
        />
      )}

      {post.attachments.length > 0 && (
        <PostMedia attachments={post.attachments} autoPlayVideos />
      )}

      {post.poll && (
        <PostPoll
          isComment={post.isComment}
          postId={post.id}
          poll={post.poll}
          readOnly={readOnly}
        />
      )}

      {post.linkPreview && <LinkPreviewCard preview={post.linkPreview} />}

      {post.quote && <QuotedPostCard quote={post.quote} readOnly={readOnly} />}

      {post.location && <PostLocation location={post.location} />}
    </div>
  );
}
