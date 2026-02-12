import { useRef } from "react";
import { useWebSocket } from "../../Context/WebSocketContext";

export const ChatInput = ({ text, setText, onSend, conversationId, myUserId }) => {
  const { sendMessage } = useWebSocket();
  const typingTimeout = useRef(null);

  const handleTyping = (value) => {
    setText(value);

    sendMessage({
      type: "TYPING",
      conversation_id: conversationId,
    });

    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      sendMessage({
        type: "TYPING",
        conversation_id: conversationId,
      });
    }, 1500);
  };

  const handleSendMessage = () => {
    if (!text.trim()) return;

    onSend();


    sendMessage({
      type: "TYPING",
      conversation_id: conversationId,
      sender_id: myUserId,
      is_typing: false,
    });
  };

  return (
    <div className="chat-input-wrapper">
      <button className="icon-btn left">
        <i className="ri-attachment-2" />
      </button>

      <input
        className="chat-input"
        value={text}
        onChange={(e) => handleTyping(e.target.value)}
        onKeyDown={(e) =>
          e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSendMessage())
        }
        placeholder="Type a message…"
      />

      <button className="icon-btn send" onClick={handleSendMessage}>
        <i className="ri-send-plane-2-fill" />
      </button>
    </div>
  );
};
