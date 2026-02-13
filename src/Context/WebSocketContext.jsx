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
} from "../Networking/User/Slice/chatSystemSlice";

const WebSocketContext = createContext(null);
export const useWebSocket = () => useContext(WebSocketContext);

export const WebSocketProvider = ({ children }) => {
  const dispatch = useDispatch();
  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const [status, setStatus] = useState("🔴 Disconnected");
  const [isConnected, setIsConnected] = useState(false);
  const { userdata } = useSelector((state) => state.ProfileSlice);
  const myUserId = userdata?.id;
  const token = sessionStorage.getItem("access_token");

  const currentConversationRef = useRef(null);
  const currentReceiverRef = useRef(null);

  const cleanup = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  const connect = useCallback(() => {
    cleanup();

    if (!token || !myUserId) {
      console.log("No token or user ID available for WebSocket connection");
      return;
    }

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      console.log("WebSocket already connected");
      return;
    }

    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }

    const wsUrl = `wss://5422-182-70-240-84.ngrok-free.app/messenger/ws?token=${token}`;
    console.log("Connecting to WebSocket:", wsUrl);

    socketRef.current = new WebSocket(wsUrl);

    socketRef.current.onopen = () => {
      console.log("WebSocket connected successfully");
      setStatus("🟢 Connected");
      setIsConnected(true);
    };

    socketRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        // console.log("WebSocket message received:", data);

        switch (data.type) {
          case "MY_PRESENCE":
            // console.log("My presence:", data);
            break;

          case "USER_STATUS":
            // console.log("User status update:", data);
            dispatch(
              setUserStatus({
                user_id: data.user_id,
                online: data.online,
                last_seen: data.last_seen,
              }),
            );
            break;

          case "TYPING":
            // console.log("Typing indicator received:", data);

            if (data.sender_id && data.sender_id !== myUserId) {
              const conversationId = currentConversationRef.current;

              if (conversationId) {
                console.log(
                  `User ${data.sender_id} is typing in conversation ${conversationId}`,
                );

                dispatch(
                  setTypingStatus({
                    conversation_id: conversationId,
                    sender_id: data.sender_id,
                    is_typing: data.is_typing !== false,
                  }),
                );

                if (data.is_typing !== false) {
                  setTimeout(() => {
                    console.log(
                      `Auto-clearing typing for user ${data.sender_id}`,
                    );
                    dispatch(
                      setTypingStatus({
                        conversation_id: conversationId,
                        sender_id: data.sender_id,
                        is_typing: false,
                      }),
                    );
                  }, 3000);
                }
              } else {
                console.warn("No current conversation for typing indicator");
              }
            }
            break;

          case "NEW_MESSAGE":
            console.log("New message received:", data);
            dispatch(
              addMessageSocket({
                id: data.message_id || data.id,
                conversation_id: data.conversation_id,
                sender_id: data.sender_id,
                content: data.content,
                created_at: data.created_at,
                file_id: data.file_id,
                sender_name: data.sender_name,
              }),
            );
            break;

          case "HEARTBEAT_ACK":
            break;

          case "ERROR":
            console.error("WebSocket error:", data.message);
            break;

          default:
            console.warn("Unknown WebSocket message type:", data.type, data);
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error, event.data);
      }
    };

    socketRef.current.onclose = (event) => {
      console.log("🔌 WebSocket disconnected:", {
        code: event.code,
        reason: event.reason,
        wasClean: event.wasClean,
      });

      socketRef.current = null;
      setStatus("🔴 Disconnected");
      setIsConnected(false);

      if (event.code === 1008) {
        console.log("Authentication failed, not reconnecting");
        return;
      }

      cleanup();
      reconnectTimeoutRef.current = setTimeout(() => {
        console.log("🔄 Attempting to reconnect WebSocket...");
        connect();
      }, 5000);
    };

    socketRef.current.onerror = (error) => {
      console.error("WebSocket error event:", error);
    };
  }, [token, myUserId, dispatch, cleanup]);

  const sendMessage = useCallback(
    (payload) => {
      if (!socketRef.current) {
        console.error("WebSocket not initialized");
        return false;
      }

      if (socketRef.current.readyState === WebSocket.OPEN) {
        try {
          socketRef.current.send(JSON.stringify(payload));
          return true;
        } catch (error) {
          console.error("Error sending WebSocket message:", error);
          return false;
        }
      } else {
        console.warn(
          "WebSocket not connected. State:",
          socketRef.current?.readyState,
        );

        if (socketRef.current?.readyState === WebSocket.CLOSED) {
          console.log("Attempting to reconnect...");
          connect();
        }

        return false;
      }
    },
    [connect],
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
    [sendMessage, myUserId],
  );

  const sendHeartbeat = useCallback(() => {
    sendMessage({
      type: "HEARTBEAT",
    });
  }, [sendMessage]);

  const setCurrentConversation = useCallback((conversationId, receiverId) => {
    currentConversationRef.current = conversationId;
    currentReceiverRef.current = receiverId;
  }, []);

  const getCurrentConversation = useCallback(() => {
    return {
      conversationId: currentConversationRef.current,
      receiverId: currentReceiverRef.current,
    };
  }, []);

  useEffect(() => {
    if (myUserId && token && !isConnected) {
      connect();
    }
  }, [myUserId, token, isConnected, connect]);

  useEffect(() => {
    if (!isConnected) return;

    const interval = setInterval(() => {
      sendHeartbeat();
    }, 30000);

    return () => clearInterval(interval);
  }, [isConnected, sendHeartbeat]);

  useEffect(() => {
    return () => {
      cleanup();
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
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
