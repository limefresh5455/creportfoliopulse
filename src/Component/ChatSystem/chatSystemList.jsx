import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchConversations,
  fetchMessages,
} from "../../Networking/User/APIs/ChatSystem/chatSystemApi";
import { setActiveConversation } from "../../Networking/User/Slice/chatSystemSlice";

const S = {
  root: {
    display: "flex",
    flexDirection: "column",
    height: "100dvh",
    width: "100%",
    margin: "0 auto",
    background: "#111B21",
    fontFamily: "'Segoe UI', Helvetica, Arial, sans-serif",
    color: "#E9EDEF",
    overflowY: "hidden",
    position: "relative",
  },

  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 16px",
    background: "#202C33",
    minHeight: 56,
    zIndex: 10,
    flexShrink: 0,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 600,
    color: "#E9EDEF",
    letterSpacing: 0.2,
  },
  headerActions: {
    display: "flex",
    alignItems: "center",
    gap: 4,
  },
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

  selectionHeader: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "10px 16px",
    background: "#2A3942",
    minHeight: 56,
    zIndex: 10,
    flexShrink: 0,
  },
  selectionCount: {
    fontSize: 18,
    fontWeight: 500,
    color: "#00A884",
  },

  searchWrap: {
    padding: "6px 12px 8px",
    background: "#111B21",
    flexShrink: 0,
  },
  searchInner: {
    display: "flex",
    alignItems: "center",
    background: "#202C33",
    borderRadius: 8,
    padding: "6px 12px",
    gap: 8,
  },
  searchInput: {
    flex: 1,
    background: "none",
    border: "none",
    outline: "none",
    color: "#E9EDEF",
    fontSize: 15,
    caretColor: "#00A884",
  },

  menuWrapper: { position: "relative" },
  dropdown: {
    position: "absolute",
    top: "100%",
    right: 0,
    background: "#233138",
    borderRadius: 4,
    boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
    minWidth: 180,
    zIndex: 100,
    overflow: "hidden",
    animation: "fadeIn 0.1s ease",
  },
  menuItem: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "13px 20px",
    cursor: "pointer",
    fontSize: 15,
    color: "#E9EDEF",
    transition: "background 0.1s",
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

  empty: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    color: "#8696A0",
    gap: 12,
    paddingTop: 60,
  },
  emptyIcon: { fontSize: 56, opacity: 0.4 },
  emptyText: { fontSize: 16, fontWeight: 400 },

  fab: {
    position: "absolute",
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: "50%",
    background: "#00A884",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 16px rgba(0,168,132,0.45)",
    zIndex: 20,
    transition: "transform 0.15s, box-shadow 0.15s",
  },
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
      <style>{`
        @keyframes pulse {
          0%,100% { opacity:0.4 } 50% { opacity:0.7 }
        }
        @keyframes fadeIn {
          from { opacity:0; transform:translateY(-6px) }
          to   { opacity:1; transform:translateY(0) }
        }
        ::-webkit-scrollbar { width:4px }
        ::-webkit-scrollbar-track { background:transparent }
        ::-webkit-scrollbar-thumb { background:#2C3E50; border-radius:4px }
        .chat-item:hover { background:#182229 !important }
        .menu-item:hover { background:#374248 !important }
        .icon-btn:hover { background:rgba(255,255,255,0.08) !important }
        .fab:hover { transform:scale(1.06); box-shadow:0 6px 20px rgba(0,168,132,0.55) !important }
      `}</style>

      <div style={S.root}>
        {isSelecting ? (
          <div style={S.selectionHeader}>
            <button
              className="icon-btn"
              style={S.iconBtn}
              onClick={clearSelection}
            >
              <BackIcon />
            </button>
            <span style={S.selectionCount}>
              {selectedConversations.size} selected
            </span>
            <div style={{ flex: 1 }} />
            <button
              className="icon-btn"
              style={S.iconBtn}
              onClick={handleDelete}
            >
              <DeleteIcon />
            </button>
          </div>
        ) : (
          <div style={S.header}>
            <span style={S.headerTitle}>Chats</span>
            <div style={S.headerActions}>
              <button
                className="icon-btn"
                style={S.iconBtn}
                onClick={() => navigate("/chat/users")}
                title="New Chat"
              >
                <NewChatIcon />
              </button>

              <div style={S.menuWrapper} ref={menuRef}>
                <button
                  className="icon-btn"
                  style={S.iconBtn}
                  onClick={() => setShowMenu((v) => !v)}
                >
                  <DotsIcon />
                </button>

                {showMenu && (
                  <div style={S.dropdown}>
                    <div
                      className="menu-item"
                      style={S.menuItem}
                      onClick={() => {
                        navigate("/chat/users");
                        setShowMenu(false);
                      }}
                    >
                      💬 &nbsp;New Chat
                    </div>
                    <div
                      className="menu-item"
                      style={S.menuItem}
                      onClick={() => {
                        navigate("/chat/create-group");
                        setShowMenu(false);
                      }}
                    >
                      👥 &nbsp;New Group
                    </div>
                    <div
                      className="menu-item"
                      style={S.menuItem}
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
          <div style={S.searchWrap}>
            <div style={S.searchInner}>
              <SearchIcon />
              <input
                style={S.searchInput}
                placeholder="Search or start new chat"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        )}

        <div style={S.list}>
          {loading &&
            Array.from({ length: 7 }).map((_, i) => (
              <div key={i} style={S.skelItem}>
                <div style={S.skelAvatar} />
                <div style={S.skelLines}>
                  <div style={S.skelLine("55%")} />
                  <div style={S.skelLine("75%")} />
                </div>
              </div>
            ))}

          {!loading && filtered.length === 0 && (
            <div style={S.empty}>
              <span style={S.emptyIcon}>💬</span>
              <span style={S.emptyText}>
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
                  className="chat-item"
                  style={S.item(selected)}
                  onClick={() => handleChatClick(conversation)}
                  onMouseDown={() => handlePressStart(conversation)}
                  onMouseUp={handlePressEnd}
                  onTouchStart={() => handlePressStart(conversation)}
                  onTouchEnd={handlePressEnd}
                >
                  <div style={{ position: "relative", flexShrink: 0 }}>
                    <div style={S.avatar(conversation.is_group)}>
                      {isSelecting ? (
                        selected ? (
                          <div style={S.checkmark}>✓</div>
                        ) : (
                          <>
                            {conversation.is_group
                              ? "👥"
                              : getInitials(conversation.receiver_name)}
                            <div style={S.selectionRing} />
                          </>
                        )
                      ) : conversation.is_group ? (
                        "👥"
                      ) : (
                        getInitials(conversation.receiver_name)
                      )}
                    </div>
                    {!conversation.is_group && conversation.is_online && (
                      <div style={S.onlineDot} />
                    )}
                  </div>

                  <div style={S.textBlock}>
                    <div style={S.topRow}>
                      <span style={S.name}>
                        {conversation.receiver_name || "Unknown"}
                      </span>
                      <span style={S.timestamp(unread > 0)}>
                        {formatTime(
                          conversation.lastMessage?.created_at ||
                            conversation.created_at,
                        )}
                      </span>
                    </div>

                    <div style={S.bottomRow}>
                      <span style={S.preview}>
                        {conversation.lastMessage?.content || "No messages yet"}
                      </span>

                      {unread > 0 && (
                        <span style={S.badge}>
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
            style={S.fab}
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
