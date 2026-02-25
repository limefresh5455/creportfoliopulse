import { useEffect, useRef, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  downloadFileApi,
  fetchMessages,
} from "../../Networking/User/APIs/ChatSystem/chatSystemApi";
import { clearMessages } from "../../Networking/User/Slice/chatSystemSlice";

const ChatMessages = ({ messages = [], myUserId, conversationId }) => {
  const dispatch = useDispatch();

  const containerRef = useRef(null);
  const bottomRef = useRef(null);
  const firstScroll = useRef(false);
  const prevHeightRef = useRef(0);

  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const { typingUsers, loading } = useSelector(
    (state) => state.chatSystemSlice,
  );

  /* ---------------- CONVERSATION CHANGE ---------------- */
  useEffect(() => {
    if (!conversationId) return;

    setPage(1);
    setHasMore(true);
    firstScroll.current = false;

    dispatch(clearMessages());
    dispatch(fetchMessages({ conversationId, page: 1 }));
  }, [conversationId, dispatch]);

  /* ---------------- AUTO SCROLL ---------------- */
  useEffect(() => {
    if (!messages.length) return;

    if (!firstScroll.current) {
      bottomRef.current?.scrollIntoView({ behavior: "auto" });
      firstScroll.current = true;
    } else {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  /* ---------------- SCROLL PAGINATION ---------------- */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleScroll = async () => {
      if (el.scrollTop !== 0 || loadingMore || !hasMore) return;

      prevHeightRef.current = el.scrollHeight;

      setLoadingMore(true);

      const nextPage = page + 1;

      try {
        const res = await dispatch(
          fetchMessages({ conversationId, page: nextPage }),
        ).unwrap();

        if (!res?.messages?.length || !res?.nextPage) {
          setHasMore(false);
        } else {
          setPage(nextPage);
        }
      } catch {
        setHasMore(false);
      }

      setLoadingMore(false);

      setTimeout(() => {
        el.scrollTop = el.scrollHeight - prevHeightRef.current;
      }, 0);
    };

    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, [page, loadingMore, hasMore, conversationId, dispatch]);

  /* ---------------- DOWNLOAD ---------------- */
  const downloadFile = (fileId, fileName) => {
    dispatch(downloadFileApi({ fileId, fileName }));
  };

  /* ---------------- TYPING USERS ---------------- */
  const typingList = useMemo(() => {
    if (!conversationId || !typingUsers?.[conversationId]) return [];
    return Object.entries(typingUsers[conversationId]).filter(
      ([uid, val]) => val && Number(uid) !== Number(myUserId),
    );
  }, [typingUsers, conversationId, myUserId]);

  /* ---------------- LOADER ---------------- */
  if (loading && page === 1) {
    return (
      <div className="flex-grow-1 overflow-auto p-3 d-flex flex-column gap-2">
        {[1, 2, 3, 4, 5].map((i) => {
          const isMe = i % 2 === 0;
          return (
            <div
              key={i}
              className={`d-flex ${
                isMe ? "justify-content-end" : "justify-content-start"
              }`}
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
    <div
      ref={containerRef}
      className="chat-messages overflow-auto p-3 d-flex flex-column gap-2"
    >
      {loadingMore && (
        <div className="text-center">
          <div className="spinner-border spinner-border-sm" />
        </div>
      )}

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
        .chat-bubble-wrapper {
          display: flex;
          flex-direction: column;
          max-width: 70%;
        }
        .chat-bubble-wrapper.me { align-self: flex-end; }
        .chat-bubble-wrapper.other { align-self: flex-start; }

        .chat-bubble {
          padding: 10px 14px;
          border-radius: 20px;
          word-break: break-word;
        }

        .me-bubble {
          background: #dcf8c6;
          border-bottom-right-radius: 4px;
        }

        .other-bubble {
          background: #fff;
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
          padding: 6px 10px;
          background: #f0f0f0;
          border-radius: 20px;
          width: fit-content;
        }

        .dot {
          width: 8px;
          height: 8px;
          background: #888;
          border-radius: 50%;
          animation: blink 1.4s infinite both;
        }

        .dot:nth-child(2){ animation-delay:.2s }
        .dot:nth-child(3){ animation-delay:.4s }

        @keyframes blink {
          0%{opacity:.2}
          20%{opacity:1}
          100%{opacity:.2}
        }
      `}</style>
    </div>
  );
};

export default ChatMessages;
