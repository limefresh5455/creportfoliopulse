import { useDispatch, useSelector } from "react-redux";
import { setActiveConversation } from "../../Networking/User/Slice/chatSystemSlice";
import { useEffect, useRef } from "react";
import { MessageInput } from "./messageInput";

export const ChatSystemWindow = ({ ws }) => {
  const dispatch = useDispatch();
  const bottomRef = useRef(null);

  const {
    activeConversation,
    messages,
    messagesLoading,
    currentUser,
  } = useSelector((state) => state.chatSystemSlice);


  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!activeConversation) {
    return <div className="chat-empty">Select a chat</div>;
  }

  return (
    <div className="chat-window">
    
      <div className="chat-header">
        <button
          className="mobile-back"
          onClick={() => dispatch(setActiveConversation(null))}
        >
          ←
        </button>

    
        <h6>{activeConversation.receiver_name}</h6>
      </div>

  
      <div className="chat-messages">
        {messagesLoading ? (
          <p>Loading messages...</p>
        ) : (
          <>
            {messages
    
              .filter(
                (msg) =>
                  msg &&
                  typeof msg === "object" &&
                  typeof msg.content === "string" &&
                  "sender_id" in msg
              )
              .map((msg) => {
                const isOwn = msg.sender_id === currentUser?.id;

                return (
                  <div
                    key={msg.id ?? `${msg.sender_id}-${msg.created_at}`}
                    className={`message-bubble ${
                      isOwn ? "own" : "other"
                    }`}
                  >
                    {msg.content}
                  </div>
                );
              })}

            {messages.length === 0 && (
              <p className="chat-empty">No messages yet</p>
            )}
          </>
        )}

        <div ref={bottomRef} />
      </div>


      <MessageInput chatId={activeConversation.id} ws={ws} />
    </div>
  );
};
