import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getAdminlistApi } from "../../../Networking/SuperAdmin/AdminSuperApi";
import { createGroupApi } from "../../../Networking/User/APIs/ChatSystem/chatSystemApi";

/* ─────────────────────────────────────────────
   Styles — matches ChatList / UserListScreen
   dark WhatsApp palette
───────────────────────────────────────────── */
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

  /* ── HEADER ── */
  header: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "10px 16px",
    background: "#202C33",
    minHeight: 56,
    flexShrink: 0,
  },
  iconBtn: {
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
  headerTextBlock: { flex: 1 },
  headerTitle: {
    fontSize: 19,
    fontWeight: 600,
    color: "#E9EDEF",
    lineHeight: 1.2,
  },
  headerSub: {
    fontSize: 13,
    color: "#8696A0",
    marginTop: 1,
  },
  badge: {
    background: "#1F2C34",
    color: "#00A884",
    padding: "4px 12px",
    borderRadius: 20,
    fontSize: 13,
    fontWeight: 600,
    flexShrink: 0,
  },

  /* ── INPUTS ── */
  inputSection: {
    padding: "10px 16px 8px",
    background: "#202C33",
    borderBottom: "1px solid #1F2C34",
    flexShrink: 0,
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  inputWrap: {
    display: "flex",
    alignItems: "center",
    background: "#111B21",
    borderRadius: 8,
    padding: "8px 12px",
    gap: 10,
  },
  input: {
    flex: 1,
    background: "none",
    border: "none",
    outline: "none",
    color: "#E9EDEF",
    fontSize: 15,
    caretColor: "#00A884",
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: 600,
    color: "#00A884",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 4,
    paddingLeft: 2,
  },

  /* ── SELECTED CHIPS ── */
  chipsRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 6,
    padding: "8px 14px",
    background: "#1A2630",
    borderBottom: "1px solid #1F2C34",
    flexShrink: 0,
  },
  chip: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    background: "#2A3942",
    borderRadius: 20,
    padding: "4px 10px 4px 6px",
    fontSize: 13,
    color: "#E9EDEF",
    animation: "chipIn 0.15s ease",
  },
  chipAvatar: {
    width: 22,
    height: 22,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 11,
    fontWeight: 700,
    color: "#fff",
    flexShrink: 0,
  },
  chipRemove: {
    cursor: "pointer",
    color: "#8696A0",
    fontSize: 16,
    lineHeight: 1,
    fontWeight: 600,
    paddingLeft: 2,
  },

  /* ── SECTION LABEL ── */
  sectionLabel: {
    padding: "10px 16px 4px",
    fontSize: 12,
    fontWeight: 600,
    color: "#00A884",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    flexShrink: 0,
  },

  /* ── LIST ── */
  list: {
    flex: 1,
    overflowY: "auto",
    overflowX: "hidden",
  },

  /* ── ITEM ── */
  item: (selected) => ({
    display: "flex",
    alignItems: "center",
    padding: "10px 16px",
    gap: 14,
    cursor: "pointer",
    background: selected ? "#2A3942" : "transparent",
    border: "none",
    borderBottom: "1px solid #1F2C34",
    width: "100%",
    textAlign: "left",
    transition: "background 0.15s",
    color: "#E9EDEF",
  }),

  /* avatar */
  avatar: (color) => ({
    width: 50,
    height: 50,
    minWidth: 50,
    borderRadius: "50%",
    background: color,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 20,
    fontWeight: 600,
    color: "#fff",
    flexShrink: 0,
    position: "relative",
  }),

  /* checkbox circle */
  checkCircle: (checked) => ({
    width: 24,
    height: 24,
    minWidth: 24,
    borderRadius: "50%",
    border: `2px solid ${checked ? "#00A884" : "#8696A0"}`,
    background: checked ? "#00A884" : "transparent",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.15s",
    flexShrink: 0,
  }),

  textBlock: { flex: 1, minWidth: 0 },
  name: {
    fontSize: 16,
    fontWeight: 500,
    color: "#E9EDEF",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  email: {
    fontSize: 13,
    color: "#8696A0",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    marginTop: 1,
  },

  /* skeleton */
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

  /* empty */
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

  /* ── FOOTER ── */
  footer: {
    background: "#202C33",
    padding: "12px 16px",
    borderTop: "1px solid #1F2C34",
    flexShrink: 0,
  },
  createBtn: (disabled) => ({
    width: "100%",
    padding: "13px 0",
    borderRadius: 10,
    border: "none",
    background: disabled ? "#1F3028" : "#00A884",
    color: disabled ? "#4A6358" : "#fff",
    fontSize: 16,
    fontWeight: 600,
    cursor: disabled ? "not-allowed" : "pointer",
    transition: "background 0.2s, color 0.2s",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    letterSpacing: 0.2,
  }),
  hintText: {
    textAlign: "center",
    fontSize: 12,
    color: "#8696A0",
    marginTop: 8,
  },
  hintError: {
    textAlign: "center",
    fontSize: 12,
    color: "#FF6B6B",
    marginTop: 8,
  },
};

/* ── SVG Icons ── */
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
const GroupIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="#8696A0">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const CheckIcon = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#fff"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
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

/* ── Avatar colour palette ── */
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
const avatarColor = (id) =>
  AVATAR_COLORS[Math.abs(Number(id) || 0) % AVATAR_COLORS.length];

const getUserId = (user, index) =>
  String(
    user.user_id ??
      user.id ??
      user._id ??
      user.admin_id ??
      user.userId ??
      index,
  );

/* ─────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────── */
export const CreateGroupScreen = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState(new Set());
  const [groupName, setGroupName] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await dispatch(getAdminlistApi()).unwrap();
        setUsers(res || []);
      } catch (err) {
        console.error(err);
      } finally {
        setFetching(false);
      }
    })();
  }, []);

  /* stable id → user map */
  const userMap = useMemo(() => {
    const map = new Map();
    users.forEach((u, i) => map.set(getUserId(u, i), u));
    return map;
  }, [users]);

  const toggleUser = useCallback((userId) => {
    setSelectedUserIds((prev) => {
      const next = new Set(prev);
      next.has(userId) ? next.delete(userId) : next.add(userId);
      return next;
    });
  }, []);

  const removeChip = useCallback(
    (userId, e) => {
      e.stopPropagation();
      toggleUser(userId);
    },
    [toggleUser],
  );

  const filteredUsers = useMemo(
    () =>
      users.filter((u) => u.name?.toLowerCase().includes(search.toLowerCase())),
    [users, search],
  );

  const canCreate =
    !loading && selectedUserIds.size >= 2 && groupName.trim().length > 0;

  const createGroup = async () => {
    if (!groupName.trim()) return;
    if (selectedUserIds.size < 2) return;
    try {
      setLoading(true);
      const member_ids = [...selectedUserIds].map((id) => Number(id));
      const data = await dispatch(
        createGroupApi({ name: groupName.trim(), member_ids }),
      ).unwrap();
      navigate(`/chat/${data.conversation_id}`, {
        state: {
          name: data.name,
          is_group: data.is_group,
          participants: member_ids,
        },
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /* hint below button */
  const hint = () => {
    if (selectedUserIds.size === 0)
      return (
        <p style={S.hintText}>Select at least 2 members to create a group</p>
      );
    if (selectedUserIds.size === 1 && groupName.trim())
      return (
        <p style={S.hintError}>
          Select 1 more member ({selectedUserIds.size}/2)
        </p>
      );
    if (!groupName.trim() && selectedUserIds.size >= 2)
      return <p style={S.hintError}>Enter a group name</p>;
    return null;
  };

  return (
    <>
      <style>{`
        @keyframes pulse  { 0%,100%{opacity:.4} 50%{opacity:.75} }
        @keyframes spin   { to{transform:rotate(360deg)} }
        @keyframes chipIn { from{opacity:0;transform:scale(.85)} to{opacity:1;transform:scale(1)} }
        @keyframes slideIn{ from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:#2C3E50;border-radius:4px}
        .ua-item:hover{background:#182229 !important}
        .back-btn:hover{background:rgba(255,255,255,.08) !important}
        .ua-item{ animation:slideIn .18s ease both }
      `}</style>

      <div style={S.root}>
        {/* ── HEADER ── */}
        <div style={S.header}>
          <button
            className="back-btn"
            style={S.iconBtn}
            onClick={() => navigate(-1)}
          >
            <BackIcon />
          </button>
          <div style={S.headerTextBlock}>
            <div style={S.headerTitle}>New Group</div>
            <div style={S.headerSub}>Select at least 2 members</div>
          </div>
          {selectedUserIds.size > 0 && (
            <span style={S.badge}>{selectedUserIds.size} selected</span>
          )}
        </div>

        {/* ── INPUT SECTION ── */}
        <div style={S.inputSection}>
          {/* Group name */}
          <div>
            <div style={S.inputLabel}>Group name</div>
            <div style={S.inputWrap}>
              <GroupIcon />
              <input
                style={S.input}
                placeholder="Enter group name…"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                maxLength={60}
              />
            </div>
          </div>

          {/* Search */}
          <div style={S.inputWrap}>
            <SearchIcon />
            <input
              style={S.input}
              placeholder="Search members"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* ── SELECTED CHIPS ── */}
        {selectedUserIds.size > 0 && (
          <div style={S.chipsRow}>
            {[...selectedUserIds].map((userId) => {
              const user = userMap.get(userId);
              if (!user) return null;
              return (
                <span key={userId} style={S.chip}>
                  <span
                    style={{ ...S.chipAvatar, background: avatarColor(userId) }}
                  >
                    {user.name?.[0]?.toUpperCase() || "?"}
                  </span>
                  {user.name}
                  <span
                    style={S.chipRemove}
                    onClick={(e) => removeChip(userId, e)}
                  >
                    ×
                  </span>
                </span>
              );
            })}
          </div>
        )}

        {/* ── SECTION LABEL ── */}
        {!fetching && filteredUsers.length > 0 && (
          <div style={S.sectionLabel}>
            Members &nbsp;·&nbsp; {filteredUsers.length}
          </div>
        )}

        {/* ── USER LIST ── */}
        <div style={S.list}>
          {/* Skeletons */}
          {fetching &&
            Array.from({ length: 7 }).map((_, i) => (
              <div key={i} style={S.skelItem}>
                <div style={S.skelAvatar} />
                <div style={S.skelLines}>
                  <div style={S.skelLine("45%")} />
                  <div style={S.skelLine("65%")} />
                </div>
              </div>
            ))}

          {/* Empty */}
          {!fetching && filteredUsers.length === 0 && (
            <div style={S.empty}>
              <span style={S.emptyIcon}>🔍</span>
              <span style={S.emptyText}>
                {search ? "No users match your search" : "No users available"}
              </span>
            </div>
          )}

          {/* Rows */}
          {!fetching &&
            filteredUsers.map((user, index) => {
              const userId = getUserId(user, index);
              const selected = selectedUserIds.has(userId);

              return (
                <button
                  key={userId}
                  className="ua-item"
                  style={{
                    ...S.item(selected),
                    animationDelay: `${index * 25}ms`,
                  }}
                  onClick={() => toggleUser(userId)}
                >
                  {/* Custom checkbox */}
                  <div style={S.checkCircle(selected)}>
                    {selected && <CheckIcon />}
                  </div>

                  {/* Avatar */}
                  <div style={S.avatar(avatarColor(userId))}>
                    {user.name?.[0]?.toUpperCase() || "?"}
                  </div>

                  {/* Text */}
                  <div style={S.textBlock}>
                    <div style={S.name}>{user.name}</div>
                    {user.email && <div style={S.email}>{user.email}</div>}
                  </div>
                </button>
              );
            })}
        </div>

        {/* ── FOOTER ── */}
        <div style={S.footer}>
          <button
            style={S.createBtn(!canCreate)}
            disabled={!canCreate}
            onClick={createGroup}
          >
            {loading ? (
              <>
                <SpinnerIcon />
                Creating…
              </>
            ) : (
              <>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <line x1="19" y1="8" x2="19" y2="14" />
                  <line x1="22" y1="11" x2="16" y2="11" />
                </svg>
                Create Group
              </>
            )}
          </button>
          {hint()}
        </div>
      </div>
    </>
  );
};
