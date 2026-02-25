import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axiosInstance from "../../Networking/Admin/APIs/AxiosInstance";
import {
  fetchFileUrl,
  fetchMessages,
  leaveGroupApi,
} from "../../Networking/User/APIs/ChatSystem/chatSystemApi";
import { getAdminlistApi } from "../../Networking/SuperAdmin/AdminSuperApi";
import "./chatSystem.css";
import "./userProfile.css";
import { toast } from "react-toastify";

export const UserProfile = ({
  open,
  onClose,
  name,
  email,
  status,
  isGroup = false,
  participants = [],
  conversationId,
  about = "Hey there! I am using Portfoliopulse.",
  onSearchClick,
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [showAllMedia, setShowAllMedia] = useState(false);
  const [showDeleteFileModal, setShowDeleteFileModal] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);
  const [isDeletingFile, setIsDeletingFile] = useState(false);
  const [members, setMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [adding, setAdding] = useState(false);
  const [removingId, setRemovingId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  const [showUserPicker, setShowUserPicker] = useState(false);

  const longPressTimerRef = useRef(null);

  const { messages, fileUrls, fileLoading } = useSelector(
    (s) => s.chatSystemSlice,
  );

  const mediaFiles = messages
    .filter((msg) => msg.file_name && msg.file_id)
    .map((msg) => ({
      id: msg.id,
      file_id: msg.file_id,
      url: msg.file_url || fileUrls[msg.file_id],
      name: msg.file_name,
    }));

  useEffect(() => {
    mediaFiles.forEach((file) => {
      if (!file.url && !fileLoading[file.file_id]) {
        dispatch(fetchFileUrl(file.file_id));
      }
    });
  }, [mediaFiles, dispatch, fileLoading]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  useEffect(() => {
    if (!conversationId || !open || !isGroup) return;

    const fetchMembers = async () => {
      try {
        setLoadingMembers(true);
        const res = await axiosInstance.get(
          `/messenger/conversations/${conversationId}/members`,
        );
        setMembers(res.data.members || []);
      } catch (err) {
        toast.error("Failed to load members");
      } finally {
        setLoadingMembers(false);
      }
    };

    fetchMembers();
  }, [conversationId, open, isGroup]);

  const handleAddMember = async () => {
    if (!selectedUser) return toast.error("Select a user first");

    try {
      setAdding(true);
      await axiosInstance.post(
        `/messenger/conversations/${conversationId}/add-member`,
        {},
        { params: { user_id: selectedUser.id } },
      );

      toast.success("Member added");
      setSelectedUser(null);

      const res = await axiosInstance.get(
        `/messenger/conversations/${conversationId}/members`,
      );
      setMembers(res.data.members || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add member");
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveMember = async (id) => {
    try {
      setRemovingId(id);

      await axiosInstance.delete(
        `/messenger/conversations/${conversationId}/remove-member/${id}`,
      );

      setMembers((prev) => prev.filter((m) => m.user_id !== id));
      toast.success("Member removed");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to remove member");
    } finally {
      setRemovingId(null);
    }
  };

  const startLongPress = (file) => {
    longPressTimerRef.current = setTimeout(() => {
      setFileToDelete(file);
      setShowDeleteFileModal(true);
    }, 500);
  };

  const cancelLongPress = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleDeleteFile = async () => {
    if (!fileToDelete) return;
    setIsDeletingFile(true);
    try {
      await axiosInstance.delete(`/messenger/file/${fileToDelete.file_id}`);
      toast.success("File deleted");
      dispatch(fetchMessages(conversationId));
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete file");
    } finally {
      setIsDeletingFile(false);
      setShowDeleteFileModal(false);
      setFileToDelete(null);
    }
  };

  const handleExitGroup = () => {
    if (!conversationId) return;
    setShowExitConfirm(true);
  };

  const confirmExitGroup = async () => {
    if (!conversationId) return;
    setIsLeaving(true);
    try {
      const result = await dispatch(leaveGroupApi(conversationId));
      if (leaveGroupApi.fulfilled.match(result)) {
        navigate("/messages");
      } else {
        toast.error(result.payload || "Failed to leave group");
      }
    } catch (err) {
      toast.error("Failed to leave group");
    } finally {
      setIsLeaving(false);
      setShowExitConfirm(false);
    }
  };

  if (!open) return null;

  const formatLastSeen = (lastSeen) => {
    if (!lastSeen) return "offline";
    const date = new Date(lastSeen);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60)
      return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
    if (diffHours < 24)
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    return date.toLocaleDateString();
  };

  const isImage = (fileName) => {
    if (!fileName) return false;
    const ext = fileName.split(".").pop().toLowerCase();
    return ["jpg", "jpeg", "png", "gif", "webp", "bmp"].includes(ext);
  };

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

  return (
    <>
      <div className="profile-overlay" onClick={onClose} />

      <div className="profile-drawer">
        <div className="profile-header">
          <button className="close-btn" onClick={onClose}>
            <i className="ri-close-line" />
          </button>
          <h2 className="profile-header-title">
            {isGroup ? "Group Info" : "Contact Info"}
          </h2>
        </div>

        <div className="profile-content">
          <div className="profile-avatar-section">
            <div className="profile-avatar">
              {name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div className="profile-name">{name || "Unnamed User"}</div>
            {email && <div className="profile-email">{email}</div>}
            {!isGroup && (
              <div
                className={`profile-status ${status?.online ? "online" : ""}`}
              >
                {status?.online
                  ? "Online"
                  : status?.last_seen
                    ? `Last seen ${formatLastSeen(status.last_seen)}`
                    : "Offline"}
              </div>
            )}
          </div>

          {!isGroup && (
            <div className="profile-section">
              <div className="profile-section-label">About</div>
              <div className="profile-info-row">
                <i className="ri-information-line profile-info-icon" />
                <div className="profile-info-content">
                  <div className="profile-info-value">{about}</div>
                </div>
              </div>
            </div>
          )}

          {isGroup && (
            <div className="members-section">
              <div className="members-title">Group Members</div>

              <div className="member-input-box">
                {selectedUser ? (
                  <div className="selected-user-pill">
                    <span className="selected-user-name">
                      {selectedUser.name}
                    </span>
                    <button
                      className="clear-selection"
                      onClick={() => setSelectedUser(null)}
                      title="Clear selection"
                    >
                      <i className="ri-close-line" />
                    </button>
                  </div>
                ) : (
                  <span className="select-placeholder">No user selected</span>
                )}
                <button
                  className="browse-users-btn"
                  onClick={() => setShowUserPicker(true)}
                  type="button"
                  title="Browse users"
                >
                  <i className="ri-user-search-line"></i>
                </button>
                <button
                  className="add-member-btn"
                  onClick={handleAddMember}
                  disabled={adding || !selectedUser}
                >
                  {adding ? "Adding..." : "Add"}
                </button>
              </div>

              <div className="member-list">
                {members.map((m) => (
                  <div key={m.user_id} className="member-card">
                    <div className="member-info">
                      <div className="member-avatar">
                        {(m.user_name || "U")[0]}
                      </div>
                      <div className="member-name">
                        {m.user_name || `User ${m.user_id}`}
                        {m.is_me && <span className="me-badge">You</span>}
                      </div>
                      <div className="member-email">{m.role}</div>
                    </div>
                    {m.role !== "admin" && (
                      <button
                        className="remove-member-btn"
                        onClick={() => handleRemoveMember(m.user_id)}
                        disabled={removingId === m.user_id}
                      >
                        {removingId === m.user_id ? "Removing..." : "Remove"}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="profile-section">
            <div className="profile-section-label">Media, links and docs</div>
            <div className="media-grid">
              {mediaFiles.length === 0 ? (
                <div className="no-media">No media shared yet</div>
              ) : (
                mediaFiles.slice(0, 6).map((file) => (
                  <a
                    key={file.id}
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="media-item"
                    onClick={(e) => {
                      if (fileToDelete) e.preventDefault();
                    }}
                    onTouchStart={() => startLongPress(file)}
                    onTouchEnd={cancelLongPress}
                    onTouchMove={cancelLongPress}
                    onMouseDown={() => startLongPress(file)}
                    onMouseUp={cancelLongPress}
                    onMouseLeave={cancelLongPress}
                  >
                    {fileLoading[file.file_id] ? (
                      <div className="file-loading">
                        <i className="ri-loader-4-line spinning" />
                      </div>
                    ) : isImage(file.name) ? (
                      <img src={file.url || ""} alt={file.name} />
                    ) : (
                      <div className="file-thumb">
                        <i className="ri-file-line" />
                        <span className="file-name">{file.name}</span>
                      </div>
                    )}
                  </a>
                ))
              )}
            </div>
          </div>

          {/* <div className="profile-section">
            <button className="profile-action-btn" onClick={onSearchClick}>
              <i className="ri-search-line profile-action-icon" />
              <span>Search in conversation</span>
            </button>
          </div> */}

          <div className="profile-section">
            <button
              className="profile-action-btn"
              onClick={() => setShowAllMedia(true)}
            >
              <i className="ri-image-line profile-action-icon" />
              <span>Media, links, and docs</span>
            </button>
          </div>

          <div className="profile-section">
            {isGroup ? (
              <button
                className="profile-action-btn"
                style={{ color: "#EA4335" }}
                onClick={handleExitGroup}
                disabled={isLeaving}
              >
                <i
                  className={`profile-action-icon ${
                    isLeaving
                      ? "ri-loader-4-line spinning"
                      : "ri-logout-box-r-line"
                  }`}
                  style={{ color: "#EA4335" }}
                />
                <span>{isLeaving ? "Leaving..." : "Exit group"}</span>
              </button>
            ) : (
              <button
                className="profile-action-btn"
                style={{ color: "#EA4335" }}
              >
                <i
                  className="ri-user-unfollow-line profile-action-icon"
                  style={{ color: "#EA4335" }}
                />
                <span>Block {name}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {showAllMedia && (
        <div className="modal-overlay" onClick={() => setShowAllMedia(false)}>
          <div
            className="modal-content media-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3 className="text-dark">Media, links and docs</h3>
              <button
                className="close-btn"
                onClick={() => setShowAllMedia(false)}
              >
                <i className="ri-close-line" />
              </button>
            </div>
            <div className="modal-body">
              {mediaFiles.length === 0 ? (
                <div className="no-media">No media shared yet</div>
              ) : (
                <div className="media-grid full">
                  {mediaFiles.map((file) => (
                    <a
                      key={file.id}
                      href={file.url || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="media-item"
                      onClick={(e) => {
                        if (fileToDelete) e.preventDefault();
                      }}
                      onTouchStart={() => startLongPress(file)}
                      onTouchEnd={cancelLongPress}
                      onTouchMove={cancelLongPress}
                      onMouseDown={() => startLongPress(file)}
                      onMouseUp={cancelLongPress}
                      onMouseLeave={cancelLongPress}
                    >
                      {isImage(file.name) ? (
                        <img src={file.url} alt={file.name} />
                      ) : (
                        <div className="file-thumb">
                          <i className="ri-file-line" />
                          <span className="file-name">{file.name}</span>
                        </div>
                      )}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showDeleteFileModal && fileToDelete && (
        <div
          className="modal-overlay"
          onClick={() => setShowDeleteFileModal(false)}
        >
          <div
            className="modal-content delete-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-dark">Delete file?</h3>
            <p className="text-dark">
              Are you sure you want to delete "{fileToDelete.name}"?
            </p>
            <div className="modal-actions">
              <button
                className="cancel"
                onClick={() => {
                  setShowDeleteFileModal(false);
                  setFileToDelete(null);
                }}
                disabled={isDeletingFile}
              >
                Cancel
              </button>
              <button
                className="delete"
                onClick={handleDeleteFile}
                disabled={isDeletingFile}
                style={{
                  opacity: isDeletingFile ? 0.7 : 1,
                  cursor: isDeletingFile ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                {isDeletingFile && <i className="ri-loader-4-line spinning" />}
                {isDeletingFile ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showExitConfirm && (
        <div className="wa-modal-overlay">
          <div className="wa-modal">
            <h3 className="text-dark">Leave Group?</h3>
            <p className="text-dark">
              You won’t receive messages from this group anymore.
            </p>
            <div className="wa-actions">
              <button
                className="cancel"
                onClick={() => setShowExitConfirm(false)}
                disabled={isLeaving}
              >
                Cancel
              </button>
              <button
                className="leave"
                onClick={confirmExitGroup}
                disabled={isLeaving}
                style={{
                  opacity: isLeaving ? 0.7 : 1,
                  cursor: isLeaving ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                {isLeaving && <i className="ri-loader-4-line spinning" />}
                {isLeaving ? "Leaving..." : "Leave"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showUserPicker && (
        <UserPickerModal
          onClose={() => setShowUserPicker(false)}
          onSelect={(user) => setSelectedUser(user)}
        />
      )}
    </>
  );
};

const UserPickerModal = ({ onClose, onSelect }) => {
  const dispatch = useDispatch();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const data = await dispatch(getAdminlistApi()).unwrap();
        setUsers(data);
      } catch (err) {
        toast.error("Failed to load users");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [dispatch]);

  const filtered = users.filter((u) =>
    u.name?.toLowerCase().includes(search.toLowerCase()),
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

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content user-picker-modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "400px", width: "90%" }}
      >
        <div className="modal-header">
          <h3>Select User</h3>
          <button className="close-btn" onClick={onClose}>
            <i className="ri-close-line" />
          </button>
        </div>
        <div className="search-wrap" style={{ padding: "12px 16px" }}>
          <div className="search-inner">
            <i className="ri-search-line" style={{ color: "#8696A0" }} />
            <input
              className="search-input"
              placeholder="Search name"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div
          className="user-list-modal"
          style={{ maxHeight: "400px", overflowY: "auto" }}
        >
          {loading ? (
            <div style={{ padding: 20, textAlign: "center" }}>Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="empty" style={{ padding: 20, textAlign: "center" }}>
              No users found
            </div>
          ) : (
            filtered.map((user) => (
              <button
                key={user.user_id}
                className="user-item"
                onClick={() => {
                  onSelect({ id: user.user_id, name: user.name });
                  onClose();
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  width: "100%",
                  padding: "12px 16px",
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                  borderBottom: "1px solid #2A3942",
                }}
              >
                <div
                  className="avatar"
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: avatarColor(user.name),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontWeight: "bold",
                    marginRight: 12,
                  }}
                >
                  {user.name?.[0]?.toUpperCase() || "?"}
                </div>
                <div
                  className="text-block"
                  style={{ flex: 1, textAlign: "left" }}
                >
                  <div className="name" style={{ fontWeight: 500 }}>
                    {user.name}
                  </div>
                  <div
                    className="sub"
                    style={{ fontSize: 13, color: "#8696A0" }}
                  >
                    Click to select
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
