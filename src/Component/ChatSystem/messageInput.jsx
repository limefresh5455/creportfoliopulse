import { useRef, useState } from "react";
import { useWebSocket } from "../../Context/WebSocketContext";
import { useDispatch } from "react-redux";
import { uploadChatFileApi } from "../../Networking/User/APIs/ChatSystem/chatSystemApi";

export const ChatInput = ({
  text,
  setText,
  onSend,
  conversationId,
  myUserId,
}) => {
  const dispatch = useDispatch();
  const { sendMessage } = useWebSocket();
  const typingTimeout = useRef(null);
  const textareaRef = useRef(null);
  const fileRef = useRef(null);

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [uploading, setUploading] = useState(false);

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
    if (!text.trim() && !fileRef.current?.files?.length) return;

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

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", "chatting");

    try {
      setUploading(true);

      const result = await dispatch(uploadChatFileApi(formData)).unwrap();

      if (result?.url) {
        onSend({
          text,
          file: result.url,
          fileName: file.name,
          fileType: file.type,
        });

        setText("");
      }
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setUploading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
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
        <button className="action-btn" onClick={() => fileRef.current.click()}>
          <i className="ri-attachment-2" />
        </button>

        <input type="file" ref={fileRef} hidden onChange={handleFileSelect} />
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
  );
};
