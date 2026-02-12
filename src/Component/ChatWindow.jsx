import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { v4 as uuidv4 } from "uuid";
import ReactMarkdown from "react-markdown";
import {
  AskQuestionBuildingAPI,
  AskQuestionReportAPI,
} from "../Networking/Admin/APIs/GeneralinfoApi";
import {
  get_Chat_History,
  get_Session_List_Specific,
} from "../Networking/User/APIs/Chat/ChatApi";
import TypingIndicator from "./TypingIndicator";
import { AskQuestionAPI } from "../Networking/Admin/APIs/UploadDocApi";
import { BackButton } from "./backButton";
import { AskQuestionDCTAPI } from "../Networking/Admin/APIs/distilledCompTrackerApi";

export const ChatWindow = ({
  category: propCategory,
  heading,
  fileId,
  building_id,
  address,
}) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const chatRef = useRef(null);
  const textareaRef = useRef(null);
  const recognitionRef = useRef(null);

  const [category, setCategory] = useState(
    location.state?.type || propCategory
  );

  const [sessionId, setSessionId] = useState(null);
  console.log(sessionId,"sessionId");
  
  const [messages, setMessages] = useState([]);

  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [speakingIndex, setSpeakingIndex] = useState(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isLoadingSession, setIsLoadingSession] = useState(false);
  const [isReplyLoading, setIsReplyLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [previewPdf, setPreviewPdf] = useState(null);

  const isLoading = isLoadingSession || isLoadingHistory;

  const getContentType = (text) => {
    if (!text || typeof text !== 'string') return "text";

    const trimmedText = text.trim();


    if (trimmedText.startsWith('http://') ||
      trimmedText.startsWith('https://') ||
      trimmedText.startsWith('www.')) {
      try {
        const url = new URL(trimmedText.startsWith('www.') ? 'https://' + trimmedText : trimmedText);
        const path = url.pathname.toLowerCase();

        if (path.match(/\.(jpg|jpeg|png|webp|gif|bmp)$/)) return "image";
        if (path.endsWith('.pdf')) return "pdf";
        return "link";
      } catch {
        return "text";
      }
    }


    return "text";
  };

  useEffect(() => {
    if (category === "floor_plan" || category === "building_stack" || category === "LOI") {
      setSessionId("building-chat");
      setIsLoadingSession(false);
      return;
    }

    if (category === "DCT") {
      setSessionId("dct-chat");
      setIsLoadingSession(false);
      return;
    }

    if (location.state?.sessionId) {
      setSessionId(location.state.sessionId);
      setIsLoadingSession(false);
      return;
    }

   const fetchLastSession = async () => {
  setIsLoadingSession(true);
  try {
    const res = await dispatch(
      get_Session_List_Specific({
        category,
        buildingId: building_id,
      })
    ).unwrap();

    const filtered = res.filter((s) => s.category === category);

    if (filtered.length > 0) {
      const latestSession = filtered.reduce((latest, current) => {
        return new Date(current.created_at) > new Date(latest.created_at)
          ? current
          : latest;
      });

      setSessionId(latestSession.session_id);
    } else {
      setSessionId(uuidv4());
      setMessages([]);
    }
  } finally {
    setIsLoadingSession(false);
  }
};


    fetchLastSession();
  }, [category, dispatch]);

  useEffect(() => {
    if (category === "floor_plan" || category === "building_stack" || category === "LOI") {
      setMessages([]);
      setIsLoadingHistory(false);
      return;
    }

    if (category === "DCT") {
      setMessages([]);
      setIsLoadingHistory(false);
      return;
    }

    if (!sessionId) {
      setMessages([]);
      setIsLoadingHistory(false);
      return;
    }

    const fetchChatHistory = async () => {
      setIsLoadingHistory(true);
      try {
        const res = await dispatch(
          get_Chat_History({ session_id: sessionId, building_id })
        ).unwrap();
        if (Array.isArray(res) && res.length > 0) {
          const formatted = res.flatMap((item) => [
            { sender: "User", message: item.question },
            { sender: "Admin", message: item.answer },
          ]);
          setMessages(formatted);
        } else {
          setMessages([]);
        }
      } finally {
        setIsLoadingHistory(false);
      }
    };

    fetchChatHistory();
  }, [sessionId, category, dispatch]);

  const scrollToBottom = () => {
    if (chatRef.current)
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
  };
  useEffect(() => scrollToBottom(), [messages]);

  const startRecording = async () => {
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
      setSpeakingIndex(index);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return toast.warning("Please enter a message.");

    const userMessage = {
      message,
      sender: "User",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessage("");
    scrollToBottom();

    try {
      setIsSending(true);
      setIsReplyLoading(true);

      let response;

      if (category === "floor_plan" || category === "building_stack" || category === "LOI") {
        const payload = {
          question: userMessage.message,
          building_id,
          category,
        };

        response = await dispatch(AskQuestionBuildingAPI(payload)).unwrap();
      } else if (category === "report_generation") {
        const payload = {
          session_id: sessionId,
          question: userMessage.message,
          category,
          file_id: fileId,
        };

        response = await dispatch(AskQuestionReportAPI(payload)).unwrap();
      } else if (category === "DCT") {
        const payload = {
          question: userMessage.message,
        };
        response = await dispatch(AskQuestionDCTAPI(payload)).unwrap();
      } else {
        const payload = {
          session_id: sessionId,
          question: userMessage.message,
          category,
          file_id: fileId,
          building_id,
        };

        response = await dispatch(AskQuestionAPI(payload)).unwrap();
      }

      if (response?.answer) {

        const contentType = getContentType(response.answer);

        const adminMessage = {
          message: response.answer,
          sender: "Admin",
          timestamp: new Date(),
          type: contentType,
        };

        setMessages((prev) => [...prev, adminMessage]);
      } else {
        toast.warning("No response from assistant.");
      }

      scrollToBottom();
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Message failed to send.");
    } finally {
      setIsSending(false);
      setIsReplyLoading(false);
    }
  };

  const handleNewSession = () => {
    const newId = uuidv4();
    setSessionId(newId);
    setMessages([]);
    toast.info(`Started a new chat session for "${category}".`);
  };

  const handleNavigation = () => {
    navigate("/documents/LOI", {
      state: {
        buildingId: building_id,
      },
    });
  };


  return (
    <div className="container-fluid py-3" style={{ height: "100vh" }}>
      <div className="row h-100">
        <div className="col-md-12 d-flex flex-column">
          <div className="chat-header d-flex justify-content-between align-items-center mb-2 position-relative flex-wrap">
            <div className="d-flex align-items-center position-relative w-100 mt-3 mt-md-0">
              <div className="d-flex align-items-center">
                <BackButton />
              </div>

              <h5
                className="chat-title text-muted mb-0 text-truncate address-title position-absolute start-50 translate-middle-x text-center"
                title={address}
              >
                {heading}
                {address ? " - " : ""}
                {address}
              </h5>

              <div className="ms-auto d-flex align-items-center">
                {category !== "floor_plan" &&
                  category !== "building_stack" &&
                  category !== "LOI" &&
                  category !== "DCT" && (
                    <button
                      className="btn btn-outline-secondary btn-sm d-flex align-items-center"
                      onClick={handleNewSession}
                      disabled={isLoadingSession}
                    >
                      <i className="bi bi-plus-circle"></i>
                      <span className="d-none d-md-inline ms-1">
                        New Session
                      </span>
                    </button>
                  )}

                {category === "LOI" && (
                  <button
                    className="btn btn-outline-secondary btn-sm"
                    onClick={()=>handleNavigation()}
                  >
                    <i
                      className="bi bi-upload"
                      style={{ fontSize: 14 }}
                    />

                    <span className="d-none d-md-inline ms-1">
                      Upload Doc
                    </span>
                  </button>

                )}
              </div>
            </div>
          </div>

          <div className="flex-grow-1 overflow-auto p-3 bg-light rounded mb-2 hide-scrollbar">
            {isLoading ? (
              <div
                className="d-flex justify-content-center align-items-center text-muted w-100"
                style={{ minHeight: "60vh" }}
              >
                <div className="spinner-border text-secondary me-2" />
                {isLoadingSession
                  ? "Loading chat session..."
                  : "Loading chat history..."}
              </div>
            ) : (
              <div className="message-container1 hide-scrollbar" ref={chatRef}>
                {messages.length > 0 ? (
                  <>
                    {messages.map((msg, i) => (
                      <div
                        key={i}
                        className={`mb-2 small ${msg.sender === "Admin" ? "text-start" : "text-end"
                          }`}
                      >
                        <div
                          className={`d-inline-block px-3 py-2 position-relative responsive-box ${msg.sender === "Admin"
                            ? ""
                            : "bg-secondary text-light"
                            }`}
                        >
                          {msg.sender === "Admin" ? (
                            <>
                              <i
                                className={`bi ${speakingIndex === i
                                  ? "bi-volume-up-fill"
                                  : "bi-volume-mute"
                                  } ms-2`}
                                style={{
                                  cursor: "pointer",
                                  fontSize: "1rem",
                                  color: speakingIndex === i ? "#000" : "#ccc",
                                  position: "absolute",
                                  right: "8px",
                                  bottom: "18px",
                                }}
                                onClick={() => toggleSpeak(i, msg.message)}
                              ></i>
                              <div className="py-3">
                                <div className="py-3">
                                  {(!msg.type || msg.type === "text") && (
                                    <ReactMarkdown>{msg.message}</ReactMarkdown>
                                  )}

                                  {msg.type === "image" && (
                                    <img
                                      src={msg.message}
                                      alt="response"
                                      className="img-fluid rounded border"
                                      style={{
                                        cursor: "pointer",
                                        maxHeight: "300px",
                                      }}
                                      onClick={() =>
                                        setPreviewImage(msg.message)
                                      }
                                    />
                                  )}

                                  {msg.type === "pdf" && (
                                    <div
                                      style={{ cursor: "pointer" }}
                                      onClick={() => setPreviewPdf(msg.message)}
                                      className="d-inline-block"
                                    >
                                      <iframe
                                        src={msg.message}
                                        title="PDF Preview"
                                        className="w-100 rounded border shadow-sm"
                                        style={{
                                          height: "auto",
                                          maxWidth: "400px",
                                        }}
                                      />
                                      <div className="text-center text-primary fw-semibold mt-2 small">
                                        Click to view full PDF
                                      </div>
                                    </div>
                                  )}

                                  {msg.type === "link" && (
                                    <a
                                      href={msg.message}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-primary fw-semibold"
                                    >
                                      Open File
                                    </a>
                                  )}
                                </div>
                              </div>
                            </>
                          ) : (
                            msg.message
                          )}
                        </div>
                      </div>
                    ))}

                    {isReplyLoading && <TypingIndicator />}
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
            <div className="d-flex align-items-end rounded-pill py-2 px-3 bg-white shadow-sm border">
              <textarea
                ref={textareaRef}
                rows={1}
                className="form-control flex-grow-1 border-0 shadow-none bg-transparent me-2"
                placeholder={"Ask Now, Let's Work..."}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                disabled={!sessionId || isSending || isLoading}
              />

              {message.length > 0 ? (
                <button
                  className="btn btn-secondary rounded-circle"
                  onClick={handleSendMessage}
                  disabled={isSending || isLoading || !sessionId}
                >
                  {isSending ? (
                    <div className="spinner-border spinner-border-sm text-light" />
                  ) : (
                    <i className="bi bi-send-fill"></i>
                  )}
                </button>
              ) : (
                <button
                  className={`btn rounded-circle ${isRecording ? "btn-danger" : "btn-outline-secondary"
                    }`}
                  onClick={startRecording}
                  disabled={isSending || isLoading || !sessionId}
                >
                  <i
                    className={`bi ${isRecording ? "bi-mic-mute-fill" : "bi-mic-fill"
                      }`}
                  ></i>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      {previewImage && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="modal-dialog modal-dialog-centered modal-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content border-0 bg-transparent">
              <div className="modal-header border-0">
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setPreviewImage(null)}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body text-center p-0">
                <img
                  src={previewImage}
                  alt="Preview"
                  className="img-fluid rounded"
                  style={{ maxHeight: "80vh" }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
      {previewPdf && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.8)" }}
          onClick={() => setPreviewPdf(null)}
        >
          <div
            className="modal-dialog modal-dialog-centered modal-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content border-0 bg-transparent">
              <div className="modal-header border-0 pb-0">
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setPreviewPdf(null)}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body p-0">
                <iframe
                  src={previewPdf}
                  title="PDF Full View"
                  className="w-100 rounded"
                  style={{ height: "85vh", border: "none" }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
