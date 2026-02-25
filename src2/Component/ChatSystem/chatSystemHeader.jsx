import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { formatDistanceToNow } from "date-fns";
import "./ChatSystem.css";

export const ChatHeader = ({
  name,
  receiverId,
  status,
  onProfileClick,
  isGroup,
  participants,
}) => {
  const { typingUsers, activeConversation } = useSelector(
    (state) => state.chatSystemSlice,
  );
  console.log(participants, "participants");

  const conversationId = activeConversation?.id;

  const isTyping = useMemo(
    () => typingUsers?.[conversationId]?.[receiverId] === true,
    [typingUsers, conversationId, receiverId],
  );
  const isOnline = useMemo(() => status?.online, [status]);

  return (
    <div className="chat-header1">
      <div className="chat-user mx-4 mx-md-0" onClick={onProfileClick}>
        <div className="avatar">
          {!isGroup && (
            <span className={`status-dot ${isOnline ? "online" : "offline"}`} />
          )}
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
            {isGroup ? (
              <span className="offline">
                {participants?.length || 0} participants
              </span>
            ) : isTyping ? (
              <span className="typing">typing</span>
            ) : isOnline ? (
              <span className="online">online</span>
            ) : (
              <span className="offline">
                {status?.last_seen
                  ? `last seen ${formatLastSeen(status.last_seen)}`
                  : "offline"}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="chat-actions">
        <i className="ri-search-line" />
        <i className="ri-more-2-fill" />
      </div>
    </div>
  );
};

const formatLastSeen = (time) => {
  if (!time) return "offline";
  return formatDistanceToNow(new Date(time), { addSuffix: true });
};
