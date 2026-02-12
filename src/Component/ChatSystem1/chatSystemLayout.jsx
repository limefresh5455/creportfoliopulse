import React, { useEffect, useMemo, useState, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { useWebSocket } from "../../Context/WebSocketContext";
import {
  fetchMessages,
  uploadfileChatSystemAPi,
} from "../../Networking/User/APIs/ChatSystem/chatSystemApi";
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

  console.log(receiverId, name, "name and reciever id");

  const dispatch = useDispatch();
  const { messages, userStatus } = useSelector(
    (state) => state.chatSystemSlice,
  );
  console.log(userStatus, "userStatus");

  const { sendMessage, myUserId, sendTypingIndicator, setCurrentConversation } =
    useWebSocket();
  const [showProfile, setShowProfile] = useState(false);
  const [text, setText] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (conversationId && receiverId) {
      setCurrentConversation(Number(conversationId), receiverId);
    }
  }, [conversationId, receiverId, setCurrentConversation]);

  useEffect(() => {
    if (conversationId) {
      console.log("Fetching messages for conversation:", conversationId);
      dispatch(fetchMessages(conversationId));
    }
  }, [conversationId, dispatch]);

  const allMessages = useMemo(() => {
    return [...messages].sort(
      (a, b) => new Date(a.created_at) - new Date(b.created_at),
    );
  }, [messages]);

  const handleSend = () => {
    if (!text.trim() || !receiverId || !myUserId) {
      console.error("Missing required data for sending message:", {
        text: text.trim(),
        receiverId,
        myUserId,
      });
      return;
    }

    const success = sendMessage({
      type: "NEW_MESSAGE",
      receiver_id: receiverId,
      content: text.trim(),
    });

    if (!success) {
      console.error("Failed to send message via WebSocket");
    }

    if (receiverId) {
      sendTypingIndicator(receiverId, false);
    }

    setText("");
  };

  const handleFileUpload = (file) => {
    if (!file || !receiverId || !myUserId) return;

    dispatch(
      uploadfileChatSystemAPi({
        file,
        receiverId,
        myUserId,
      }),
    )
      .unwrap()
      .then((data) => {
        console.log("File uploaded successfully:", data.fileId);

        sendMessage({
          type: "NEW_MESSAGE",
          receiver_id: data.receiverId,
          content: data.fileName,
          file_id: data.fileId,
        });
      })
      .catch((err) => {
        console.error("File upload failed:", err);
        alert("Failed to upload file. Please try again.");
      });
  };

  const handleAttachmentClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 30 * 1024 * 1024) {
        alert("File size should be less than 10MB");
        return;
      }

      const allowedTypes = [
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

      if (!allowedTypes.includes(file.type)) {
        alert("Please select a valid file type (images, PDF, DOC, TXT, XLS)");
        return;
      }

      handleFileUpload(file);
    }

    e.target.value = null;
  };

  return (
    <div className="chat-container">
      <ChatHeader
        name={name}
        receiverId={receiverId}
        onProfileClick={() => console.log("Profile clicked")}
        onBack={() => navigate(-1)}
      />

      {uploading && (
        <div
          style={{
            padding: "10px",
            background: "#f5f5f5",
            borderBottom: "1px solid #ddd",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  height: "6px",
                  background: "#e0e0e0",
                  borderRadius: "3px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    background: "#007bff",
                    width: `${uploadProgress}%`,
                    transition: "width 0.3s ease",
                  }}
                />
              </div>
            </div>
            <span style={{ fontSize: "12px", color: "#666" }}>
              {uploadProgress}%
            </span>
          </div>
        </div>
      )}

      <ChatMessages
        messages={allMessages}
        myUserId={myUserId}
        conversationId={conversationId}
        receiverId={receiverId}
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
        accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx,.txt,.xls,.xlsx"
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
