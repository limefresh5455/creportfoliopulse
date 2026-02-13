import { useEffect } from "react";
import "./chatSystem.css";

export const UserProfile = ({
  open,
  onClose,
  userId,
  name,
  email,
  status,
  isGroup = false,
  participants = [],
  about = "Hey there! I am using WhatsApp.",
}) => {
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

          {!isGroup && (
            <div className="profile-section">
              <div className="profile-section-label">Phone</div>
              <div className="profile-info-row">
                <i className="ri-phone-line profile-info-icon" />
                <div className="profile-info-content">
                  <div className="profile-info-value">
                    {email || "+1 234 567 8900"}
                  </div>
                  <div className="profile-info-label">Mobile</div>
                </div>
              </div>
            </div>
          )}

          {isGroup && participants && participants.length > 0 && (
            <div className="profile-section">
              <div className="profile-section-label">
                {participants.length} Participant
                {participants.length !== 1 ? "s" : ""}
              </div>
              <div className="participants-list">
                {participants.map((participant, index) => (
                  <div key={index} className="participant-item">
                    <div className="participant-avatar">
                      {participant.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    <div>
                      <div className="participant-name">
                        {participant.name || "Unnamed"}
                      </div>
                      {participant.role && (
                        <div className="participant-role">
                          {participant.role}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="profile-section">
            <div className="profile-section-label">Media, links and docs</div>
            <div className="media-grid">
              <div className="media-item">
                <i className="ri-image-line" />
              </div>
              <div className="media-item">
                <i className="ri-image-line" />
              </div>
              <div className="media-item">
                <i className="ri-image-line" />
              </div>
            </div>
          </div>

          <div className="profile-section">
            <div className="profile-info-row">
              <i className="ri-notification-3-line profile-info-icon" />
              <div className="profile-info-content">
                <div className="profile-info-label">Notifications</div>
                <div className="profile-info-value">On</div>
              </div>
            </div>
          </div>

          <div className="profile-section">
            <button className="profile-action-btn">
              <i className="ri-search-line profile-action-icon" />
              <span>Search in conversation</span>
            </button>
          </div>

          <div className="profile-section">
            <button className="profile-action-btn">
              <i className="ri-volume-mute-line profile-action-icon" />
              <span>Mute notifications</span>
            </button>
            <button className="profile-action-btn">
              <i className="ri-image-line profile-action-icon" />
              <span>Media, links, and docs</span>
            </button>
            <button className="profile-action-btn">
              <i className="ri-star-line profile-action-icon" />
              <span>Starred messages</span>
            </button>
            {!isGroup && (
              <button className="profile-action-btn">
                <i className="ri-lock-line profile-action-icon" />
                <span>Encryption</span>
              </button>
            )}
          </div>

          <div className="profile-section">
            {isGroup ? (
              <>
                <button
                  className="profile-action-btn"
                  style={{ color: "#EA4335" }}
                >
                  <i
                    className="ri-logout-box-r-line profile-action-icon"
                    style={{ color: "#EA4335" }}
                  />
                  <span>Exit group</span>
                </button>
                <button
                  className="profile-action-btn"
                  style={{ color: "#EA4335" }}
                >
                  <i
                    className="ri-user-unfollow-line profile-action-icon"
                    style={{ color: "#EA4335" }}
                  />
                  <span>Report group</span>
                </button>
              </>
            ) : (
              <>
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
                <button
                  className="profile-action-btn"
                  style={{ color: "#EA4335" }}
                >
                  <i
                    className="ri-spam-2-line profile-action-icon"
                    style={{ color: "#EA4335" }}
                  />
                  <span>Report contact</span>
                </button>
              </>
            )}
            <button className="profile-action-btn" style={{ color: "#EA4335" }}>
              <i
                className="ri-delete-bin-6-line profile-action-icon"
                style={{ color: "#EA4335" }}
              />
              <span>Delete chat</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
