import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useWebSocket } from "../../Context/WebSocketContext";
import { fetchMessages } from "../../Networking/User/APIs/ChatSystem/chatSystemApi";
import { ChatHeader } from "./chatSystemHeader";
import { ChatMessages } from "./messageBubble";
import { ChatInput } from "./messageInput";
import { UserProfile } from "./userProfile";
import "./chatSystem.css";
import { clearMessages } from "../../Networking/User/Slice/chatSystemSlice";

export const ChatLayout = () => {
  const { conversationId } = useParams();

  const location = useLocation();
  const navigate = useNavigate();

  const receiverId = location.state?.receiver_id;
  const name = location.state?.name;
  const isGroup = location.state?.is_group;
  const participants = location.state?.participants;

  const dispatch = useDispatch();
  const { messages, userStatus } = useSelector((s) => s.chatSystemSlice);

  const { sendMessage, myUserId } = useWebSocket();

  const [showProfile, setShowProfile] = useState(false);
  const [text, setText] = useState("");

  useEffect(() => {
    if (!conversationId) return;
    dispatch(clearMessages());
    if (conversationId) {
      dispatch(fetchMessages({ conversationId, page: 1 }));
    }
  }, [conversationId, dispatch]);

  useEffect(() => {
    if (!conversationId) return;
    sendMessage({
      type: "JOIN_CONVERSATION",
      conversation_id: Number(conversationId),
    });
  }, [conversationId, sendMessage]);

  const allMessages = useMemo(() => {
    return [...messages].sort(
      (a, b) => new Date(a.created_at) - new Date(b.created_at),
    );
  }, [messages]);

  const handleSend = (payload) => {
    sendMessage({
      type: "NEW_MESSAGE",
      conversation_id: Number(conversationId),
      sender_id: myUserId,
      receiver_id: receiverId,
      content: payload.content || "",
      file_id: payload.file_id,
    });
  };

  return (
    <div className="chat-root">
      <ChatHeader
        name={name}
        receiverId={receiverId}
        isGroup={isGroup}
        participants={participants}
        status={userStatus?.[receiverId]}
        onProfileClick={() => setShowProfile(true)}
      />

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
      />

      <UserProfile
        open={showProfile}
        onClose={() => setShowProfile(false)}
        userId={receiverId}
        name={name}
        isGroup={isGroup}
        participants={participants}
        conversationId={conversationId}
        onExitGroup={() => navigate("/conversations")}
      />
    </div>
  );
};
