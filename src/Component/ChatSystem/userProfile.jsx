import { useEffect } from "react";

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
      <style>{`
        .profile-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          z-index: 1000;
          animation: fadeIn 0.2s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .profile-drawer {
          position: fixed;
          top: 0;
          right: 0;
          width: 400px;
          max-width: 100%;
          height: 100vh;
          background: #111B21;
          z-index: 1001;
          display: flex;
          flex-direction: column;
          box-shadow: -2px 0 8px rgba(0, 0, 0, 0.3);
          animation: slideIn 0.3s ease-out;
        }

        @keyframes slideIn {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }

        .profile-header {
          background: #202C33;
          padding: 24px 20px;
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .close-btn {
          background: transparent;
          border: none;
          color: #8696A0;
          cursor: pointer;
          padding: 8px;
          display: flex;
          align-items: center;
          font-size: 24px;
          border-radius: 50%;
          transition: background 0.2s;
        }

        .close-btn:hover {
          background: #2A3942;
        }

        .profile-header-title {
          color: #E9EDEF;
          font-size: 19px;
          font-weight: 500;
        }

        .profile-content {
          flex: 1;
          overflow-y: auto;
          background: #0B141A;
        }

        .profile-avatar-section {
          background: #202C33;
          padding: 40px 20px;
          text-align: center;
        }

        .profile-avatar {
          width: 200px;
          height: 200px;
          border-radius: 50%;
          background: linear-gradient(135deg, #00A884 0%, #005C4B 100%);
          margin: 0 auto 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 80px;
          color: #fff;
          font-weight: 500;
          cursor: pointer;
          transition: transform 0.2s;
          position: relative;
        }

        .profile-avatar:hover {
          transform: scale(1.05);
        }

        .profile-avatar::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0);
          transition: background 0.2s;
        }

        .profile-avatar:hover::after {
          background: rgba(0, 0, 0, 0.1);
        }

        .profile-name {
          color: #E9EDEF;
          font-size: 24px;
          font-weight: 500;
          margin-bottom: 4px;
        }

        .profile-email {
          color: #8696A0;
          font-size: 15px;
          margin-bottom: 8px;
        }

        .profile-status {
          color: #8696A0;
          font-size: 14px;
        }

        .profile-status.online {
          color: #00A884;
        }

        .profile-section {
          background: #202C33;
          margin: 10px 0;
          padding: 12px 20px;
        }

        .profile-section-label {
          color: #00A884;
          font-size: 13px;
          margin-bottom: 16px;
          font-weight: 500;
        }

        .profile-info-row {
          display: flex;
          align-items: flex-start;
          gap: 28px;
          padding: 16px 0;
        }

        .profile-info-row:not(:last-child) {
          border-bottom: 1px solid #111B21;
        }

        .profile-info-icon {
          color: #8696A0;
          font-size: 24px;
          margin-top: 2px;
          flex-shrink: 0;
        }

        .profile-info-content {
          flex: 1;
          min-width: 0;
        }

        .profile-info-label {
          color: #8696A0;
          font-size: 13px;
          margin-bottom: 4px;
        }

        .profile-info-value {
          color: #E9EDEF;
          font-size: 15px;
          line-height: 20px;
          word-wrap: break-word;
        }

        .profile-action-btn {
          display: flex;
          align-items: center;
          gap: 28px;
          padding: 16px 20px;
          background: #202C33;
          border: none;
          color: #E9EDEF;
          cursor: pointer;
          width: 100%;
          text-align: left;
          transition: background 0.2s;
          font-size: 15px;
          font-family: inherit;
        }

        .profile-action-btn:hover {
          background: #2A3942;
        }

        .profile-action-icon {
          font-size: 24px;
          color: #8696A0;
          flex-shrink: 0;
        }

        .participants-list {
          margin-top: 8px;
        }

        .participant-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 0;
          cursor: pointer;
          transition: opacity 0.2s;
        }

        .participant-item:hover {
          opacity: 0.8;
        }

        .participant-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, #00A884 0%, #005C4B 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-size: 16px;
          font-weight: 500;
          flex-shrink: 0;
        }

        .participant-name {
          color: #E9EDEF;
          font-size: 15px;
        }

        .participant-role {
          color: #8696A0;
          font-size: 13px;
          margin-top: 2px;
        }

        .media-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2px;
          margin-top: 12px;
        }

        .media-item {
          aspect-ratio: 1;
          background: #2A3942;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #8696A0;
          font-size: 24px;
          cursor: pointer;
          transition: opacity 0.2s;
        }

        .media-item:hover {
          opacity: 0.7;
        }

        /* Scrollbar */
        .profile-content::-webkit-scrollbar {
          width: 6px;
        }

        .profile-content::-webkit-scrollbar-track {
          background: transparent;
        }

        .profile-content::-webkit-scrollbar-thumb {
          background: #374045;
          border-radius: 3px;
        }

        @media (max-width: 768px) {
          .profile-drawer {
            width: 100%;
          }

          .profile-avatar {
            width: 160px;
            height: 160px;
            font-size: 64px;
          }
        }
      `}</style>

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
