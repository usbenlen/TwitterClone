import TwemojiText from "@/components/ui/TwemojiText";

import {
  PostLocation,
  LinkPreviewCard,
  PostPoll,
  PostMedia,
  QuotedPostCard,
} from "@/components/posts";

import type { Post } from "@/types/post";

import { removePreviewUrl } from "@/utils/composer/linkPreview";
import { normalizeDisplayText } from "@/utils/displayText";

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
