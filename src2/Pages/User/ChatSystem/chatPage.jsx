import React, { useEffect, useState } from "react";

import { ChatLayout } from "../../../../src/Component/ChatSystem/chatSystemLayout"

export const ChatPage = () => {
  const [isMobile, setIsMobile] = useState(false);


  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="chat-page">
      <ChatLayout />
    </div>
  );
};


