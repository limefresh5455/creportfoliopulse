import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  deleteConversationApi,
  fetchConversations,
  fetchMessages,
} from "../../Networking/User/APIs/ChatSystem/chatSystemApi";
import { setActiveConversation } from "../../Networking/User/Slice/chatSystemSlice";
import "./chatSystem.css";

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
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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

  const fetchcoversation = () => {
    dispatch(fetchConversations());
  };

  useEffect(() => {
    fetchcoversation();
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
    // dispatch(fetchMessages(conversation.id));
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

  const handleDeleteClick = () => {
    if (selectedConversations.size > 0) {
      setShowDeleteModal(true);
    }
  };

  const confirmDelete = async () => {
    setShowDeleteModal(false);
    const ids = Array.from(selectedConversations);
    for (let id of ids) {
      await dispatch(deleteConversationApi(id));
      fetchcoversation();
    }
    setSelectedConversations(new Set());
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
            <button className="icon-btn" onClick={handleDeleteClick}>
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
                  <div className="dropdown1">
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
              <div className="skel-item" key={i}>
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

      {showDeleteModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowDeleteModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-title">Delete Conversations</div>
            <div className="modal-text">
              Are you sure you want to delete {selectedConversations.size}{" "}
              conversation
              {selectedConversations.size > 1 ? "s" : ""}? This action cannot be
              undone.
            </div>
            <div className="modal-buttons">
              <button
                className="modal-button cancel"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button className="modal-button confirm" onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
