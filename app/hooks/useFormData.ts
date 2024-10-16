import React, { useEffect, useRef } from "react";

export default function useFormData(
  ref: React.MutableRefObject<HTMLFormElement>,
  callback?: (data: Record<string, string>) => void,
) {
  const flag = useRef(false);

  useEffect(() => {
    if (!flag.current) {
      flag.current = true;
      const formElement = ref.current;
      formElement.addEventListener("submit", (e) => {
        e.preventDefault();
        return;
      });
    }
  }, []);

  return;
}
