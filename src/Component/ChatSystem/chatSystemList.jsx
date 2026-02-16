import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchConversations,
  fetchMessages,
} from "../../Networking/User/APIs/ChatSystem/chatSystemApi";
import { setActiveConversation } from "../../Networking/User/Slice/chatSystemSlice";

const S = {
  iconBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#AEBAC1",
    padding: 8,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background 0.15s",
    fontSize: 20,
  },

  list: {
    flex: 1,
    overflowY: "auto",
    overflowX: "hidden",
  },

  item: (selected) => ({
    display: "flex",
    alignItems: "center",
    padding: "10px 16px",
    gap: 12,
    cursor: "pointer",
    background: selected ? "#2A3942" : "transparent",
    borderBottom: "1px solid #1F2C34",
    transition: "background 0.15s",
    userSelect: "none",
    WebkitUserSelect: "none",
    position: "relative",
  }),

  avatar: (isGroup) => ({
    width: 50,
    height: 50,
    minWidth: 50,
    borderRadius: "50%",
    background: isGroup ? "#00735C" : "#2C3E50",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: isGroup ? 22 : 20,
    fontWeight: 600,
    color: "#fff",
    flexShrink: 0,
    position: "relative",
  }),
  onlineDot: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: "50%",
    background: "#00A884",
    border: "2px solid #111B21",
  },

  selectionRing: {
    position: "absolute",
    inset: 0,
    borderRadius: "50%",
    border: "2.5px solid #00A884",
    background: "rgba(0,168,132,0.15)",
  },
  checkmark: {
    position: "absolute",
    inset: 0,
    borderRadius: "50%",
    background: "#00A884",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 18,
    color: "#fff",
  },

  textBlock: {
    flex: 1,
    minWidth: 0,
  },
  topRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 3,
  },
  name: {
    fontSize: 16,
    fontWeight: 500,
    color: "#E9EDEF",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    maxWidth: "70%",
  },
  timestamp: (hasUnread) => ({
    fontSize: 12,
    color: hasUnread ? "#00A884" : "#8696A0",
    flexShrink: 0,
  }),
  bottomRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  preview: {
    fontSize: 14,
    color: "#8696A0",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    flex: 1,
  },

  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    background: "#00A884",
    color: "#fff",
    fontSize: 11,
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0 5px",
    marginLeft: 6,
    flexShrink: 0,
  },

  skelItem: {
    display: "flex",
    alignItems: "center",
    padding: "10px 16px",
    gap: 12,
    borderBottom: "1px solid #1F2C34",
  },
  skelAvatar: {
    width: 50,
    height: 50,
    minWidth: 50,
    borderRadius: "50%",
    background: "#1F2C34",
    animation: "pulse 1.5s infinite",
  },
  skelLines: { flex: 1, display: "flex", flexDirection: "column", gap: 8 },
  skelLine: (w) => ({
    height: 12,
    borderRadius: 6,
    background: "#1F2C34",
    width: w,
    animation: "pulse 1.5s infinite",
  }),
};

const SearchIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#8696A0"
    strokeWidth="2"
    strokeLinecap="round"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const DotsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="#AEBAC1">
    <circle cx="12" cy="5" r="1.5" />
    <circle cx="12" cy="12" r="1.5" />
    <circle cx="12" cy="19" r="1.5" />
  </svg>
);
const DeleteIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#E9EDEF"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14H6L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4h6v2" />
  </svg>
);
const NewChatIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="#E9EDEF">
    <path d="M20 2H4C2.9 2 2 2.9 2 4v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 12H6l-2 2V4h16v10z" />
    <path d="M13 11h-2v-2h2v2zm0-4h-2V5h2v2z" />
  </svg>
);
const BackIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#E9EDEF"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const formatTime = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now - d) / 86400000);
  if (diffDays === 0)
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return d.toLocaleDateString([], { weekday: "short" });
  return d.toLocaleDateString([], {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
};

const getInitials = (name) =>
  name ? name.trim().charAt(0).toUpperCase() : "?";

export const ChatList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { conversations = [], loading } = useSelector(
    (state) => state.chatSystemSlice,
  );

  const [showMenu, setShowMenu] = useState(false);
  const [selectedConversations, setSelectedConversations] = useState(new Set());
  const [search, setSearch] = useState("");
  const [unreadMap, setUnreadMap] = useState({});

  const menuRef = useRef(null);
  const pressTimer = useRef(null);

  useEffect(() => {
    if (conversations.length) {
      setUnreadMap((prev) => {
        const next = { ...prev };
        conversations.forEach((c) => {
          if (!(c.id in next)) {
            next[c.id] = c.unreadCount ?? 0;
          }
        });
        return next;
      });
    }
  }, [conversations]);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target))
        setShowMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    dispatch(fetchConversations());
  }, [dispatch]);

  const filtered = conversations.filter((c) =>
    c.receiver_name?.toLowerCase().includes(search.toLowerCase()),
  );

  const handleChatClick = (conversation) => {
    if (selectedConversations.size > 0) {
      toggleSelect(conversation.id);
      return;
    }

    setUnreadMap((prev) => ({ ...prev, [conversation.id]: 0 }));

    dispatch(setActiveConversation(conversation));
    dispatch(fetchMessages(conversation.id));
    navigate(`/chat/${conversation.id}`, {
      state: {
        receiver_id: conversation.receiver_id,
        name: conversation.receiver_name,
        is_group: conversation.is_group,
        participants: conversation.participants,
      },
    });
  };

  const toggleSelect = (id) => {
    setSelectedConversations((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handlePressStart = (conversation) => {
    pressTimer.current = setTimeout(() => {
      toggleSelect(conversation.id);
    }, 600);
  };

  const handlePressEnd = () => clearTimeout(pressTimer.current);

  const handleDelete = () => {
    if (selectedConversations.size > 0) {
      console.log("Delete IDs:", Array.from(selectedConversations));
      setSelectedConversations(new Set());
    }
  };

  const clearSelection = () => setSelectedConversations(new Set());

  const isSelecting = selectedConversations.size > 0;

  return (
    <>
      <div className="chat-root">
        {isSelecting ? (
          <div className="selection-header">
            <button className="icon-btn" onClick={clearSelection}>
              <BackIcon />
            </button>

            <span className="selection-count">
              {selectedConversations.size} selected
            </span>
            <div style={{ flex: 1 }} />
            <button className="icon-btn" onClick={handleDelete}>
              <DeleteIcon />
            </button>
          </div>
        ) : (
          <div className="chat-header2 mx-5 mx-md-0">
            <span className="chat-title">Chats</span>
            <div className="header-actions">
              <button
                className="icon-btn"
                onClick={() => navigate("/chat/users")}
                title="New Chat"
              >
                <NewChatIcon />
              </button>

              <div className="menu-wrapper" ref={menuRef}>
                <button
                  className="icon-btn"
                  onClick={() => setShowMenu((v) => !v)}
                >
                  <DotsIcon />
                </button>

                {showMenu && (
                  <div className="dropdown">
                    <div
                      className="menu-item"
                      onClick={() => {
                        navigate("/chat/users");
                        setShowMenu(false);
                      }}
                    >
                      💬 &nbsp;New Chat
                    </div>
                    <div
                      className="menu-item"
                      onClick={() => {
                        navigate("/chat/create-group");
                        setShowMenu(false);
                      }}
                    >
                      👥 &nbsp;New Group
                    </div>
                    <div
                      className="menu-item"
                      onClick={() => {
                        navigate("/settings");
                        setShowMenu(false);
                      }}
                    >
                      ⚙️ &nbsp;Settings
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {!isSelecting && (
          <div className="search-wrap">
            <div className="search-inner">
              <SearchIcon />
              <input
                className="search-input"
                placeholder="Search or start new chat"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        )}

        <div className="chat-list">
          {loading &&
            Array.from({ length: 7 }).map((_, i) => (
              <div className="skel-item">
                <div className="skel-avatar" />
                <div className="skel-lines">
                  <div className="skel-line" style={{ width: "55%" }} />
                  <div className="skel-line" style={{ width: "75%" }} />
                </div>
              </div>
            ))}

          {!loading && filtered.length === 0 && (
            <div className="empty">
              <span className="empty-icon">💬</span>
              <span className="empty-text">
                {search ? "No results found" : "No conversations yet"}
              </span>
            </div>
          )}

          {!loading &&
            filtered.map((conversation) => {
              const selected = selectedConversations.has(conversation.id);
              const unread = unreadMap[conversation.id] ?? 0;

              return (
                <div
                  key={conversation.id}
                  className={`chat-item ${selected ? "selected" : ""}`}
                  onClick={() => handleChatClick(conversation)}
                  onMouseDown={() => handlePressStart(conversation)}
                  onMouseUp={handlePressEnd}
                  onTouchStart={() => handlePressStart(conversation)}
                  onTouchEnd={handlePressEnd}
                >
                  <div style={{ position: "relative" }}>
                    <div
                      className={`avatar ${conversation.is_group ? "group" : ""}`}
                    >
                      {isSelecting ? (
                        selected ? (
                          <div className="checkmark">✓</div>
                        ) : (
                          <>
                            {conversation.is_group
                              ? "👥"
                              : getInitials(conversation.receiver_name)}
                            <div className="selection-ring" />
                          </>
                        )
                      ) : conversation.is_group ? (
                        "👥"
                      ) : (
                        getInitials(conversation.receiver_name)
                      )}
                    </div>
                    {!conversation.is_group && conversation.is_online && (
                      <div className="online-dot" />
                    )}
                  </div>

                  <div className="chat-textBlock">
                    <div className="chat-topRow">
                      <span className="chat-name">
                        {conversation.receiver_name || "Unknown"}
                      </span>
                      <span
                        className={`timestamp ${unread > 0 ? "unread" : ""}`}
                      >
                        {formatTime(
                          conversation.lastMessage?.created_at ||
                            conversation.created_at,
                        )}
                      </span>
                    </div>

                    <div className="chat-bottomRow">
                      <span className="chat-preview">
                        {conversation.lastMessage?.content || "No messages yet"}
                      </span>

                      {unread > 0 && (
                        <span className="chat-badge">
                          {unread > 99 ? "99+" : unread}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>

        {!isSelecting && (
          <button
            className="fab"
            onClick={() => navigate("/chat/users")}
            title="New Chat"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
              <path d="M20 2H4C2.9 2 2 2.9 2 4v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 9h-3v3h-2v-3H10V9h3V6h2v3h3v2z" />
            </svg>
          </button>
        )}
      </div>
    </>
  );
};
