import { useRef, useState } from "react";

export const ChatInput = ({
  text,
  setText,
  onSend,
  receiverId,
  sendTypingIndicator,
  uploading,
  onFileUpload,
}) => {
  const typingTimeout = useRef(null);

  const handleTyping = (value) => {
    setText(value);

    if (receiverId && sendTypingIndicator && !uploading) {
      sendTypingIndicator(receiverId, true);

      clearTimeout(typingTimeout.current);
      typingTimeout.current = setTimeout(() => {
        sendTypingIndicator(receiverId, false);
      }, 3000);
    }
  };

  const handleSendMessage = () => {
    if (!text.trim() || uploading) return;

    if (receiverId && sendTypingIndicator) {
      sendTypingIndicator(receiverId, false);
    }

    clearTimeout(typingTimeout.current);

    onSend();
    setText("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey && !uploading) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file || uploading) return;

    if (onFileUpload) {
      onFileUpload(file);
    }
    e.target.value = "";
  };

  return (
    <div
      className="chat-input-wrapper"
      style={{
        display: "flex",
        padding: "10px",
        borderTop: "1px solid #ddd",
        background: "#fff",
        alignItems: "center",
        gap: "10px",
        opacity: uploading ? 0.6 : 1,
      }}
    >
      <button
        className="icon-btn attachment"
        onClick={() => document.getElementById("fileInput")?.click()}
        disabled={uploading}
        style={{
          background: "none",
          border: "none",
          fontSize: "20px",
          cursor: uploading ? "not-allowed" : "pointer",
          color: uploading ? "#999" : "#666",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "40px",
          height: "40px",
          borderRadius: "50%",
        }}
      >
        <i className="ri-attachment-2" />
      </button>

      <input
        type="file"
        id="fileInput"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      <input
        className="chat-input"
        value={text}
        onChange={(e) => handleTyping(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={uploading ? "Uploading file..." : "Type a message..."}
        disabled={uploading}
        style={{
          flex: 1,
          padding: "10px 15px",
          border: "1px solid #ddd",
          borderRadius: "20px",
          outline: "none",
          fontSize: "14px",
          background: uploading ? "#f9f9f9" : "#fff",
          cursor: uploading ? "not-allowed" : "text",
        }}
      />

      <button
        className="icon-btn send"
        onClick={handleSendMessage}
        disabled={!text.trim() || uploading}
        style={{
          background: !text.trim() || uploading ? "#ccc" : "#007bff",
          color: "white",
          border: "none",
          borderRadius: "50%",
          width: "40px",
          height: "40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: !text.trim() || uploading ? "not-allowed" : "pointer",
        }}
      >
        <i className="ri-send-plane-2-fill" />
      </button>
    </div>
  );
};
