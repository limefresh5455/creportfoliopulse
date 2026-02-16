import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { v4 as uuidv4 } from "uuid";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";
import {
  get_Gemini_Chat_History,
  get_Session_List_Specific,
} from "../../../Networking/User/APIs/Chat/ChatApi";
import TypingIndicator from "../../../Component/TypingIndicator";
import {
  AskQuestionGeminiAPI,
  DeleteGeneralDocSubmit,
  ListGeminiDoc,
  UploadgeminiDocSubmit,
} from "../../../Networking/Admin/APIs/GeneralinfoApi";
import { Modal } from "react-bootstrap";

const SafeMarkdown = ({ children, className = "" }) => {
  const [error, setError] = useState(null);

  if (error) {
    return (
      <div className={`text-danger small ${className}`}>
        <i className="bi bi-exclamation-triangle me-1"></i>
        Error rendering content
      </div>
    );
  }

  if (!children || typeof children !== "string") {
    return <div className={className}>{children || ""}</div>;
  }

  try {
    return (
      <div className={className}>
        <ReactMarkdown
          components={{
            p: ({ children }) => <p className="mb-1">{children}</p>,
            ul: ({ children }) => <ul className="mb-2 ps-3">{children}</ul>,
            ol: ({ children }) => <ol className="mb-2 ps-3">{children}</ol>,
            li: ({ children }) => <li className="mb-1">{children}</li>,
            code: ({ children }) => (
              <code className="bg-light px-1 rounded">{children}</code>
            ),
            pre: ({ children }) => (
              <pre className="bg-light p-2 rounded">{children}</pre>
            ),
          }}
        >
          {children}
        </ReactMarkdown>
      </div>
    );
  } catch (err) {
    console.error("Markdown rendering error:", err);
    return <div className={className}>{children}</div>;
  }
};

export const GeminiChat = () => {
  const dispatch = useDispatch();
  const location = useLocation();

  const chatRef = useRef(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const recognitionRef = useRef(null);
  const fileInputRef = useRef(null);

  const [sessionId, setSessionId] = useState(location.state?.sessionId || null);
  console.log(sessionId, "sessionIdsessionId");

  const [category, setCategory] = useState(location.state?.type);
  const [messages, setMessages] = useState([]);

  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [speakingIndex, setSpeakingIndex] = useState(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isLoadingSession, setIsLoadingSession] = useState(false);
  const [isReplyLoading, setIsReplyLoading] = useState(false);
  const [isChatStarted, setIsChatStarted] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingDocId, setDeletingDocId] = useState(null);
  const [showDocsModal, setShowDocsModal] = useState(false);
  const [docs, setDocs] = useState([]);
  const [isDocsLoading, setIsDocsLoading] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [attachedFile, setAttachedFile] = useState(null);
  const [attachedPreview, setAttachedPreview] = useState(null);

  const isLoading = isLoadingSession;

  useEffect(() => {
    if (messages.length > 0 || sessionId) {
      setIsChatStarted(true);
    }
  }, [messages, sessionId]);

  useEffect(() => {
    if (location.state?.sessionId) {
      setSessionId(location.state.sessionId);
      setSessionReady(true);
      return;
    }

    const fetchLastSession = async () => {
      setIsLoadingSession(true);
      try {
        const res = await dispatch(get_Session_List_Specific()).unwrap();

        const filtered = res.filter((s) => s.category === "Gemini");
        console.log(filtered, "filtered");

        if (filtered.length > 0) {
          filtered.sort(
            (a, b) => new Date(b.created_at) - new Date(a.created_at),
          );
          const latestSession = filtered[0].session_id;
          console.log(latestSession, "latestSession");

          setSessionId(latestSession);
        } else {
          setSessionId(null);
          setMessages([]);
        }
      } catch (err) {
        setSessionId(null);
        setMessages([]);
      } finally {
        setIsLoadingSession(false);
        setSessionReady(true);
      }
    };

    fetchLastSession();
  }, [dispatch, location.state]);

  useEffect(() => {
    if (!sessionReady || !sessionId) {
      if (sessionReady) {
        setInitialLoadComplete(true);
        setIsLoadingHistory(false);
      }
      return;
    }

    const fetchChatHistory = async () => {
      setIsLoadingHistory(true);
      try {
        const session_id = sessionId;
        const res = await dispatch(
          get_Gemini_Chat_History({ session_id }),
        ).unwrap();

        if (Array.isArray(res) && res.length > 0) {
          const formatted = res.flatMap((item) => [
            {
              sender: "User",
              message: item.question || "",
              file:
                Array.isArray(item.file_meta) && item.file_meta.length > 0
                  ? {
                      name: item.file_meta[0].name,
                      size: item.file_meta[0].size,
                      url: item.file_meta[0].url || null,
                    }
                  : null,

              timestamp: item.created_at,
            },
            {
              sender: "Admin",
              message: item.answer || "",
              file: null,
              timestamp: item.created_at,
            },
          ]);

          setMessages(formatted);
        } else {
          setMessages([]);
        }
      } catch (error) {
        console.error("Failed to fetch chat history:", error);
        setMessages([]);
      } finally {
        setIsLoadingHistory(false);
        setInitialLoadComplete(true);
      }
    };

    fetchChatHistory();
  }, [sessionReady, sessionId, dispatch]);

  const scrollToBottom = () => {
    setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      } else if (chatRef.current) {
        chatRef.current.scrollTop = chatRef.current.scrollHeight;
      }
    }, 500);
  };

  useEffect(() => {
    if (!isLoadingHistory) {
      scrollToBottom();
    }
  }, [messages, isReplyLoading, isLoadingHistory]);

  useEffect(() => {
    if (!isLoadingHistory && messages.length > 0) {
      setTimeout(() => {
        scrollToBottom();
      }, 200);
    }
  }, [isLoadingHistory, messages.length]);

  const startRecording = async () => {
    if (!initialLoadComplete) {
      toast.info("Please wait while chat loads...");
      return;
    }

    if (
      !("webkitSpeechRecognition" in window || "SpeechRecognition" in window)
    ) {
      toast.error("Speech Recognition not supported.");
      return;
    }

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });

      if (!recognitionRef.current) {
        const SpeechRecognition =
          window.SpeechRecognition || window.webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = "en-US";

        recognitionRef.current.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          setMessage(transcript);
        };

        recognitionRef.current.onerror = () => {
          toast.error("Voice not recognized. Try again.");
          setIsRecording(false);
        };

        recognitionRef.current.onend = () => setIsRecording(false);
      }

      if (!isRecording) {
        recognitionRef.current.start();
        setIsRecording(true);
      } else {
        recognitionRef.current.stop();
        setIsRecording(false);
      }
    } catch {
      toast.error("Microphone not found or access denied.");
    }
  };

  const toggleSpeak = (index, text) => {
    if (speakingIndex === index) {
      window.speechSynthesis.cancel();
      setSpeakingIndex(null);
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.onend = () => setSpeakingIndex(null);
      utterance.onerror = () => setSpeakingIndex(null);
      setSpeakingIndex(index);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleAttachFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!["application/pdf"].includes(file.type)) {
      toast.error("Only PDF files are allowed");
      return;
    }

    if (file.size > 30 * 1024 * 1024) {
      toast.error("File size must be under 30MB");
      return;
    }

    setAttachedFile(file);
    setAttachedPreview({
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(2),
      type: file.type,
    });

    if (!isChatStarted && !sessionId) {
      handleNewSession();
    }
  };

  const handleSendMessage = async () => {
    if (!initialLoadComplete) {
      toast.info("Please wait while chat loads...");
      return;
    }

    if (!message.trim() && !attachedFile) {
      toast.warning("Type a message or attach a file.");
      return;
    }

    if (!sessionId) {
      toast.info("Please start a new chat session first.");
      return;
    }

    const userMessage = {
      sender: "User",
      message:
        message.trim() || (attachedFile ? `File: ${attachedPreview.name}` : ""),
      file: attachedPreview || null,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessage("");
    setIsChatStarted(true);

    try {
      setIsSending(true);
      setIsReplyLoading(true);

      const formData = new FormData();
      formData.append("session_id", sessionId);
      formData.append("category", "Gemini");
      formData.append(
        "question",
        message ||
          (attachedFile
            ? `Analyze this document: ${attachedPreview.name}`
            : ""),
      );

      if (attachedFile) {
        formData.append("files", attachedFile);
      }

      const response = await dispatch(AskQuestionGeminiAPI(formData)).unwrap();

      if (response?.answer) {
        setMessages((prev) => [
          ...prev,
          {
            sender: "Admin",
            message: response.answer || "",
            file: attachedPreview ? { name: attachedPreview.name } : null,
            timestamp: new Date().toISOString(),
          },
        ]);
      }
    } catch (err) {
      console.error("Send message error:", err);
      toast.error("Message failed to send");

      setMessages((prev) =>
        prev.filter(
          (msg) =>
            !(msg.sender === "User" && msg.timestamp === userMessage.timestamp),
        ),
      );
    } finally {
      setIsSending(false);
      setIsReplyLoading(false);
      setAttachedFile(null);
      setAttachedPreview(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = null;
      }
    }
  };

  const handleNewSession = () => {
    if (!initialLoadComplete) {
      toast.info("Please wait while chat loads...");
      return;
    }

    const newId = uuidv4();
    setSessionId(newId);
    setMessages([]);
    setIsChatStarted(true);
    setInitialLoadComplete(true);

    setAttachedFile(null);
    setAttachedPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
  };

  const LoadingSpinner = () => (
    <div className="d-flex justify-content-center align-items-center py-4">
      <div className="spinner-border text-secondary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      <span className="ms-2 text-muted">Loading...</span>
    </div>
  );

  const MessageBubble = ({ msg, index }) => {
    const isAdmin = msg.sender === "Admin";

    return (
      <div
        className={`d-inline-block px-3 py-2 position-relative responsive-box ${
          isAdmin ? "" : "bg-secondary text-light"
        }`}
        style={{ maxWidth: "85%" }}
      >
        {isAdmin && msg.message && (
          <i
            className={`bi ${
              speakingIndex === index ? "bi-volume-up-fill" : "bi-volume-mute"
            }`}
            style={{
              cursor: "pointer",
              fontSize: "1rem",
              color: speakingIndex === index ? "#000" : "#ccc",
              position: "absolute",
              right: "8px",
              bottom: "18px",
            }}
            onClick={() => toggleSpeak(index, msg.message)}
          />
        )}

        {msg.file && (
          <div className="mb-2 p-2 bg-light rounded border">
            <div className="d-flex align-items-center">
              <i className="bi bi-file-earmark-pdf text-danger me-2"></i>
              <div className="small">
                <div className="fw-semibold text-dark">{msg.file.name}</div>
              </div>
            </div>
          </div>
        )}

        {msg.message && (
          <div className="py-1">
            {isAdmin ? <SafeMarkdown>{msg.message}</SafeMarkdown> : msg.message}
          </div>
        )}
      </div>
    );
  };

  const isActionDisabled = isLoadingHistory || !initialLoadComplete;

  return (
    <div className="container-fluid py-3" style={{ height: "100vh" }}>
      <AnimatePresence mode="wait">
        {!isChatStarted && messages.length === 0 ? (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.4 }}
            className="d-flex justify-content-center align-items-center h-100"
          >
            <div
              className="p-4 bg-white shadow-sm rounded-4 text-center"
              style={{ width: "100%", maxWidth: 600 }}
            >
              <h5 className="mb-3 text-muted d-flex align-items-center justify-content-between">
                <span className="d-flex align-items-center">
                  <i
                    className="bi bi-stars me-2 text-secondary"
                    style={{ fontSize: "1.3rem" }}
                  ></i>
                  Gemini
                </span>
              </h5>

              {isLoading || !initialLoadComplete ? (
                <LoadingSpinner />
              ) : (
                <>
                  {attachedPreview && (
                    <div className="mb-3 px-3 py-2 bg-light border rounded d-flex justify-content-between align-items-center">
                      <div className="small">
                        <i className="bi bi-file-earmark-pdf text-danger me-2"></i>
                        {attachedPreview.name}
                        <span className="text-muted ms-2">
                          ({attachedPreview.size} MB)
                        </span>
                      </div>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => {
                          setAttachedFile(null);
                          setAttachedPreview(null);
                        }}
                      >
                        <i className="bi bi-x"></i>
                      </button>
                    </div>
                  )}

                  <div className="d-flex align-items-end rounded-pill py-2 px-3 bg-light border position-relative">
                    <label
                      htmlFor="welcomeFileUpload"
                      className={`btn btn-link p-0 me-2 d-flex align-items-center ${isActionDisabled ? "disabled" : ""}`}
                      style={{
                        cursor: isActionDisabled ? "not-allowed" : "pointer",
                      }}
                    >
                      <i
                        className="bi bi-paperclip text-secondary"
                        style={{
                          fontSize: "1.2rem",
                          opacity: isActionDisabled ? 0.5 : 1,
                        }}
                      ></i>
                    </label>

                    <input
                      id="welcomeFileUpload"
                      ref={fileInputRef}
                      type="file"
                      className="d-none"
                      accept=".pdf"
                      onChange={handleAttachFile}
                      disabled={isActionDisabled}
                    />

                    <textarea
                      ref={textareaRef}
                      rows={1}
                      className="form-control flex-grow-1 border-0 shadow-none bg-transparent me-2"
                      placeholder="Type your message or attach a PDF..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      disabled={isSending || isActionDisabled}
                    />

                    {message.length > 0 || attachedFile ? (
                      <button
                        className="btn btn-secondary rounded-circle"
                        onClick={handleSendMessage}
                        disabled={isSending || isActionDisabled}
                        style={{ width: "38px", height: "38px" }}
                      >
                        {isSending ? (
                          <div className="spinner-border spinner-border-sm text-light" />
                        ) : (
                          <i className="bi bi-send-fill"></i>
                        )}
                      </button>
                    ) : (
                      <button
                        className={`btn rounded-circle ${
                          isRecording ? "btn-danger" : "btn-outline-secondary"
                        } ${isActionDisabled ? "disabled" : ""}`}
                        onClick={startRecording}
                        disabled={isSending || isActionDisabled}
                        style={{ width: "38px", height: "38px" }}
                      >
                        <i
                          className={`bi ${
                            isRecording ? "bi-mic-mute-fill" : "bi-mic-fill"
                          }`}
                        ></i>
                      </button>
                    )}
                  </div>

                  <div className="mt-3 d-flex gap-2 justify-content-center">
                    <button
                      className={`btn btn-outline-secondary btn-sm ${isActionDisabled ? "disabled" : ""}`}
                      onClick={handleNewSession}
                      disabled={isLoading || isActionDisabled}
                    >
                      <i className="bi bi-plus-circle me-1"></i> New Session
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="chat"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.4 }}
            className="h-100"
          >
            <div className="row h-100">
              <div className="col-md-12 d-flex flex-column">
                <div className="chat-header d-flex justify-content-between align-items-center mb-2">
                  <h5 className="chat-title text-muted mb-0 d-flex align-items-center">
                    <i
                      className="bi bi-stars me-2 text-secondary"
                      style={{ fontSize: "1.3rem" }}
                    ></i>
                    Gemini
                  </h5>

                  <div className="mt-3 d-flex gap-2">
                    <button
                      className={`btn btn-outline-secondary btn-sm d-flex align-items-center ${isActionDisabled ? "disabled" : ""}`}
                      onClick={handleNewSession}
                      disabled={isLoading || isActionDisabled}
                    >
                      <i className="bi bi-plus-circle me-1"></i>
                      <span className="d-none d-sm-inline">New Session</span>
                    </button>
                  </div>
                </div>

                <div
                  ref={chatRef}
                  className="flex-grow-1 overflow-auto p-3 bg-light rounded mb-2 hide-scrollbar"
                >
                  {isLoadingHistory || !initialLoadComplete ? (
                    <LoadingSpinner />
                  ) : (
                    <div className="message-container1 hide-scrollbar">
                      {messages.length > 0 ? (
                        <>
                          {messages.map((msg, i) => (
                            <div
                              key={i}
                              className={`mb-3 ${msg.sender === "Admin" ? "text-start" : "text-end"}`}
                            >
                              <MessageBubble msg={msg} index={i} />
                            </div>
                          ))}

                          {isReplyLoading && <TypingIndicator />}
                          <div ref={messagesEndRef} />
                        </>
                      ) : (
                        <div
                          className="d-flex justify-content-center align-items-center text-muted w-100 text-center"
                          style={{ minHeight: "60vh" }}
                        >
                          No messages yet.
                          {!sessionId &&
                            " Click 'New Session' to start a conversation."}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-2 pb-1">
                  {attachedPreview && (
                    <div className="mb-2 px-3 py-2 bg-light border rounded d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center">
                        <i className="bi bi-file-earmark-pdf text-danger me-2"></i>
                        <div>
                          <div className="small fw-semibold">
                            {attachedPreview.name}
                          </div>
                          <div
                            className="text-muted"
                            style={{ fontSize: "0.75rem" }}
                          >
                            {attachedPreview.size} MB • Ready to send
                          </div>
                        </div>
                      </div>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => {
                          setAttachedFile(null);
                          setAttachedPreview(null);
                        }}
                      >
                        <i className="bi bi-x"></i>
                      </button>
                    </div>
                  )}

                  <div className="d-flex align-items-end rounded-pill py-2 px-3 bg-white shadow-sm border">
                    <label
                      htmlFor="chatFileUpload"
                      className={`btn btn-link p-0 me-2 d-flex align-items-center ${isActionDisabled ? "disabled" : ""}`}
                      style={{
                        cursor: isActionDisabled ? "not-allowed" : "pointer",
                      }}
                    >
                      <i
                        className="bi bi-paperclip text-secondary"
                        style={{
                          fontSize: "1.2rem",
                          opacity: isActionDisabled ? 0.5 : 1,
                        }}
                      ></i>
                    </label>
                    <input
                      id="chatFileUpload"
                      ref={fileInputRef}
                      type="file"
                      className="d-none"
                      accept=".pdf"
                      onChange={handleAttachFile}
                      disabled={isActionDisabled}
                    />

                    <textarea
                      ref={textareaRef}
                      rows={1}
                      className="form-control flex-grow-1 border-0 shadow-none bg-transparent me-2"
                      placeholder={
                        isActionDisabled
                          ? "Loading chat..."
                          : "Type your message"
                      }
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          if (!isActionDisabled) {
                            handleSendMessage();
                          }
                        }
                      }}
                      disabled={isSending || isReplyLoading || isActionDisabled}
                    />

                    {message.length > 0 || attachedFile ? (
                      <button
                        className="btn btn-secondary rounded-circle"
                        onClick={handleSendMessage}
                        disabled={
                          isSending || isReplyLoading || isActionDisabled
                        }
                        style={{ width: "38px", height: "38px" }}
                      >
                        {isSending ? (
                          <div className="spinner-border spinner-border-sm text-light" />
                        ) : (
                          <i className="bi bi-send-fill"></i>
                        )}
                      </button>
                    ) : (
                      <button
                        className={`btn rounded-circle ${
                          isRecording ? "btn-danger" : "btn-outline-secondary"
                        } ${isActionDisabled ? "disabled" : ""}`}
                        onClick={startRecording}
                        disabled={
                          isSending || isReplyLoading || isActionDisabled
                        }
                        style={{ width: "38px", height: "38px" }}
                      >
                        <i
                          className={`bi ${
                            isRecording ? "bi-mic-mute-fill" : "bi-mic-fill"
                          }`}
                        ></i>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
