import ComposerPopovers from "@/features/content/components/composer/ComposerPopovers";
import ComposerFileInputs from "@/features/content/components/composer/attachments/ComposerFileInputs";

import type { usePostComposer } from "@/features/content/hooks/composer";

export function ComposerInputsAndPopovers({
  composer,
}: {
  composer: ReturnType<typeof usePostComposer>;
}) {
  return (
    <>
      <ComposerPopovers
        emoji={composer.popovers.emoji}
        gif={composer.popovers.gif}
        location={composer.popovers.location}
      />

      <ComposerFileInputs
        imageRef={composer.imageInputRef}
        videoRef={composer.videoInputRef}
        onFilesSelected={composer.onFilesSelected}
      />
    </>
  );
}
