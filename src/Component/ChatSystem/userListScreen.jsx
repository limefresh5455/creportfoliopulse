import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getAdminlistApi } from "../../Networking/SuperAdmin/AdminSuperApi";

export const UserListScreen = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);

  const fetch = async () => {
    const UsersData = await dispatch(getAdminlistApi()).unwrap();
    console.log(UsersData, "UsersData");
    setUsers(UsersData);
  };

  useEffect(() => {
    fetch();
  }, []);

  const handleUserClick = (user) => {
    navigate(`/chat/new`, {
      state: {
        receiver_id: user.id,
        name: user.name,
      },
    });
  };

  return (
    <div className="border-end bg-white h-100">
      <div className="p-3 border-bottom fw-bold fs-5">Select User</div>

      <div
        className="list-group list-group-flush overflow-auto"
        style={{ maxHeight: "calc(100vh - 70px)" }}
      >
        {/* {loading && (
          <div className="text-center py-4 text-muted">
            Loading users...
          </div>
        )} */}

        {users?.map((user) => (
          <button
            key={user.id}
            onClick={() => handleUserClick(user)}
            className="list-group-item list-group-item-action d-flex align-items-center gap-3"
          >
            <div
              className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center"
              style={{ width: 45, height: 45 }}
            >
              {user.name?.[0]?.toUpperCase()}
            </div>

            <div className="flex-grow-1 text-start">
              <div className="fw-semibold">{user.name}</div>

              <div className="text-muted text-truncate">Tap to start chat</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
