import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addMessageSocket,
  setTypingStatus,
  setUserStatus,
  deleteMessageSocket,
} from "../Networking/User/Slice/chatSystemSlice";


const WebSocketContext = createContext(null);
export const useWebSocket = () => useContext(WebSocketContext);


const getToken = () =>
  sessionStorage.getItem("access_token") ||
  sessionStorage.getItem("token");

const getUserIdFromStorage = () =>
  sessionStorage.getItem("user_id") ||
  sessionStorage.getItem("admin_id");


export const WebSocketProvider = ({ children }) => {
  const dispatch = useDispatch();
  const socketRef = useRef(null);
  const reconnectTimer = useRef(null);

  const [status, setStatus] = useState("🔴 Disconnected");
  const [isConnected, setIsConnected] = useState(false);

  const { userdata } = useSelector((s) => s.ProfileSlice || {});
  const myUserId = userdata?.id || getUserIdFromStorage();
  const token = getToken();

  const currentConversationRef = useRef(null);
  const currentReceiverRef = useRef(null);


  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);



  const showNotification = ({ title, body, url }) => {
    if (!("Notification" in window)) return;

    if (Notification.permission === "granted" && document.hidden) {
      const n = new Notification(title, { body });

      n.onclick = () => {
        window.focus();
        if (url) window.location.href = url;
      };
    }
  };


  const entryEventMap = {
    ENTRY_APPROVED: { label: "Approved", actor: "reviewed_by_name" },
    ENTRY_REJECTED: { label: "Rejected", actor: "reviewed_by_name" },
    ENTRY_DELETED: { label: "Deleted", actor: "deleted_by_name" },
    NEW_SUBMISSION: { label: "Submitted", actor: "submitted_by_name" },
  };


  const cleanup = useCallback(() => {
    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current);
      reconnectTimer.current = null;
    }
  }, []);


  const connect = useCallback(() => {
    cleanup();

    if (!token) {
      console.warn("❌ No token — socket not connecting");
      return;
    }

    if (!myUserId) {
      console.warn("❌ No userId — socket waiting");
      return;
    }

    if (socketRef.current?.readyState === WebSocket.OPEN) return;

    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }

    const wsUrl = `wss://d49a-182-70-240-84.ngrok-free.app/messenger/ws?token=${token}`;
    console.log("WS CONNECTING →", wsUrl);

    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("WebSocket Connected");
      setStatus("🟢 Connected");
      setIsConnected(true);
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);


        if (entryEventMap[data.type]) {
          const cfg = entryEventMap[data.type];

          showNotification({
            title: `Entry ${cfg.label}`,
            body: `${data[cfg.actor]} ${cfg.label.toLowerCase()} a ${data.category} entry`,
            url: `/building/${data.building_id}`,
          });
          return;
        }


        switch (data.type) {
          case "USER_STATUS":
            dispatch(
              setUserStatus({
                user_id: data.user_id,
                online: data.online,
                last_seen: data.last_seen,
              })
            );
            break;

          case "TYPING":
            if (data.sender_id !== myUserId) {
              const conversationId = currentConversationRef.current;

              if (conversationId) {
                dispatch(
                  setTypingStatus({
                    conversation_id: conversationId,
                    sender_id: data.sender_id,
                    is_typing: data.is_typing !== false,
                  })
                );

                if (data.is_typing !== false) {
                  setTimeout(() => {
                    dispatch(
                      setTypingStatus({
                        conversation_id: conversationId,
                        sender_id: data.sender_id,
                        is_typing: false,
                      })
                    );
                  }, 3000);
                }
              }
            }
            break;

          case "NEW_MESSAGE":
            dispatch(
              addMessageSocket({
                id: data.message_id || data.id,
                conversation_id: data.conversation_id,
                sender_id: data.sender_id,
                sender_name: data.sender_name,
                content: data.content || "",
                created_at: data.created_at,
                file_id: data.file_id || null,
                file_name: data.file_name || null,
                file_url: data.file_url || null,
                file_type: data.file_name
                  ? data.file_name.split(".").pop().toLowerCase()
                  : null,
              })
            );
            break;

          case "MESSAGE_DELETED":
            dispatch(
              deleteMessageSocket({
                conversation_id: data.conversation_id,
                message_id: data.message_id,
              })
            );
            break;

          case "NOTIFICATION":
            showNotification({
              title: data.title || "Notification",
              body: data.message || "",
              url: data.url,
            });
            break;

          case "ERROR":
            console.error("Socket error:", data.message);
            break;

          default:
            console.warn("Unknown socket type:", data.type);
        }
      } catch (err) {
        console.error("Socket parse error:", err);
      }
    };

    socket.onclose = (event) => {
      console.log("Socket closed:", event.code);

      setStatus("🔴 Disconnected");
      setIsConnected(false);
      socketRef.current = null;

      if (event.code === 1008) return;

      reconnectTimer.current = setTimeout(connect, 5000);
    };

    socket.onerror = (err) => {
      console.error("Socket error:", err);
    };
  }, [token, myUserId, dispatch, cleanup]);

  useEffect(() => {
    const handleAuthChange = () => {
      console.log("Auth changed → reconnecting socket");
      connect();
    };

    window.addEventListener("authChanged", handleAuthChange);

    return () => {
      window.removeEventListener("authChanged", handleAuthChange);
    };
  }, [connect]);


  const sendMessage = useCallback(
    (payload) => {
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify(payload));
        return true;
      }

      if (socketRef.current?.readyState === WebSocket.CLOSED) connect();

      return false;
    },
    [connect]
  );

  const sendTypingIndicator = useCallback(
    (receiverId, isTyping = true) => {
      const conversationId = currentConversationRef.current;

      if (myUserId && receiverId && conversationId) {
        sendMessage({
          type: "TYPING",
          receiver_id: receiverId,
          conversation_id: conversationId,
          is_typing: isTyping,
        });
      }
    },
    [sendMessage, myUserId]
  );


  const sendHeartbeat = useCallback(() => {
    sendMessage({ type: "HEARTBEAT" });
  }, [sendMessage]);


  const setCurrentConversation = (conversationId, receiverId) => {
    currentConversationRef.current = conversationId;
    currentReceiverRef.current = receiverId;
  };

  const getCurrentConversation = () => ({
    conversationId: currentConversationRef.current,
    receiverId: currentReceiverRef.current,
  });



  useEffect(() => {
    if (!isConnected && token && myUserId) connect();
  }, [token, myUserId, isConnected, connect]);

 

  useEffect(() => {
    if (!isConnected) return;
    const interval = setInterval(sendHeartbeat, 30000);
    return () => clearInterval(interval);
  }, [isConnected, sendHeartbeat]);


  useEffect(() => {
    return () => {
      cleanup();
      socketRef.current?.close();
    };
  }, [cleanup]);


  return (
    <WebSocketContext.Provider
      value={{
        sendMessage,
        sendTypingIndicator,
        sendHeartbeat,
        setCurrentConversation,
        getCurrentConversation,
        status,
        isConnected,
        myUserId,
        connect,
        disconnect: cleanup,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};