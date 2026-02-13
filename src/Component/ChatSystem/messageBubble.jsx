import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { format, isToday, isYesterday } from "date-fns";
import axiosInstance from "../../Networking/Admin/APIs/AxiosInstance";
import "./chatSystem.css";

export const ChatMessages = ({ messages, myUserId, conversationId }) => {
  const bottomRef = useRef(null);
  const hasScrolledInitially = useRef(false);
  const prevMsgCount = useRef(0);

  const [localMessages, setLocalMessages] = useState(messages);

  // selection mode
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [selectionMode, setSelectionMode] = useState(false);

  useEffect(() => {
    setLocalMessages(messages);
  }, [messages]);

  const typingUsers = useSelector((state) => state.chatSystemSlice.typingUsers);
  const typing = typingUsers?.[conversationId] || {};

  // auto scroll
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

  // select message
  const toggleSelectMessage = (id) => {
    setSelectedMessages((prev) => {
      if (prev.includes(id)) {
        const updated = prev.filter((i) => i !== id);
        if (updated.length === 0) setSelectionMode(false);
        return updated;
      } else {
        setSelectionMode(true);
        return [...prev, id];
      }
    });
  };

  // delete selected
  const deleteSelectedMessages = async () => {
    if (!window.confirm("Delete selected messages?")) return;

    try {
      await Promise.all(
        selectedMessages.map((id) =>
          axiosInstance.delete(`/messenger/messages/${id}`),
        ),
      );

      setLocalMessages((prev) =>
        prev.filter((m) => !selectedMessages.includes(m.id)),
      );

      setSelectedMessages([]);
      setSelectionMode(false);
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  // group by date
  const groupMessagesByDate = (msgs) => {
    const groups = [];
    let currentDate = null;
    let currentGroup = [];

    msgs.forEach((msg) => {
      const msgDate = new Date(msg.created_at);
      const dateKey = format(msgDate, "yyyy-MM-dd");

      if (currentDate !== dateKey) {
        if (currentGroup.length > 0)
          groups.push({ date: currentDate, messages: currentGroup });

        currentDate = dateKey;
        currentGroup = [msg];
      } else currentGroup.push(msg);
    });

    if (currentGroup.length > 0)
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
    ([userId, isTyping]) => isTyping && Number(userId) !== Number(myUserId),
  );

  return (
    <div className="chat-messages">
      {/* HEADER BAR (VISIBLE ONLY WHEN SELECTING) */}
      {selectionMode && (
        <div className="selection-header">
          <span>{selectedMessages.length} selected</span>

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

                return (
                  <div
                    key={msg.id}
                    className={`message-row ${isMe ? "me" : "other"} ${
                      isSelected ? "selected" : ""
                    }`}
                    onClick={() => selectionMode && toggleSelectMessage(msg.id)}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      toggleSelectMessage(msg.id);
                    }}
                  >
                    <div className={`chat-bubble ${isMe ? "me" : "other"}`}>
                      <div className="message-content">
                        {msg.content && <div>{msg.content}</div>}

                        {msg.file_url && (
                          <div className="file-attachment">
                            {msg.file_type?.startsWith("image/") ? (
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
                                className="file-link"
                              >
                                {msg.file_name || "Download file"}
                              </a>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="message-footer">
                        <span>{format(new Date(msg.created_at), "HH:mm")}</span>

                        {isMe && (
                          <i
                            className={
                              msg.read
                                ? "ri-check-double-line"
                                : "ri-check-line"
                            }
                          />
                        )}
                      </div>
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
