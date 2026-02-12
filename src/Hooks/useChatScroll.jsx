import { useEffect, useRef } from "react";

const useChatScroll = (messages) => {
  const containerRef = useRef(null);
  const bottomRef = useRef(null);
  const prevHeightRef = useRef(0);


  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const isNearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight <
      120;

    if (isNearBottom) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);


  const preserveScroll = () => {
    const container = containerRef.current;
    if (!container) return;

    const newHeight = container.scrollHeight;
    container.scrollTop = newHeight - prevHeightRef.current;
  };


  const saveScrollHeight = () => {
    const container = containerRef.current;
    if (!container) return;

    prevHeightRef.current = container.scrollHeight;
  };

  return {
    containerRef,
    bottomRef,
    saveScrollHeight,
    preserveScroll,
  };
};

export default useChatScroll;
