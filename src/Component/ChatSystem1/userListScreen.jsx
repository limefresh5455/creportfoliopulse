import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getAdminlistApi } from "../../Networking/SuperAdmin/AdminSuperApi";

export const UserListScreen = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const { userStatus } = useSelector((state) => state.chatSystemSlice || {});

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const UsersData = await dispatch(getAdminlistApi()).unwrap();
      setUsers(UsersData || []);
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUserClick = (user) => {
    console.log(user, "user");

    navigate(`/chat/${conversation.id}`, {
      state: {
        receiver_id: user.user_id,
        name: user.name,
      },
    });
  };

  return (
    <div className="border-end bg-white h-100 d-flex flex-column">
      <div className="p-3 border-bottom fw-bold fs-5">Select contact</div>

      <div
        className="list-group list-group-flush overflow-auto"
        style={{ maxHeight: "calc(100vh - 70px)" }}
      >
        {loading &&
          Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="list-group-item d-flex gap-3 placeholder-glow"
            >
              <div
                className="placeholder rounded-circle"
                style={{ width: 48, height: 48 }}
              ></div>

              <div className="flex-grow-1">
                <span className="placeholder col-6"></span>
                <span className="placeholder col-9 mt-2"></span>
              </div>
            </div>
          ))}

        {!loading && users.length === 0 && (
          <div className="text-center text-muted py-4">No users found</div>
        )}

        {!loading &&
          users.map((user) => {
            const isOnline = userStatus?.[user.id]?.online === true;

            return (
              <button
                key={user.id}
                onClick={() => handleUserClick(user)}
                className="list-group-item list-group-item-action d-flex align-items-center gap-3"
              >
                <div className="position-relative">
                  <div
                    className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center fw-semibold"
                    style={{ width: 48, height: 48 }}
                  >
                    {user.name?.[0]?.toUpperCase() || "U"}
                  </div>

                  <span
                    className={`position-absolute bottom-0 end-0 rounded-circle border border-white ${
                      isOnline ? "bg-success" : "bg-secondary"
                    }`}
                    style={{ width: 12, height: 12 }}
                  ></span>
                </div>

                <div className="flex-grow-1 text-start overflow-hidden">
                  <div className="fw-semibold text-truncate">{user.name}</div>

                  <div className="text-muted text-truncate">
                    {isOnline ? "Online" : "Tap to start chat"}
                  </div>
                </div>
              </button>
            );
          })}
      </div>
    </div>
  );
};
