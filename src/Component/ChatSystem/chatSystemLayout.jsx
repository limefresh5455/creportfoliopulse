import React, { useEffect, useMemo, useRef, useState } from "react";
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
  const { messages, userStatus, hasMore } = useSelector(
    (s) => s.chatSystemSlice,
  );

  const { sendMessage, myUserId } = useWebSocket();

  const [showProfile, setShowProfile] = useState(false);
  const [text, setText] = useState("");
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  const scrollRef = useRef(null);

  useEffect(() => {
    if (!conversationId) return;

    dispatch(clearMessages());
    setPage(1);

    dispatch(fetchMessages({ conversationId, page: 1 }));
  }, [conversationId, dispatch]);

  useEffect(() => {
    if (!conversationId) return;

    sendMessage({
      type: "JOIN_CONVERSATION",
      conversation_id: Number(conversationId),
    });
  }, [conversationId, sendMessage]);

  const handleScroll = async () => {
    const el = scrollRef.current;
    if (!el || loadingMore || !hasMore) return;

    if (el.scrollTop === 0) {
      setLoadingMore(true);

      const nextPage = page + 1;
      await dispatch(fetchMessages({ conversationId, page: nextPage }));

      setPage(nextPage);
      setLoadingMore(false);
    }
  };

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

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    el.scrollTop = el.scrollHeight;
  }, [messages.length]);

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

      <div ref={scrollRef} className="chat-scroll-area" onScroll={handleScroll}>
        <ChatMessages messages={allMessages} myUserId={myUserId} />

        {loadingMore && (
          <div className="chat-loader">Loading more messages...</div>
        )}
      </div>

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
