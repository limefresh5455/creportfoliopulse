import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { format, isToday, isYesterday } from "date-fns";
import axiosInstance from "../../Networking/Admin/APIs/AxiosInstance";
import { deleteMessageSocket } from "../../Networking/User/Slice/chatSystemSlice";
import "./chatSystem.css";
import { fetchMessages } from "../../Networking/User/APIs/ChatSystem/chatSystemApi";

const normalizeSocketMessage = (data) => {
  return {
    id: data.message_id,
    sender_id: data.sender_id,
    sender_name: data.sender_name,
    content: data.content || "",
    created_at: data.created_at,
    conversation_id: data.conversation_id,
    read: false,

    file_id: data.file_id || null,
    file_url: data.file_url || null,
    file_name: data.file_name || null,
    file_type: data.file_name
      ? data.file_name.split(".").pop().toLowerCase()
      : null,
  };
};

export const ChatMessages = ({ messages, myUserId, conversationId }) => {
  const dispatch = useDispatch();
  const bottomRef = useRef(null);
  const hasScrolledInitially = useRef(false);
  const prevMsgCount = useRef(0);
  const longPressTimerRef = useRef(null);
  const containerRef = useRef(null);

  const [localMessages, setLocalMessages] = useState([]);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [deletingIds, setDeletingIds] = useState(new Set());
  const [longPressedMsgId, setLongPressedMsgId] = useState(null);

  useEffect(() => {
    if (conversationId) {
      dispatch(fetchMessages(conversationId));
    }
  }, [conversationId, dispatch]);

  useEffect(() => {
    setLocalMessages([]);
    setSelectedMessages([]);
    setSelectionMode(false);
    setLongPressedMsgId(null);

    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    hasScrolledInitially.current = false;
    prevMsgCount.current = 0;
  }, [conversationId]);

  useEffect(() => {
    setLocalMessages((prev) => {
      const existingIds = new Set(prev.map((m) => m.id));
      const merged = [...prev];

      messages.forEach((msg) => {
        if (!existingIds.has(msg.id)) merged.push(msg);
      });

      return merged.sort(
        (a, b) => new Date(a.created_at) - new Date(b.created_at),
      );
    });
  }, [messages]);

  useEffect(() => {
    if (!window.chatSocket) return;

    const socket = window.chatSocket;

    const handleMessage = (event) => {
      const data = JSON.parse(event.data);

      if (
        data.type === "NEW_MESSAGE" &&
        Number(data.conversation_id) === Number(conversationId)
      ) {
        const normalized = normalizeSocketMessage(data);

        setLocalMessages((prev) => {
          if (prev.some((m) => m.id === normalized.id)) return prev;

          return [...prev, normalized].sort(
            (a, b) => new Date(a.created_at) - new Date(b.created_at),
          );
        });
      }

      if (
        data.type === "DELETE_MESSAGE" &&
        Number(data.conversation_id) === Number(conversationId)
      ) {
        setLocalMessages((prev) =>
          prev.filter((m) => m.id !== data.message_id),
        );
      }
    };

    socket.addEventListener("message", handleMessage);
    return () => socket.removeEventListener("message", handleMessage);
  }, [conversationId]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setLongPressedMsgId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const typingUsers = useSelector((state) => state.chatSystemSlice.typingUsers);
  const typing = typingUsers?.[conversationId] || {};

  useEffect(() => {
    if (localMessages.length === 0) return;

    if (!hasScrolledInitially.current) {
      bottomRef.current?.scrollIntoView({ behavior: "auto" });
      hasScrolledInitially.current = true;
      prevMsgCount.current = localMessages.length;
      return;
    }

    if (localMessages.length > prevMsgCount.current) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      prevMsgCount.current = localMessages.length;
    }
  }, [localMessages]);

  const startLongPress = (id) => {
    longPressTimerRef.current = setTimeout(() => {
      setLongPressedMsgId(id);
    }, 500);
  };

  const cancelLongPress = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const toggleSelectMessage = (id) => {
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

  const deleteSingleMessage = async (id) => {
    if (!window.confirm("Delete this message?")) return;
    if (deletingIds.has(id)) return;

    setDeletingIds((p) => new Set(p).add(id));

    try {
      await axiosInstance.delete(`/messenger/messages/${id}`);

      dispatch(
        deleteMessageSocket({
          conversation_id: conversationId,
          message_id: id,
        }),
      );

      setLocalMessages((prev) => prev.filter((m) => m.id !== id));
      setLongPressedMsgId(null);
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    } finally {
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const deleteSelectedMessages = async () => {
    if (!window.confirm("Delete selected messages?")) return;

    const ids = selectedMessages;
    setDeletingIds((p) => new Set([...p, ...ids]));

    try {
      await Promise.all(
        ids.map((id) => axiosInstance.delete(`/messenger/messages/${id}`)),
      );

      ids.forEach((id) =>
        dispatch(
          deleteMessageSocket({
            conversation_id: conversationId,
            message_id: id,
          }),
        ),
      );

      setLocalMessages((prev) => prev.filter((m) => !ids.includes(m.id)));
      setSelectedMessages([]);
      setSelectionMode(false);
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    } finally {
      setDeletingIds((prev) => {
        const next = new Set(prev);
        ids.forEach((id) => next.delete(id));
        return next;
      });
    }
  };

  const groupMessagesByDate = (msgs) => {
    const groups = [];
    let currentDate = null;
    let currentGroup = [];

    msgs.forEach((msg) => {
      const key = format(new Date(msg.created_at), "yyyy-MM-dd");

      if (currentDate !== key) {
        if (currentGroup.length)
          groups.push({ date: currentDate, messages: currentGroup });
        currentDate = key;
        currentGroup = [msg];
      } else {
        currentGroup.push(msg);
      }
    });

    if (currentGroup.length)
      groups.push({ date: currentDate, messages: currentGroup });

    return groups;
  };

  const formatDateLabel = (dateStr) => {
    const date = new Date(dateStr);
    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "Yesterday";
    return format(date, "MMMM d, yyyy");
  };

  const groupedMessages = groupMessagesByDate(localMessages);

  const someoneIsTyping = Object.entries(typing).some(
    ([id, v]) => v && Number(id) !== Number(myUserId),
  );

  return (
    <div className="chat-messages" ref={containerRef}>
      {selectionMode && (
        <div className="selection-header">
          <span>{selectedMessages.length} selected</span>

          <button
            onClick={deleteSelectedMessages}
            disabled={deletingIds.size > 0}
          >
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
      )}

      {localMessages.length === 0 ? (
        <div className="no-messages">
          <i className="ri-chat-3-line" />
          <div>No messages yet</div>
        </div>
      ) : (
        <>
          {groupedMessages.map((group, i) => (
            <div key={i}>
              <div className="date-divider">
                <span>{formatDateLabel(group.date)}</span>
              </div>

              {group.messages.map((msg) => {
                const isMe = Number(msg.sender_id) === Number(myUserId);
                const isSelected = selectedMessages.includes(msg.id);
                const isDeleting = deletingIds.has(msg.id);
                const showDelete =
                  longPressedMsgId === msg.id && !selectionMode;

                const isImage =
                  msg.file_name &&
                  /\.(jpg|jpeg|png|gif|webp)$/i.test(msg.file_name);

                return (
                  <div
                    key={msg.id}
                    className={`message-row ${isMe ? "me" : "other"} ${
                      isSelected ? "selected" : ""
                    } ${isDeleting ? "deleting" : ""}`}
                    onClick={() => selectionMode && toggleSelectMessage(msg.id)}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      toggleSelectMessage(msg.id);
                    }}
                    onTouchStart={() => startLongPress(msg.id)}
                    onTouchEnd={cancelLongPress}
                    onTouchMove={cancelLongPress}
                    onMouseDown={() => startLongPress(msg.id)}
                    onMouseUp={cancelLongPress}
                    onMouseLeave={cancelLongPress}
                  >
                    <div className={`chat-bubble ${isMe ? "me" : "other"}`}>
                      <div className="message-content">
                        {msg.content && (
                          <div className="text-light">{msg.content}</div>
                        )}

                        {msg.file_url && (
                          <div className="file-attachment">
                            {isImage ? (
                              <img
                                src={msg.file_url}
                                alt="attachment"
                                className="chat-image"
                              />
                            ) : (
                              <a
                                href={msg.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: "#38bdf8" }}
                              >
                                {msg.file_name || "Download file"}
                              </a>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="message-footer">
                        <span className="text-light">
                          {format(new Date(msg.created_at), "HH:mm")}
                        </span>

                        {/* {isMe && !selectionMode && (
                          <i
                            className={
                              msg.read
                                ? "ri-check-double-line"
                                : "ri-check-line"
                            }
                          />
                        )} */}
                      </div>

                      {showDelete && isMe && (
                        <button
                          className="long-press-delete"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteSingleMessage(msg.id);
                          }}
                          disabled={isDeleting}
                        >
                          {isDeleting ? (
                            <i className="ri-loader-4-line spinning" />
                          ) : (
                            <i className="ri-delete-bin-line" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}

          {someoneIsTyping && <div className="typing-indicator">Typing...</div>}
        </>
      )}

      <div ref={bottomRef} />
    </div>
  );
};
