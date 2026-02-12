import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchConversations,
  fetchMessages,
} from "../../Networking/User/APIs/ChatSystem/chatSystemApi";
import { setActiveConversation } from "../../Networking/User/Slice/chatSystemSlice";

export const ChatList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { conversations } = useSelector((state) => state.chatSystemSlice);

  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    dispatch(fetchConversations());
  }, [dispatch]);

  const handleChatClick = (conversation) => {
    dispatch(setActiveConversation(conversation));
    dispatch(fetchMessages(conversation.id));

    navigate(`/chat/${conversation.id}`, {
      state: {
        receiver_id: conversation.receiver_id,
        name: conversation.name,
        is_group: conversation.is_group,
        participants: conversation.participants,
      },
    });
  };

  return (
    <div className="border-end bg-white h-100">
      <div className="p-3 border-bottom d-flex justify-content-between align-items-center position-relative">
        <span className="fw-bold fs-5">Chats</span>

        <div>
          <button
            className="btn btn-sm btn-light"
            onClick={() => setShowMenu(!showMenu)}
          >
            ⋮
          </button>

          {showMenu && (
            <div
              className="position-absolute end-0 mt-2 bg-white border rounded shadow-sm"
              style={{ zIndex: 10 }}
            >
              <button
                className="dropdown-item"
                onClick={() => {
                  navigate("/chat/create-group");
                  setShowMenu(false);
                }}
              >
                Create Group
              </button>
            </div>
          )}
        </div>
      </div>

      <div
        className="list-group list-group-flush overflow-auto"
        style={{ maxHeight: "calc(100vh - 70px)" }}
      >
        {conversations?.length === 0 && (
          <div className="text-center text-muted py-4">
            No conversations found
          </div>
        )}

        {conversations?.map((conversation) => (
          <button
            key={conversation.id}
            onClick={() => handleChatClick(conversation)}
            className="list-group-item list-group-item-action d-flex align-items-center gap-3"
          >
            <div
              className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center"
              style={{ width: 45, height: 45 }}
            >
              {conversation.is_group
                ? "👥"
                : conversation?.receiver_name?.[0]?.toUpperCase() || "U"}
            </div>

            <div className="flex-grow-1 text-start">
              <div className="fw-semibold d-flex justify-content-between">
                <span>
                  {conversation.is_group
                    ? conversation.receiver_name
                    : conversation.receiver_name}
                </span>

                <small className="text-muted">
                  {conversation.created_at &&
                    new Date(conversation.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                </small>
              </div>

              <div className="text-muted text-truncate">
                {conversation.lastMessage?.content || "No messages yet"}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
