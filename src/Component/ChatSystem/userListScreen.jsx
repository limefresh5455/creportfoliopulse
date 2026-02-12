import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getAdminlistApi } from "../../Networking/SuperAdmin/AdminSuperApi";

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
    overflow: "hidden",
  },

  header: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "10px 16px",
    background: "#202C33",
    minHeight: 56,
    flexShrink: 0,
  },
  backBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#AEBAC1",
    padding: 6,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background 0.15s",
    flexShrink: 0,
  },
  headerTitle: {
    fontSize: 19,
    fontWeight: 600,
    color: "#E9EDEF",
    letterSpacing: 0.2,
    flex: 1,
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
    padding: "7px 12px",
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

  sectionLabel: {
    padding: "10px 16px 4px",
    fontSize: 13,
    fontWeight: 600,
    color: "#00A884",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    flexShrink: 0,
  },

  list: {
    flex: 1,
    overflowY: "auto",
    overflowX: "hidden",
  },

  item: {
    display: "flex",
    alignItems: "center",
    padding: "10px 16px",
    gap: 14,
    cursor: "pointer",
    background: "transparent",
    border: "none",
    borderBottom: "1px solid #1F2C34",
    width: "100%",
    textAlign: "left",
    transition: "background 0.15s",
    color: "#E9EDEF",
  },

  avatar: {
    width: 50,
    height: 50,
    minWidth: 50,
    borderRadius: "50%",
    background: "#2C3E50",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 20,
    fontWeight: 600,
    color: "#fff",
    flexShrink: 0,
  },

  textBlock: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontSize: 16,
    fontWeight: 500,
    color: "#E9EDEF",
    marginBottom: 2,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  sub: {
    fontSize: 13,
    color: "#8696A0",
  },

  arrow: {
    color: "#8696A0",
    fontSize: 18,
    flexShrink: 0,
  },

  skelItem: {
    display: "flex",
    alignItems: "center",
    padding: "10px 16px",
    gap: 14,
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
  emptyIcon: { fontSize: 52, opacity: 0.35 },
  emptyText: { fontSize: 15 },
};

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

      <div style={S.root}>
        <div style={S.header}>
          <button
            className="back-btn"
            style={S.backBtn}
            onClick={() => navigate(-1)}
            title="Back"
          >
            <BackIcon />
          </button>
          <span style={S.headerTitle}>New Chat</span>
        </div>

        <div style={S.searchWrap}>
          <div style={S.searchInner}>
            <SearchIcon />
            <input
              style={S.searchInput}
              placeholder="Search name"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {!loading && filtered.length > 0 && (
          <div style={S.sectionLabel}>
            Contacts on App &nbsp;·&nbsp; {filtered.length}
          </div>
        )}

        <div style={S.list}>
          {loading &&
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} style={S.skelItem}>
                <div style={S.skelAvatar} />
                <div style={S.skelLines}>
                  <div style={S.skelLine("45%")} />
                  <div style={S.skelLine("65%")} />
                </div>
              </div>
            ))}

          {!loading && filtered.length === 0 && (
            <div style={S.empty}>
              <span style={S.emptyIcon}>🔍</span>
              <span style={S.emptyText}>
                {search ? "No users match your search" : "No users available"}
              </span>
            </div>
          )}

          {!loading &&
            filtered.map((user, i) => (
              <button
                key={user.id ?? user.user_id}
                className="user-item"
                style={{
                  ...S.item,
                  animationDelay: `${i * 30}ms`,
                }}
                onClick={() => handleUserClick(user)}
              >
                <div
                  style={{
                    ...S.avatar,
                    background: avatarColor(user.name),
                  }}
                >
                  {user.name?.[0]?.toUpperCase() || "?"}
                </div>

                <div style={S.textBlock}>
                  <div style={S.name}>{user.name}</div>
                  <div style={S.sub}>Tap to start chat</div>
                </div>

                <span style={S.arrow}>›</span>
              </button>
            ))}
        </div>
      </div>
    </>
  );
};
