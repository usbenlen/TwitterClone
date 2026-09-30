/** Owns only temporary URLs it creates; never revokes a persisted image URL. */
export function createObjectUrlOwner() {
  let url: string | null = null;
  const release = () => {
    if (url) URL.revokeObjectURL(url);
    url = null;
  };
  return {
    release,
    replace(file: Blob): string {
      release();
      url = URL.createObjectURL(file);
      return url;
    },
  };
}
