import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { useWebSocket } from "../../Context/WebSocketContext";
import { fetchMessages } from "../../Networking/User/APIs/ChatSystem/chatSystemApi";
import ChatMessages from "./messageBubble";
import { ChatInput } from "./messageInput";
import { ChatHeader } from "./chatSystemHeader";
import { UserProfile } from "./userProfile";

export const ChatLayout = () => {
  const { conversationId } = useParams();
  const location = useLocation();

  const receiverId = location.state?.receiver_id;
  const name = location.state?.name;

  const dispatch = useDispatch();
  const { messages, userStatus } = useSelector(
    (state) => state.chatSystemSlice,
  );

  const { sendMessage, myUserId } = useWebSocket();
  const [showProfile, setShowProfile] = useState(false);
  const [text, setText] = useState("");

  useEffect(() => {
    if (conversationId) {
      dispatch(fetchMessages(conversationId));
    }
  }, [conversationId, dispatch]);

  useEffect(() => {
    if (conversationId) {
      sendMessage({
        type: "JOIN_CONVERSATION",
        conversation_id: Number(conversationId),
      });
    }
  }, [conversationId, sendMessage]);

  const allMessages = useMemo(() => {
    return [...messages].sort(
      (a, b) => new Date(a.created_at) - new Date(b.created_at),
    );
  }, [messages]);

  const handleSend = () => {
    if (!text.trim()) return;

    sendMessage({
      type: "NEW_MESSAGE",
      conversation_id: Number(conversationId),
      sender_id: myUserId,
      // receiver_id: conversationId,
      content: text.trim(),
    });

    setText("");
  };

  return (
    <div className="chat-container">
      <ChatHeader
        name={name}
        receiverId={receiverId}
        status={userStatus[receiverId]}
        onProfileClick={() => setShowProfile(true)}
      />

      <ChatMessages messages={allMessages} myUserId={myUserId} />

      <ChatInput text={text} setText={setText} onSend={handleSend} />

      <UserProfile
        open={showProfile}
        onClose={() => setShowProfile(false)}
        userId={receiverId}
        name={name}
      />
    </div>
  );
};
