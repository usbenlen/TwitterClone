import type { usePostComposer } from "@/hooks/composer/usePostComposer";

import ComposerPopovers from "@/components/composer/ComposerPopovers";
import ComposerFileInputs from "@/components/composer/attachments/ComposerFileInputs";

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
