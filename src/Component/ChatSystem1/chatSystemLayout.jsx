import React, { useEffect, useMemo, useState, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { useWebSocket } from "../../Context/WebSocketContext";
import { uploadfileChatSystemAPi } from "../../Networking/User/APIs/ChatSystem/chatSystemApi";
import ChatMessages from "./messageBubble";
import { ChatInput } from "./messageInput";
import { ChatHeader } from "./chatSystemHeader";
import { UserProfile } from "./userProfile";

export const ChatLayout = () => {
  const { conversationId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const receiverId = location.state?.receiver_id;
  const name = location.state?.name;

  const dispatch = useDispatch();
  const { messages } = useSelector((state) => state.chatSystemSlice);

  const { sendMessage, myUserId, sendTypingIndicator, setCurrentConversation } =
    useWebSocket();

  const [showProfile, setShowProfile] = useState(false);
  const [text, setText] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const fileInputRef = useRef(null);

  /* ---------------- SET ACTIVE CONVERSATION ---------------- */
  useEffect(() => {
    if (conversationId && receiverId) {
      setCurrentConversation(Number(conversationId), receiverId);
    }
  }, [conversationId, receiverId, setCurrentConversation]);

  /* ---------------- SORT MESSAGES ---------------- */
  const allMessages = useMemo(() => {
    return [...messages].sort(
      (a, b) => new Date(a.created_at) - new Date(b.created_at),
    );
  }, [messages]);

  /* ---------------- SEND MESSAGE ---------------- */
  const handleSend = () => {
    if (!text.trim() || !receiverId || !myUserId) return;

    sendMessage({
      type: "NEW_MESSAGE",
      receiver_id: receiverId,
      content: text.trim(),
    });

    sendTypingIndicator(receiverId, false);
    setText("");
  };

  /* ---------------- FILE UPLOAD ---------------- */
  const handleFileUpload = (file) => {
    if (!file || !receiverId || !myUserId) return;

    setUploading(true);

    dispatch(uploadfileChatSystemAPi({ file, receiverId, myUserId }))
      .unwrap()
      .then((data) => {
        sendMessage({
          type: "NEW_MESSAGE",
          receiver_id: data.receiverId,
          content: data.fileName,
          file_id: data.fileId,
        });
      })
      .catch(() => {
        alert("File upload failed");
      })
      .finally(() => {
        setUploading(false);
        setUploadProgress(0);
      });
  };

  const handleAttachmentClick = () => {
    fileInputRef.current.click();
  };

  /* ---------------- FILE VALIDATION ---------------- */
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 30 * 1024 * 1024) {
      alert("File must be under 30MB");
      return;
    }

    const allowed = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];

    if (!allowed.includes(file.type)) {
      alert("Invalid file type");
      return;
    }

    handleFileUpload(file);
    e.target.value = null;
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="chat-container">
      <ChatHeader
        name={name}
        receiverId={receiverId}
        onProfileClick={() => setShowProfile(true)}
        onBack={() => navigate(-1)}
      />

      {uploading && (
        <div
          style={{
            padding: 10,
            background: "#f5f5f5",
            borderBottom: "1px solid #ddd",
          }}
        >
          <div style={{ height: 6, background: "#ddd", borderRadius: 4 }}>
            <div
              style={{
                height: "100%",
                width: `${uploadProgress}%`,
                background: "#0d6efd",
                transition: "0.3s",
              }}
            />
          </div>
        </div>
      )}

      <ChatMessages
        messages={allMessages}
        myUserId={myUserId}
        conversationId={conversationId}
      />

      <ChatInput
        text={text}
        setText={setText}
        onSend={handleSend}
        conversationId={conversationId}
        myUserId={myUserId}
        receiverId={receiverId}
        sendTypingIndicator={sendTypingIndicator}
        onAttachmentClick={handleAttachmentClick}
        uploading={uploading}
      />

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: "none" }}
      />

      <UserProfile
        open={showProfile}
        onClose={() => setShowProfile(false)}
        userId={receiverId}
        name={name}
      />
    </div>
  );
};
