import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";

const ChatMessages = ({ messages, myUserId, conversationId }) => {
  const bottomRef = useRef(null);
  const hasScrolledInitially = useRef(false);
  const prevMsgCount = useRef(0);

  const typingUsers = useSelector(
    (state) => state.chatSystemSlice.typingUsers
  );
  const typing = typingUsers[conversationId] || {};

  useEffect(() => {
    if (messages.length === 0) return;

    if (!hasScrolledInitially.current) {
      bottomRef.current?.scrollIntoView({ behavior: "auto" });
      hasScrolledInitially.current = true;
      prevMsgCount.current = messages.length;
      return;
    }

    if (messages.length > prevMsgCount.current) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      prevMsgCount.current = messages.length;
    }
  }, [messages]);

  return (
    <div className="chat-messages">
      {messages.map((msg) => {
        const isMe = Number(msg.sender_id) === Number(myUserId);
        return (
          <div
            key={msg.id}
            className={`chat-bubble ${isMe ? "me" : "other"}`}
          >
            {msg.content}
          </div>
        );
      })}

      {Object.entries(typing).map(([userId, isTyping]) => {
        if (isTyping && Number(userId) !== Number(myUserId)) {
          return (
            <div key={userId} className="typing-indicator">
              User {userId} is typing...
            </div>
          );
        }
        return null;
      })}

      <div ref={bottomRef} />
    </div>
  );
};

export default ChatMessages;
