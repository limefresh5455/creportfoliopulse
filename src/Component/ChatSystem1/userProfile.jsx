import "./userProfile.css";

export const UserProfile = ({ open, onClose, userId, name }) => {
  if (!open) return null;

  return (
    <div className="profile-overlay" onClick={onClose}>
      <div
        className="profile-panel"
        onClick={(e) => e.stopPropagation()}
      >

        <div className="profile-header">
          <button className="back-btn" onClick={onClose}>
            ←
          </button>
        
        </div>


        <div className="profile-avatar initial-avatar">
          {name?.charAt(0)?.toUpperCase()}
        </div>


        <h3 className="text-center">{name}</h3>
        <h5 className="text-center">user@email.com</h5>
        <h5 className="text-center">Online</h5>
      </div>
    </div>
  );
};
