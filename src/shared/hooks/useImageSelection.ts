import { useEffect, useRef, useState } from "react";

import { createObjectUrlOwner } from "@/shared/lib/objectUrl";

import type { ChangeEvent } from "react";

export function useImageSelection(initialUrl?: string | null) {
  const owner = useRef(createObjectUrlOwner());
  const [selection, setSelection] = useState({
    file: null as File | null,
    preview: initialUrl,
    removed: false,
  });

  useEffect(() => {
    const urls = owner.current;
    return () => urls.release();
  }, []);

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setSelection({
      file,
      preview: owner.current.replace(file),
      removed: false,
    });
  };

  const remove = () => {
    owner.current.release();
    setSelection({ file: null, preview: null, removed: Boolean(initialUrl) });
  };

  const reset = () => {
    owner.current.release();
    setSelection({ file: null, preview: initialUrl, removed: false });
  };

  return { ...selection, onChange, remove, reset };
}
