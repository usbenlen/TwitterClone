/** @format */

import { MEDIA } from "@/constants/app";

interface TweetComposerFileInputsProps {
  imageRef: React.RefObject<HTMLInputElement | null>;
  videoRef: React.RefObject<HTMLInputElement | null>;
  onFilesSelected: (files: FileList | null) => void;
}

export default function TweetComposerFileInputs({
  imageRef,
  videoRef,
  onFilesSelected,
}: TweetComposerFileInputsProps) {
  return (
    <>
      <input
        ref={imageRef}
        type="file"
        hidden
        multiple
        accept={MEDIA.IMAGE.ALLOWED_TYPES.join(",")}
        onChange={(e) => {
          onFilesSelected(e.target.files);
          e.currentTarget.value = "";
        }}
      />

      <input
        ref={videoRef}
        type="file"
        hidden
        multiple
        accept={MEDIA.VIDEO.ALLOWED_TYPES.join(",")}
        onChange={(e) => {
          onFilesSelected(e.target.files);
          e.currentTarget.value = "";
        }}
      />
    </>
  );
}
