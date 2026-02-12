import { useEffect, useRef, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { downloadFileApi } from "../../Networking/User/APIs/ChatSystem/chatSystemApi";

const ChatMessages = ({ messages = [], myUserId, conversationId }) => {
  const bottomRef = useRef(null);
  const firstScroll = useRef(false);
  const dispatch = useDispatch();

  const { typingUsers, loading } = useSelector(
    (state) => state.chatSystemSlice,
  );

  useEffect(() => {
    if (!messages.length) return;

    if (!firstScroll.current) {
      bottomRef.current?.scrollIntoView({ behavior: "auto" });
      firstScroll.current = true;
    } else {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const downloadFile = (fileId, fileName) => {
    dispatch(downloadFileApi({ fileId, fileName }));
  };

  const typingList = useMemo(() => {
    if (!conversationId || !typingUsers?.[conversationId]) return [];
    return Object.entries(typingUsers[conversationId]).filter(
      ([uid, val]) => val && Number(uid) !== Number(myUserId),
    );
  }, [typingUsers, conversationId, myUserId]);

  if (loading) {
    return (
      <div className="flex-grow-1 overflow-auto p-3 d-flex flex-column gap-2">
        {[1, 2, 3, 4, 5, 6].map((i) => {
          const isMe = i % 2 === 0;

          return (
            <div
              key={i}
              className={`d-flex ${isMe ? "justify-content-end" : "justify-content-start"}`}
            >
              <div
                className={`placeholder-glow p-3 rounded-4 shadow-sm ${
                  isMe ? "bg-secondary bg-opacity-25" : "bg-light"
                }`}
                style={{
                  width: `${Math.floor(Math.random() * 25) + 40}%`,
                  maxWidth: "70%",
                }}
              >
                <span className="placeholder col-8 rounded-pill"></span>
                <span className="placeholder col-5 mt-2 rounded-pill"></span>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="chat-messages overflow-auto p-3 d-flex flex-column gap-2">
      {messages.map((msg) => {
        const isMe = Number(msg.sender_id) === Number(myUserId);

        return (
          <div
            key={msg.id}
            className={`chat-bubble-wrapper ${isMe ? "me" : "other"}`}
          >
            <div
              className={`chat-bubble ${isMe ? "me-bubble" : "other-bubble"}`}
            >
              {msg.file_id ? (
                <span
                  onClick={() => downloadFile(msg.file_id, msg.content)}
                  className="file-link"
                >
                  {msg.content}
                </span>
              ) : (
                msg.content
              )}
              {msg.is_temp && <span className="sending-status">Sending…</span>}
            </div>
            <div className="timestamp">
              {new Date(msg.created_at).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
        );
      })}

      {typingList.length > 0 && (
        <div className="typing-indicator">
          <div className="dot"></div>
          <div className="dot"></div>
          <div className="dot"></div>
        </div>
      )}

      <div ref={bottomRef} />

      <style>{`
        .chat-messages {
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .chat-bubble-wrapper {
          display: flex;
          flex-direction: column;
          max-width: 70%;
        }

        .chat-bubble-wrapper.me {
          align-self: flex-end;
        }

        .chat-bubble-wrapper.other {
          align-self: flex-start;
        }

        .chat-bubble {
          padding: 10px 14px;
          border-radius: 20px;
          position: relative;
          word-break: break-word;
          display: inline-block;
          max-width: 100%;
        }

        .me-bubble {
          background-color: #dcf8c6; /* WhatsApp green */
          color: #000;
          border-bottom-right-radius: 4px;
        }

        .other-bubble {
          background-color: #fff;
          color: #000;
          border-bottom-left-radius: 4px;
          box-shadow: 0 1px 2px rgba(0,0,0,0.2);
        }

        .timestamp {
          font-size: 0.7rem;
          color: #999;
          margin-top: 2px;
          align-self: flex-end;
        }

        .file-link {
          text-decoration: underline;
          cursor: pointer;
          color: #065fd4;
        }

        .sending-status {
          display: block;
          font-size: 0.7rem;
          color: #999;
          margin-top: 2px;
        }

        .typing-indicator {
          display: flex;
          gap: 4px;
          align-items: center;
          padding: 6px 10px;
          background: #f0f0f0;
          border-radius: 20px;
          width: fit-content;
        }

        .typing-indicator .dot {
          width: 8px;
          height: 8px;
          background: #888;
          border-radius: 50%;
          animation: blink 1.4s infinite both;
        }

        .typing-indicator .dot:nth-child(2) { animation-delay: 0.2s; }
        .typing-indicator .dot:nth-child(3) { animation-delay: 0.4s; }

        @keyframes blink {
          0% { opacity: 0.2; }
          20% { opacity: 1; }
          100% { opacity: 0.2; }
        }
      `}</style>
    </div>
  );
};

export default ChatMessages;
