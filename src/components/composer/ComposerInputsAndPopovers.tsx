import type { useTweetComposer } from "@/hooks/composer/useTweetComposer";
import ComposerPopovers from "@/components/composer/ComposerPopovers";
import { TweetComposerFileInputs } from "@/components/tweet/TweetComposer/index";

export function ComposerInputsAndPopovers({
  composer,
}: {
  composer: ReturnType<typeof useTweetComposer>;
}) {
  return (
    <>
      <ComposerPopovers
        emoji={composer.popovers.emoji}
        gif={composer.popovers.gif}
        poll={composer.popovers.poll}
        location={composer.popovers.location}
      />

      <TweetComposerFileInputs
        imageRef={composer.imageInputRef}
        videoRef={composer.videoInputRef}
        onFilesSelected={composer.onFilesSelected}
      />
    </>
  );
}
