import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { format, isToday, isYesterday, isSameDay } from "date-fns";

export const ChatMessages = ({ messages, myUserId, conversationId }) => {
  const bottomRef = useRef(null);
  const hasScrolledInitially = useRef(false);
  const prevMsgCount = useRef(0);

  const typingUsers = useSelector((state) => state.chatSystemSlice.typingUsers);
  const typing = typingUsers?.[conversationId] || {};

  useEffect(() => {
    if (messages.length === 0) return;

    if (!hasScrolledInitially.current) {
      bottomRef.current?.scrollIntoView({ behavior: "auto" });
      hasScrolledInitially.current = true;
      prevMsgCount.current = messages.length;
      return;
    }

    if (messages.length > prevMsgCount.current) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      prevMsgCount.current = messages.length;
    }
  }, [messages]);

  const groupMessagesByDate = (messages) => {
    const groups = [];
    let currentDate = null;
    let currentGroup = [];

    messages.forEach((msg) => {
      const msgDate = new Date(msg.created_at);
      const dateKey = format(msgDate, "yyyy-MM-dd");

      if (currentDate !== dateKey) {
        if (currentGroup.length > 0) {
          groups.push({ date: currentDate, messages: currentGroup });
        }
        currentDate = dateKey;
        currentGroup = [msg];
      } else {
        currentGroup.push(msg);
      }
    });

    if (currentGroup.length > 0) {
      groups.push({ date: currentDate, messages: currentGroup });
    }

    return groups;
  };

  const formatDateLabel = (dateStr) => {
    const date = new Date(dateStr);
    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "Yesterday";
    return format(date, "MMMM d, yyyy");
  };

  const groupedMessages = groupMessagesByDate(messages);

  const someoneIsTyping = Object.entries(typing).some(
    ([userId, isTyping]) => isTyping && Number(userId) !== Number(myUserId),
  );

  return (
    <>
      <style>{`
        .chat-messages {
          flex: 1;
          overflow-y: auto;
          background: #0B141A;
          background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23182229' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
      
          position: relative;
        }

        .date-divider {
          text-align: center;
          margin: 20px 0 15px;
          position: relative;
        }

        .date-label {
          display: inline-block;
          background: #182229;
          color: #8696A0;
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 12.5px;
          font-weight: 500;
          box-shadow: 0 1px 2px rgba(0,0,0,0.2);
        }

        .message-row {
          display: flex;
          margin-bottom: 8px;
          animation: slideIn 0.2s ease-out;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .message-row.me {
          justify-content: flex-end;
        }

        .message-row.other {
          justify-content: flex-start;
        }

        .chat-bubble {
          max-width: 65%;
          padding: 6px 7px 8px 9px;
          border-radius: 8px;
          position: relative;
          word-wrap: break-word;
          box-shadow: 0 1px 0.5px rgba(0,0,0,0.13);
        }

        .chat-bubble.me {
          background: #005C4B;
          border-radius: 8px 8px 0 8px;
        }

        .chat-bubble.other {
          background: #202C33;
          border-radius: 8px 8px 8px 0;
        }

        .message-content {
          color: #E9EDEF;
          font-size: 14.2px;
          line-height: 19px;
          margin-bottom: 4px;
          white-space: pre-wrap;
          word-break: break-word;
        }

        .message-footer {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 4px;
          margin-top: 2px;
        }

        .message-time {
          color: rgba(255, 255, 255, 0.45);
          font-size: 11px;
          line-height: 15px;
        }

        .chat-bubble.other .message-time {
          color: #8696A0;
        }

        .message-status {
          display: flex;
          align-items: center;
        }

        .message-status i {
          font-size: 16px;
          color: rgba(255, 255, 255, 0.45);
        }

        .message-status.read i {
          color: #53BDEB;
        }

        /* Typing indicator */
        .typing-indicator-wrapper {
          display: flex;
          justify-content: flex-start;
          margin-bottom: 8px;
          animation: slideIn 0.2s ease-out;
        }

        .typing-indicator {
          background: #202C33;
          border-radius: 8px 8px 8px 0;
          padding: 12px 16px;
          box-shadow: 0 1px 0.5px rgba(0,0,0,0.13);
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .typing-dots {
          display: flex;
          gap: 4px;
        }

        .typing-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #8696A0;
          animation: typingAnimation 1.4s infinite;
        }

        .typing-dot:nth-child(1) {
          animation-delay: 0s;
        }

        .typing-dot:nth-child(2) {
          animation-delay: 0.2s;
        }

        .typing-dot:nth-child(3) {
          animation-delay: 0.4s;
        }

        @keyframes typingAnimation {
          0%, 60%, 100% {
            transform: translateY(0);
            opacity: 0.5;
          }
          30% {
            transform: translateY(-6px);
            opacity: 1;
          }
        }

        /* Empty state */
        .no-messages {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: #8696A0;
          text-align: center;
          padding: 40px;
        }

        .no-messages i {
          font-size: 80px;
          margin-bottom: 20px;
          opacity: 0.3;
        }

        .no-messages-text {
          font-size: 16px;
          margin-bottom: 8px;
        }

        /* Scrollbar styling */
        .chat-messages::-webkit-scrollbar {
          width: 6px;
        }

        .chat-messages::-webkit-scrollbar-track {
          background: transparent;
        }

        .chat-messages::-webkit-scrollbar-thumb {
          background: #374045;
          border-radius: 3px;
        }

        .chat-messages::-webkit-scrollbar-thumb:hover {
          background: #4A5156;
        }

        @media (max-width: 768px) {
          .chat-messages {
            padding: 15px 4%;
          }

          .chat-bubble {
            max-width: 80%;
          }
        }
      `}</style>

      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="no-messages">
            <i className="ri-chat-3-line" />
            <div className="no-messages-text">No messages yet</div>
            <div style={{ fontSize: "14px", opacity: 0.7 }}>
              Send a message to start the conversation
            </div>
          </div>
        ) : (
          <>
            {groupedMessages.map((group, groupIndex) => (
              <div key={groupIndex}>
                <div className="date-divider">
                  <span className="date-label">
                    {formatDateLabel(group.date)}
                  </span>
                </div>
                {group.messages.map((msg) => {
                  const isMe = Number(msg.sender_id) === Number(myUserId);
                  return (
                    <div
                      key={msg.id}
                      className={`message-row ${isMe ? "me" : "other"}`}
                    >
                      <div className={`chat-bubble ${isMe ? "me" : "other"}`}>
                        <div className="message-content">{msg.content}</div>
                        <div className="message-footer">
                          <span className="message-time">
                            {format(new Date(msg.created_at), "HH:mm")}
                          </span>
                          {isMe && (
                            <div
                              className={`message-status ${msg.read ? "read" : ""}`}
                            >
                              <i
                                className={
                                  msg.read
                                    ? "ri-check-double-line"
                                    : "ri-check-line"
                                }
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}

            {someoneIsTyping && (
              <div className="typing-indicator-wrapper">
                <div className="typing-indicator">
                  <div className="typing-dots">
                    <div className="typing-dot" />
                    <div className="typing-dot" />
                    <div className="typing-dot" />
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        <div ref={bottomRef} />
      </div>
    </>
  );
};
