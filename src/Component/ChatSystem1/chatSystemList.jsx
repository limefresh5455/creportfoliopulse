import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  fetchConversations,
  fetchMessages,
} from "../../Networking/User/APIs/ChatSystem/chatSystemApi";
import { setActiveConversation } from "../../Networking/User/Slice/chatSystemSlice";

export const ChatList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { conversationId } = useParams();

  const { conversations, loading, userStatus } = useSelector(
    (state) => state.chatSystemSlice,
  );

  useEffect(() => {
    dispatch(fetchConversations());
  }, [dispatch]);

  const handleChatClick = (conversation) => {
    dispatch(setActiveConversation(conversation));
    dispatch(fetchMessages(conversation.receiver_id));

    navigate(`/chat/${conversation.receiver_id}`, {
      state: {
        receiver_id: conversation.receiver_id,
        name: conversation.receiver_name,
      },
    });
  };

  return (
    <div className="border-end bg-white h-100 d-flex flex-column">
      <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
        <span className="fw-bold fs-5">Chats</span>
        <button
          className="btn btn-sm btn-success rounded-circle"
          onClick={() => navigate("/chat/users")}
        >
          <i className="ri-chat-new-line"></i>
        </button>
      </div>

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

        {!loading && conversations?.length === 0 && (
          <div className="text-center text-muted py-4">
            No conversations found
          </div>
        )}

        {!loading &&
          conversations?.map((conversation) => {
            const isActive = Number(conversationId) === conversation.id;

            const status = userStatus?.[conversation.receiver_id];
            const isOnline = status?.online === true;

            return (
              <button
                key={conversation.id}
                onClick={() => handleChatClick(conversation)}
                className={`list-group-item list-group-item-action d-flex align-items-center gap-3 ${
                  isActive ? "bg-light" : ""
                }`}
              >
                <div className="position-relative">
                  <div
                    className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center fw-semibold"
                    style={{ width: 48, height: 48 }}
                  >
                    {conversation?.receiver_name?.[0]?.toUpperCase() || "U"}
                  </div>

                  <span
                    className={`position-absolute bottom-0 end-0 rounded-circle border border-white ${
                      isOnline ? "bg-success" : "bg-secondary"
                    }`}
                    style={{ width: 12, height: 12 }}
                  ></span>
                </div>

                <div className="flex-grow-1 overflow-hidden text-start">
                  <div className="d-flex justify-content-between">
                    <span className="fw-semibold text-truncate">
                      {conversation.receiver_name}
                    </span>

                    <small className="text-muted">
                      {conversation.lastMessage?.created_at &&
                        new Date(
                          conversation.lastMessage.created_at,
                        ).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                    </small>
                  </div>

                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-muted text-truncate">
                      {conversation.lastMessage?.content || "No messages yet"}
                    </span>

                    {conversation.unread_count > 0 && (
                      <span className="badge bg-success rounded-pill ms-2">
                        {conversation.unread_count}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
      </div>
    </div>
  );
};
