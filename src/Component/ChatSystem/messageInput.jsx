import { useRef, useState } from "react";
import { useWebSocket } from "../../Context/WebSocketContext";

export const ChatInput = ({
  text,
  setText,
  onSend,
  conversationId,
  myUserId,
}) => {
  const { sendMessage } = useWebSocket();
  const typingTimeout = useRef(null);
  const textareaRef = useRef(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleTyping = (value) => {
    setText(value);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }

    sendMessage({
      type: "TYPING",
      conversation_id: conversationId,
      is_typing: true,
    });

    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      sendMessage({
        type: "TYPING",
        conversation_id: conversationId,
        is_typing: false,
      });
    }, 1500);
  };

  const handleSendMessage = () => {
    if (!text.trim()) return;

    onSend();

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    sendMessage({
      type: "TYPING",
      conversation_id: conversationId,
      sender_id: myUserId,
      is_typing: false,
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      <style>{`
        .chat-input-container {
          background: #202C33;
          padding: 10px 16px;
          display: flex;
          align-items: flex-end;
          gap: 8px;
          border-top: 1px solid #2A3942;
          position: relative;
        }

        .input-actions {
          display: flex;
          gap: 8px;
          align-items: center;
          padding-bottom: 6px;
        }

        .action-btn {
          background: transparent;
          border: none;
          color: #8696A0;
          cursor: pointer;
          padding: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: background 0.2s;
          font-size: 24px;
        }

        .action-btn:hover {
          background: #2A3942;
        }

        .action-btn:active {
          transform: scale(0.95);
        }

        .action-btn.active {
          color: #00A884;
        }

        .input-wrapper {
          flex: 1;
          background: #2A3942;
          border-radius: 8px;
          display: flex;
          align-items: flex-end;
          padding: 10px 12px;
          min-height: 44px;
        }

        .message-input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          color: #E9EDEF;
          font-size: 15px;
          font-family: 'Segoe UI', Helvetica, Arial, sans-serif;
          resize: none;
          max-height: 120px;
          overflow-y: auto;
          line-height: 20px;
          padding: 2px 0;
        }

        .message-input::placeholder {
          color: #8696A0;
        }

        .message-input::-webkit-scrollbar {
          width: 4px;
        }

        .message-input::-webkit-scrollbar-thumb {
          background: #374045;
          border-radius: 2px;
        }

        .send-btn {
          background: transparent;
          border: none;
          color: #00A884;
          cursor: pointer;
          padding: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: all 0.2s;
          font-size: 24px;
          margin-bottom: -2px;
        }

        .send-btn:hover {
          background: #2A3942;
        }

        .send-btn:active {
          transform: scale(0.95);
        }

        .send-btn:disabled {
          color: #667781;
          cursor: not-allowed;
        }

        .send-btn:disabled:hover {
          background: transparent;
        }

        .voice-btn {
          color: #8696A0;
        }

        .voice-btn:hover {
          background: #2A3942;
        }

        /* Emoji picker placeholder */
        .emoji-picker {
          position: absolute;
          bottom: 70px;
          left: 16px;
          background: #202C33;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.4);
          z-index: 1000;
          border: 1px solid #2A3942;
        }

        .emoji-picker-content {
          color: #8696A0;
          font-size: 14px;
          text-align: center;
          max-width: 200px;
        }

        .emoji-picker-close {
          position: absolute;
          top: 8px;
          right: 8px;
          background: transparent;
          border: none;
          color: #8696A0;
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          font-size: 18px;
        }

        .emoji-picker-close:hover {
          color: #E9EDEF;
        }

        /* Character count for long messages */
        .char-count {
          position: absolute;
          bottom: 14px;
          right: 70px;
          font-size: 11px;
          color: #8696A0;
          opacity: 0;
          transition: opacity 0.2s;
        }

        .char-count.visible {
          opacity: 1;
        }

        .char-count.warning {
          color: #F39C12;
        }

        .char-count.error {
          color: #EA4335;
        }

        @media (max-width: 768px) {
          .chat-input-container {
            padding: 8px 12px;
          }

          .input-actions {
            gap: 4px;
          }

          .action-btn {
            padding: 6px;
            font-size: 22px;
          }

          .send-btn {
            font-size: 22px;
          }

          .emoji-picker {
            left: 12px;
            right: 12px;
            bottom: 65px;
          }
        }
      `}</style>

      <div className="chat-input-container">
        <div className="input-actions">
          <button
            className={`action-btn ${showEmojiPicker ? "active" : ""}`}
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            aria-label="Emoji"
            title="Emoji"
          >
            <i className="ri-emotion-happy-line" />
          </button>
          <button
            className="action-btn"
            aria-label="Attach file"
            title="Attach"
          >
            <i className="ri-attachment-2" />
          </button>
        </div>

        <div className="input-wrapper">
          <textarea
            ref={textareaRef}
            className="message-input"
            placeholder="Type a message"
            value={text}
            onChange={(e) => handleTyping(e.target.value)}
            onKeyDown={handleKeyPress}
            rows={1}
          />
        </div>

        {text.trim() ? (
          <button
            className="send-btn"
            onClick={handleSendMessage}
            aria-label="Send message"
            title="Send"
          >
            <i className="ri-send-plane-fill" />
          </button>
        ) : (
          <button
            className="action-btn voice-btn"
            aria-label="Voice message"
            title="Voice message"
          >
            <i className="ri-mic-line" />
          </button>
        )}

        {text.length > 500 && (
          <div
            className={`char-count visible ${
              text.length > 900 ? "error" : text.length > 700 ? "warning" : ""
            }`}
          >
            {text.length}/1000
          </div>
        )}

        {showEmojiPicker && (
          <div className="emoji-picker">
            <button
              className="emoji-picker-close"
              onClick={() => setShowEmojiPicker(false)}
            >
              <i className="ri-close-line" />
            </button>
            <div className="emoji-picker-content">
              <div style={{ fontSize: "40px", marginBottom: "10px" }}>😊</div>
              <p>Emoji picker placeholder</p>
              <p style={{ fontSize: "12px", marginTop: "8px", opacity: 0.7 }}>
                You can integrate a library like emoji-picker-react here
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
