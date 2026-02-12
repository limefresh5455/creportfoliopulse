import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { formatDistanceToNow } from "date-fns";

export const ChatHeader = ({ name, receiverId, onProfileClick, onBack }) => {
  const { typingUsers, activeConversation, userStatus } = useSelector(
    (state) => state.chatSystemSlice
  );

  const conversationId = activeConversation?.id;

  const isTyping = useMemo(() => {
    if (!conversationId || !receiverId) return false;
    return typingUsers?.[String(conversationId)]?.[String(receiverId)] === true;
  }, [typingUsers, conversationId, receiverId]);

  const status = userStatus?.[String(receiverId)];
  const isOnline = status?.online === true;

  return (
    <div className="chat-header1 d-flex align-items-center justify-content-between p-2 shadow-sm">
      

      <div className="d-flex align-items-center gap-2">

        <button
          onClick={onBack}
          className="btn btn-dark btn-sm ms-md-0 ms-5"
          style={{ borderRadius: "50%" }}
          aria-label="Go back"
        >
          <i className="ri-arrow-left-line"></i>
        </button>

  
        <div className="chat-user d-flex align-items-center gap-2" onClick={onProfileClick}>
          <div className="avatar position-relative">
            <span className={`status-dot ${isOnline ? "online" : "offline"}`} />
            {name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div className="user-info">
          <div
            className="user-name"
            aria-label={`${name} is ${isOnline ? "online" : "offline"}`}
          >
            {name || "Unnamed User"}
          </div>

          <div className="user-status">
            {isTyping ? (
              <span className="typing">typing…</span>
            ) : isOnline ? (
              <span className="online">Online</span>
            ) : (
              <span className="offline">
                Last seen {formatLastSeen(status?.last_seen)}
              </span>
            )}
          </div>
        </div>
        </div>
      </div>

    
      <div className="chat-actions">
        <i className="ri-more-2-fill"></i>
      </div>

    
    </div>
  );
};

const formatLastSeen = (time) => {
  if (!time) return "offline";
  return formatDistanceToNow(new Date(time), { addSuffix: true });
};
