import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { createObjectUrlOwner } from "@/utils/objectUrl";

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
