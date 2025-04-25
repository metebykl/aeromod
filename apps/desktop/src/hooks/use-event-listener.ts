import { useEffect, useRef } from "react";

export const useEventListener = <K extends keyof DocumentEventMap>(
  type: K,
  handler: (event: DocumentEventMap[K]) => void
) => {
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    const listener = (event: DocumentEventMap[K]) => {
      handlerRef.current(event);
    };

    document.addEventListener(type, listener);
    return () => {
      document.removeEventListener(type, listener);
    };
  }, [type]);
};
