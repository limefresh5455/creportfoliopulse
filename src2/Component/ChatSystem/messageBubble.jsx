import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { format, isToday, isYesterday } from "date-fns";
import axiosInstance from "../../Networking/Admin/APIs/AxiosInstance";
import "./chatSystem.css";
import {
  fetchFileUrl,
  fetchMessages,
} from "../../Networking/User/APIs/ChatSystem/chatSystemApi";

const SpinnerIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#fff"
    strokeWidth="2.5"
    strokeLinecap="round"
    style={{ animation: "spin 0.8s linear infinite" }}
  >
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
  </svg>
);

export const ChatMessages = ({ messages, myUserId, conversationId }) => {
  const dispatch = useDispatch();

  const fileUrls = useSelector((s) => s.chatSystemSlice.fileUrls);
  const typingUsers = useSelector((s) => s.chatSystemSlice.typingUsers);

  const [selectedMessages, setSelectedMessages] = useState([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [loadingFileId, setLoadingFileId] = useState(null);

  const scrollRef = useRef(null);
  const atBottomRef = useRef(true);
  const prevMessagesLengthRef = useRef(messages.length);
  const lastMessageRef = useRef(null);

  const typing = typingUsers?.[conversationId] || {};

  useEffect(() => {
    setPage(1);
    setLoadingMore(false);
    atBottomRef.current = true;
    prevMessagesLengthRef.current = messages.length;
  }, [conversationId]);

  const handleScroll = () => {
    const el = scrollRef.current;

    if (!el) return;

    const threshold = 50;
    atBottomRef.current =
      el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
    if (!loadingMore && el.scrollTop < 5) {
      setLoadingMore(true);
      const oldHeight = el.scrollHeight;
      console.log(conversationId, "conversationId in message");

      dispatch(fetchMessages({ conversationId, page: page + 1 }))
        .then(() => {
          const newHeight = scrollRef.current.scrollHeight;
          scrollRef.current.scrollTop = newHeight - oldHeight;
          setPage((p) => p + 1);
        })
        .catch((err) => {
          console.error("Failed to load older messages", err);
        })
        .finally(() => {
          setLoadingMore(false);
        });
    }
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !messages.length) return;

    const lastMsg = messages[messages.length - 1];

    const isNewMessage =
      lastMessageRef.current && lastMsg.id !== lastMessageRef.current.id;

    if (isNewMessage && !loadingMore) {
      el.scrollTop = el.scrollHeight;
    }

    lastMessageRef.current = lastMsg;
  }, [messages, loadingMore]);

  const handleFileClick = async (msg) => {
    let url = fileUrls[msg.file_id];

    try {
      if (!url && msg.file_id) {
        setLoadingFileId(msg.file_id);

        const res = await dispatch(fetchFileUrl(msg.file_id));

        if (fetchFileUrl.fulfilled.match(res)) {
          url = res.payload.url;
        }
      }

      if (!url) return alert("File not available");

      window.open(url, "_blank");
    } catch {
      alert("Failed to load file");
    } finally {
      setLoadingFileId(null);
    }
  };

  const deleteSelectedMessages = async () => {
    if (!window.confirm("Delete selected messages?")) return;

    try {
      await Promise.all(
        selectedMessages.map((id) =>
          axiosInstance.delete(`/messenger/messages/${id}`),
        ),
      );
      setSelectedMessages([]);
      setSelectionMode(false);
    } catch {
      alert("Delete failed");
    }
  };

  const toggleSelect = (id) => {
    setSelectedMessages((prev) => {
      if (prev.includes(id)) {
        const updated = prev.filter((i) => i !== id);
        if (!updated.length) setSelectionMode(false);
        return updated;
      }
      setSelectionMode(true);
      return [...prev, id];
    });
  };

  const groupMessagesByDate = (msgs) => {
    const groups = [];
    let current = null;
    let arr = [];

    msgs.forEach((msg) => {
      const d = format(new Date(msg.created_at), "yyyy-MM-dd");

      if (current !== d) {
        if (arr.length) groups.push({ date: current, messages: arr });
        current = d;
        arr = [msg];
      } else arr.push(msg);
    });

    if (arr.length) groups.push({ date: current, messages: arr });
    return groups;
  };

  const formatDateLabel = (d) => {
    const date = new Date(d);
    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "Yesterday";
    return format(date, "MMMM d, yyyy");
  };

  const groupedMessages = groupMessagesByDate(messages);

  const someoneTyping = Object.entries(typing).some(
    ([id, val]) => val && Number(id) !== Number(myUserId),
  );

  return (
    <div
      className="chat-messages"
      ref={scrollRef}
      onScroll={handleScroll}
      style={{ overflowY: "auto", height: "100%" }}
    >
      {selectionMode && (
        <div className="selection-header">
          <span>{selectedMessages.length} selected</span>
          <div className="actions">
            <button onClick={deleteSelectedMessages}>
              <i className="ri-delete-bin-line" />
            </button>
            <button
              onClick={() => {
                setSelectionMode(false);
                setSelectedMessages([]);
              }}
            >
              <i className="ri-close-line" />
            </button>
          </div>
        </div>
      )}

      {!messages.length ? (
        <div className="no-messages">No messages yet</div>
      ) : (
        <>
          {loadingMore && (
            <div className="chat-loader text-center">
              <SpinnerIcon />
            </div>
          )}

          {groupedMessages.map((group, i) => (
            <div key={i}>
              <div className="date-divider">{formatDateLabel(group.date)}</div>

              {group.messages.map((msg) => {
                const isMe = Number(msg.sender_id) === Number(myUserId);
                const selected = selectedMessages.includes(msg.id);

                return (
                  <div
                    key={msg.id}
                    className={`message-row ${isMe ? "me" : "other"} ${
                      selected ? "selected" : ""
                    }`}
                    onClick={() => selectionMode && toggleSelect(msg.id)}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      toggleSelect(msg.id);
                    }}
                  >
                    <div className={`chat-bubble ${isMe ? "me" : "other"}`}>
                      {msg.content && <div>{msg.content}</div>}

                      {msg.file_name && (
                        <div className="file-attachment">
                          {msg.file_name.match(
                            /\.(jpg|jpeg|png|gif|webp)$/i,
                          ) ? (
                            loadingFileId === msg.file_id ? (
                              <div className="file-loader">Loading...</div>
                            ) : (
                              <img
                                src={msg.file_url || fileUrls[msg.file_id]}
                                className="chat-image"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleFileClick(msg);
                                }}
                                alt=""
                              />
                            )
                          ) : (
                            <div
                              className="file-card"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleFileClick(msg);
                              }}
                            >
                              {loadingFileId === msg.file_id
                                ? "Loading..."
                                : `📄 ${msg.file_name}`}
                            </div>
                          )}
                        </div>
                      )}

                      <div className="message-time">
                        {format(new Date(msg.created_at), "HH:mm")}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </>
      )}

      {loadingMore && (
        <div className="chat-loader">Loading more messages...</div>
      )}
      {someoneTyping && <div className="typing">Typing...</div>}
    </div>
  );
};
