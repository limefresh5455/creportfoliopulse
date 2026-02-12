import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { formatDistanceToNow } from "date-fns";

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

  const conversationId = activeConversation?.id;

  const isTyping = useMemo(
    () => typingUsers?.[conversationId]?.[receiverId] === true,
    [typingUsers, conversationId, receiverId],
  );
  const isOnline = useMemo(() => status?.online, [status]);

  return (
    <>
      <style>{`
        .chat-header1 {
          background: #202C33;
          padding: 10px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid #2A3942;
          min-height: 60px;
        }

        .chat-user {
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          flex: 1;
          min-width: 0;
        }

        .chat-user:hover .avatar {
          opacity: 0.9;
        }

        .avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, #00A884 0%, #005C4B 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-size: 16px;
          font-weight: 500;
          flex-shrink: 0;
          position: relative;
          transition: opacity 0.2s;
        }

        .status-dot {
          position: absolute;
          bottom: 0;
          right: 0;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: 2px solid #202C33;
        }

        .status-dot.online {
          background: #00A884;
        }

        .status-dot.offline {
          background: #667781;
        }

        .user-info {
          flex: 1;
          min-width: 0;
        }

        .user-name {
          color: #E9EDEF;
          font-size: 16px;
          font-weight: 500;
          margin-bottom: 2px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .user-status {
          font-size: 13px;
          line-height: 18px;
        }

        .typing {
          color: #00A884;
        }

        .online {
          color: #8696A0;
        }

        .offline {
          color: #8696A0;
        }

        .chat-actions {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-left: 12px;
        }

        .chat-actions i {
          color: #8696A0;
          font-size: 24px;
          cursor: pointer;
          padding: 8px;
          border-radius: 50%;
          transition: background 0.2s;
        }

        .chat-actions i:hover {
          background: #2A3942;
        }

        .chat-actions i:active {
          transform: scale(0.95);
        }

        @media (max-width: 768px) {
          .chat-header1 {
            padding: 8px 12px;
          }

          .avatar {
            width: 36px;
            height: 36px;
            font-size: 14px;
          }

          .user-name {
            font-size: 15px;
          }

          .user-status {
            font-size: 12px;
          }

          .chat-actions {
            gap: 6px;
          }

          .chat-actions i {
            font-size: 22px;
            padding: 6px;
          }
        }

        /* Typing animation */
        @keyframes typing {
          0%, 60%, 100% {
            opacity: 0.3;
          }
          30% {
            opacity: 1;
          }
        }

        .typing::after {
          content: '';
          display: inline-block;
          animation: typing 1.4s infinite;
        }
      `}</style>

      <div className="chat-header1">
        <div className="chat-user" onClick={onProfileClick}>
          <div className="avatar">
            {!isGroup && (
              <span
                className={`status-dot ${isOnline ? "online" : "offline"}`}
              />
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
    </>
  );
};

const formatLastSeen = (time) => {
  if (!time) return "offline";
  return formatDistanceToNow(new Date(time), { addSuffix: true });
};
