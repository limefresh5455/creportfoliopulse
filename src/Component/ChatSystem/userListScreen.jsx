import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getAdminlistApi } from "../../Networking/SuperAdmin/AdminSuperApi";
import "./chatSystem.css";

const BackIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#AEBAC1"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

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

const AVATAR_COLORS = [
  "#1E6B5E",
  "#2C6E8A",
  "#6B3F8A",
  "#8A5C2E",
  "#2E6B3F",
  "#7A2E2E",
  "#2E517A",
  "#5C2E7A",
];
const avatarColor = (name = "") => {
  const idx = (name.charCodeAt(0) || 0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
};

export const UserListScreen = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await dispatch(getAdminlistApi()).unwrap();
      setUsers(data);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUserClick = (user) => {
    navigate(`/chat/new`, {
      state: {
        receiver_id: user.user_id,
        name: user.name,
      },
    });
  };

  const filtered = users.filter((u) =>
    u.name?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <>
      <style>{`
        @keyframes pulse {
          0%,100% { opacity:0.4 }
          50%      { opacity:0.75 }
        }
        @keyframes slideIn {
          from { opacity:0; transform:translateY(8px) }
          to   { opacity:1; transform:translateY(0) }
        }
        ::-webkit-scrollbar { width:4px }
        ::-webkit-scrollbar-track { background:transparent }
        ::-webkit-scrollbar-thumb { background:#2C3E50; border-radius:4px }
        .user-item:hover { background:#182229 !important }
        .back-btn:hover  { background:rgba(255,255,255,0.08) !important }
        .user-item {
          animation: slideIn 0.2s ease both;
        }
      `}</style>

      <div className="userlist-root">
        <div className="userlist-header">
          <button
            className="back-btn"
            onClick={() => navigate(-1)}
            title="Back"
          >
            <BackIcon />
          </button>
          <span className="header-title">New Chat</span>
        </div>

        <div className="search-wrap">
          <div className="search-inner">
            <SearchIcon />
            <input
              className="search-input"
              placeholder="Search name"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {!loading && filtered.length > 0 && (
          <div className="section-label">
            Contacts on App &nbsp;·&nbsp; {filtered.length}
          </div>
        )}

        <div className="userlist-list">
          {loading &&
            Array.from({ length: 8 }).map((_, i) => (
              <div className="skel-item">
                <div className="skel-avatar" />
                <div className="skel-lines">
                  <div className="skel-line" style={{ width: "45%" }} />
                  <div className="skel-line" style={{ width: "65%" }} />
                </div>
              </div>
            ))}

          {!loading && filtered.length === 0 && (
            <div className="empty">
              <span className="empty-icon">🔍</span>
              <span className="empty-text">
                {search ? "No users match your search" : "No users available"}
              </span>
            </div>
          )}

          {!loading &&
            filtered.map((user, i) => (
              <button
                key={user.id ?? user.user_id}
                className="user-item"
                style={{ animationDelay: `${i * 30}ms` }}
                onClick={() => handleUserClick(user)}
              >
                <div
                  className="avatar"
                  style={{ background: avatarColor(user.name) }}
                >
                  {user.name?.[0]?.toUpperCase() || "?"}
                </div>

                <div className="text-block">
                  <div className="name">{user.name}</div>
                  <div className="sub">Tap to start chat</div>
                </div>

                <span className="arrow">›</span>
              </button>
            ))}
        </div>
      </div>
    </>
  );
};
