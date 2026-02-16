import { useRef, useState } from "react";
import { useWebSocket } from "../../Context/WebSocketContext";
import { useDispatch } from "react-redux";
import { uploadChatFileApi } from "../../Networking/User/APIs/ChatSystem/chatSystemApi";
import "./chatInput.css";

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
  const [pendingFile, setPendingFile] = useState(null);

  const handleTyping = (value) => {
    setText(value);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        120,
      )}px`;
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
    const hasText = text.trim().length > 0;
    const hasFile = pendingFile !== null;

    if (!hasText && !hasFile) return;

    const payload = {
      type: "NEW_MESSAGE",
      conversation_id: conversationId,
      sender_id: myUserId,
      content: text.trim(),
    };

    if (hasFile) payload.file_id = pendingFile.file_id;

    onSend(payload);

    setText("");
    setPendingFile(null);

    if (textareaRef.current) textareaRef.current.style.height = "auto";

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
      const file_id = result.file_id;

      let previewUrl = null;
      if (file.type.startsWith("image/")) {
        previewUrl = URL.createObjectURL(file);
      }

      setPendingFile({
        file_id,
        name: file.name,
        type: file.type,
        previewUrl,
      });
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const removePendingFile = () => {
    if (pendingFile?.previewUrl) {
      URL.revokeObjectURL(pendingFile.previewUrl);
    }
    setPendingFile(null);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="chat-input-container">
      {pendingFile && (
        <div className="attachment-bar">
          <div className="attachment-content">
            {pendingFile.type.startsWith("image/") ? (
              <img src={pendingFile.previewUrl} alt="Preview" />
            ) : (
              <div className="attachment-file">
                <i className="ri-file-line text-dark" />
                <span className="text-dark">{pendingFile.name}</span>
              </div>
            )}
          </div>

          <button className="attachment-remove" onClick={removePendingFile}>
            <i className="ri-close-line" />
          </button>
        </div>
      )}

      <div className="chat-input-row">
        <div className="input-actions">
          <button
            className={`action-btn ${showEmojiPicker ? "active" : ""}`}
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            <i className="ri-emotion-happy-line" />
          </button>

          <button
            className="action-btn"
            onClick={() => fileRef.current.click()}
            disabled={uploading || pendingFile}
          >
            {uploading ? (
              <i className="ri-loader-4-line spinning" />
            ) : (
              <i className="ri-attachment-2" />
            )}
          </button>

          <input
            type="file"
            ref={fileRef}
            hidden
            onChange={handleFileSelect}
            disabled={uploading || pendingFile}
          />
        </div>

        <textarea
          ref={textareaRef}
          style={{ color: "black" }}
          className="message-input"
          placeholder="Type a message"
          value={text}
          onChange={(e) => handleTyping(e.target.value)}
          onKeyDown={handleKeyPress}
          rows={1}
        />

        {text.trim() || pendingFile ? (
          <button
            className="send-btn"
            onClick={handleSendMessage}
            disabled={uploading}
          >
            <i className="ri-send-plane-fill" />
          </button>
        ) : (
          <button className="voice-btn">
            <i className="ri-mic-line" />
          </button>
        )}
      </div>
    </div>
  );
};
