/** @format */

interface MockUploadOptions {
  onProgress?: (progress: number) => void;
  interval?: number;
  step?: number;
}

export async function mockUpload(
  file: File,
  options?: MockUploadOptions,
): Promise<void> {
  // Поки file не використовується, але буде потрібний коли замінимо mock на справжній upload(back-end).
  void file;

  const interval = options?.interval ?? 120;
  const step = options?.step ?? 10;

  let progress = 0;

  await new Promise<void>((resolve) => {
    const timer = window.setInterval(() => {
      progress = Math.min(progress + step, 100);

      options?.onProgress?.(progress);

      if (progress >= 100) {
        window.clearInterval(timer);
        resolve();
      }
    }, interval);
  });
}
