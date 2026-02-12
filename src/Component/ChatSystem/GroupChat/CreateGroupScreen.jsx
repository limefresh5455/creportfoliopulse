import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getAdminlistApi } from "../../../Networking/SuperAdmin/AdminSuperApi";
import { createGroupApi } from "../../../Networking/User/APIs/ChatSystem/chatSystemApi";

export const CreateGroupScreen = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState(new Set());
  console.log(selectedUserIds, "selectedUserIds");

  const [groupName, setGroupName] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const getUserId = (user, index) =>
    String(user.id ?? user._id ?? user.admin_id ?? user.userId ?? index);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await dispatch(getAdminlistApi()).unwrap();
      setUsers(res || []);
    } catch (err) {
      console.error(err);
    }
  };

  const userMap = useMemo(() => {
    const map = new Map();
    users.forEach((u, i) => map.set(getUserId(u, i), u));
    return map;
  }, [users]);

  const toggleUser = useCallback((userId) => {
    setSelectedUserIds((prev) => {
      const set = new Set(prev);
      set.has(userId) ? set.delete(userId) : set.add(userId);
      return set;
    });
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()),
    );
  }, [users, search]);

  const createGroup = async () => {
    if (!groupName.trim()) return alert("Enter group name");
    if (selectedUserIds.size < 2) return alert("Select at least 2 members");

    try {
      setLoading(true);

      const member_ids = [...selectedUserIds].map((id) => Number(id));

      const data = await dispatch(
        createGroupApi({
          name: groupName,
          member_ids,
        }),
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
      alert("Failed to create group");
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    header: {
      background: "#ffffff",
      borderBottom: "1px solid #e5e7eb",
    },
    accent: "#6366f1",
    softAccent: "#eef2ff",
    border: "#e5e7eb",
    muted: "#6b7280",
  };

  const getColor = (id) => {
    const colors = [
      "#4f46e5",
      "#0ea5e9",
      "#22c55e",
      "#f59e0b",
      "#ef4444",
      "#a855f7",
      "#14b8a6",
    ];
    return colors[Number(id) % colors.length];
  };

  const removeSelectedUser = useCallback(
    (userId, e) => {
      e.stopPropagation();
      toggleUser(userId);
    },
    [toggleUser],
  );

  return (
    <div className="bg-light h-100 d-flex flex-column">
      <div
        className="p-3 d-flex justify-content-between align-items-center"
        style={styles.header}
      >
        <div>
          <div className="fw-semibold" style={{ fontSize: 18 }}>
            Create New Group
          </div>
          <div className="small" style={{ color: styles.muted }}>
            Select at least 2 members
          </div>
        </div>

        <div
          style={{
            background: "#f3f4f6",
            padding: "6px 12px",
            borderRadius: 20,
            fontSize: 13,
            fontWeight: 500,
          }}
        >
          {selectedUserIds.size} selected
        </div>
      </div>

      <div className="bg-white p-3 border-bottom">
        <input
          className="form-control mb-3"
          placeholder="Group name"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          style={{
            borderRadius: 10,
            border: `1px solid ${styles.border}`,
            boxShadow: "none",
          }}
        />

        <input
          className="form-control"
          placeholder="Search members..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            borderRadius: 10,
            border: `1px solid ${styles.border}`,
          }}
        />
      </div>

      {selectedUserIds.size > 0 && (
        <div className="bg-white border-bottom px-3 py-2 d-flex flex-wrap gap-2">
          {[...selectedUserIds].map((userId) => {
            const user = userMap.get(userId);
            if (!user) return null;

            return (
              <span
                key={userId}
                style={{
                  background: "#f3f4f6",
                  borderRadius: 20,
                  padding: "6px 12px",
                  fontSize: 13,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                {user.name}
                <span
                  style={{
                    cursor: "pointer",
                    fontWeight: 600,
                    color: "#9ca3af",
                  }}
                  onClick={(e) => removeSelectedUser(userId, e)}
                >
                  ×
                </span>
              </span>
            );
          })}
        </div>
      )}

      <div className="flex-grow-1 overflow-auto px-2 py-2">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user, index) => {
            const userId = getUserId(user, index);
            const selected = selectedUserIds.has(userId);

            return (
              <div
                key={userId}
                onClick={() => toggleUser(userId)}
                className={`d-flex align-items-center gap-3 p-2 mb-1 rounded ${
                  selected ? "bg-primary bg-opacity-10" : "bg-white"
                }`}
                style={{
                  cursor: "pointer",
                  transition: "0.15s",
                  border: selected
                    ? "1px solid rgba(79,70,229,0.3)"
                    : "1px solid transparent",
                }}
              >
                <input type="checkbox" checked={selected} readOnly />

                <div
                  className="rounded-circle text-white d-flex align-items-center justify-content-center fw-semibold"
                  style={{
                    width: 45,
                    height: 45,
                    background: getColor(userId),
                    flexShrink: 0,
                  }}
                >
                  {user.name?.[0]?.toUpperCase() || "?"}
                </div>

                <div className="flex-grow-1">
                  <div className="fw-semibold">{user.name}</div>
                  {user.email && (
                    <div className="small text-muted">{user.email}</div>
                  )}
                </div>

                {selected && <span className="text-primary me-2">✓</span>}
              </div>
            );
          })
        ) : (
          <div className="text-center text-muted mt-4">
            {users.length === 0 ? "Loading users..." : "No users found"}
          </div>
        )}
      </div>

      <div className="bg-white p-3 border-top">
        <button
          className="btn btn-primary w-100 fw-semibold"
          disabled={loading || selectedUserIds.size < 2 || !groupName.trim()}
          onClick={createGroup}
          style={{
            opacity:
              loading || selectedUserIds.size < 2 || !groupName.trim()
                ? 0.65
                : 1,
          }}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" />
              Creating Group...
            </>
          ) : (
            "Create Group"
          )}
        </button>

        {selectedUserIds.size > 0 &&
          selectedUserIds.size < 2 &&
          groupName.trim() && (
            <div className="text-danger small mt-2 text-center">
              Select at least 1 more member ({selectedUserIds.size}/2 selected)
            </div>
          )}

        {selectedUserIds.size === 0 && (
          <div className="text-muted small mt-2 text-center">
            Select at least 2 members to create a group
          </div>
        )}

        {!groupName.trim() && selectedUserIds.size >= 2 && (
          <div className="text-danger small mt-2 text-center">
            Enter a group name
          </div>
        )}
      </div>
    </div>
  );
};
