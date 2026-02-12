import { useEffect, useRef, useState } from "react";
import {
    AskQuestionAPI,
    DeleteDocSubmit,
    ListDocSubmit,
    UpdateDocSubmit,
    UploadDocSubmit,
} from "../../../Networking/Admin/APIs/UploadDocApi";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { v4 as uuidv4 } from 'uuid';


export const UserChat = () => {
    const { DocList } = useSelector((state) => state.DocSlice);
    const dispatch = useDispatch();
    const location = useLocation();
    const initialBuildings = location.state?.office;

    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [sessionId, setSessionId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [editIndex, setEditIndex] = useState(null);
    const [fileToReplace, setFileToReplace] = useState(null);
    const [isReplacing, setIsReplacing] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [deletingIndex, setDeletingIndex] = useState(null);
    const [selectedFileIndex, setSelectedFileIndex] = useState(null);
    const [isSending, setIsSending] = useState(false);
    const [message, setMessage] = useState("");
    const [chatList, setChatList] = useState([
        { sessionId: "chat-1", name: "Project Discussion", timestamp: "2025-07-13" },
        { sessionId: "chat-2", name: "Design Feedback", timestamp: "2025-07-12" },
    ]);
    const [selectedChatId, setSelectedChatId] = useState(null);

    const fileInputRef = useRef();
    const chatRef = useRef(null); // ➕ New

    const fetchDocuments = async () => {
        if (!initialBuildings?.Building_id || !initialBuildings?.office?.id) return;

        const listdata = {
            building_id: initialBuildings.Building_id,
            office_id: initialBuildings.office.id,
        };

        const response = await dispatch(ListDocSubmit(listdata));
        if (response?.payload?.files && Array.isArray(response.payload.files)) {
            setUploadedFiles(response.payload.files);
        }
    };

    const fetchMessages = async () => {
        if (!initialBuildings?.Building_id || !initialBuildings?.office?.id) return;

        // const res = await dispatch(
        //   ListMessagesAPI({
        //     building_id: initialBuildings.Building_id,
        //     office_id: initialBuildings.office.id,
        //   })
        // ).unwrap();

        if (Array.isArray(res?.messages)) {
            setMessages(res.messages);
            scrollToBottom();
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        if (chatRef.current) {
            chatRef.current.scrollTop = chatRef.current.scrollHeight;
        }
    };

    useEffect(() => {
        fetchDocuments();
        fetchMessages();
    }, [initialBuildings]);

    const handleFileChange = async (e) => {
        const selectedFiles = Array.from(e.target.files);
        if (!selectedFiles.length) {
            alert("⚠️ No files selected.");
            return;
        }

        if (!initialBuildings?.Building_id || !initialBuildings?.office?.id) {
            alert("❌ Building ID or Office ID is missing.");
            return;
        }

        try {
            setIsUploading(true);
            const res = await dispatch(
                UploadDocSubmit({
                    files: selectedFiles,
                    buildingId: initialBuildings.Building_id,
                    office_id: initialBuildings.office.id,
                })
            ).unwrap();

            toast.success(res?.msg || "Documents uploaded successfully!");
            await fetchDocuments();
        } catch (error) {
            const errorMsg = error?.response?.data?.msg || error?.message || "❌ Upload failed";
            toast.error(errorMsg);
        } finally {
            setIsUploading(false);
        }
    };

    const handleEdit = (index) => {
        setEditIndex(index);
        if (fileInputRef.current) fileInputRef.current.click();
    };

    const handleReplace = (e) => {
        const newFile = e.target.files[0];
        if (!newFile || editIndex === null) {
            toast.error("No file selected for replacement.");
            return;
        }
        setFileToReplace(newFile);
        toast.info("New file selected. Click 'Confirm Update' to apply changes.");
    };

    const confirmUpdate = async () => {
        if (editIndex === null || !fileToReplace) {
            toast.error("No file selected for update.");
            return;
        }

        const oldFile = uploadedFiles[editIndex];
        const file_id = oldFile?.file_id;
        if (!file_id) {
            toast.error("File ID not found for replacement.");
            return;
        }

        try {
            setIsReplacing(true);
            await dispatch(
                UpdateDocSubmit({
                    new_file: fileToReplace,
                    file_id,
                    buildingId: initialBuildings?.Building_id,
                    office_id: initialBuildings?.office?.id,
                })
            ).unwrap();
            await fetchDocuments();
            setEditIndex(null);
            setFileToReplace(null);
        } catch (error) {
            toast.error("Failed to update file.");
        } finally {
            setIsReplacing(false);
        }
    };

    const handleDelete = async (file_id, index) => {
        try {
            setDeletingIndex(index);
            await dispatch(DeleteDocSubmit(file_id)).unwrap();
            await fetchDocuments();
        } catch (err) {
            toast.error("Failed to delete file.");
        } finally {
            setDeletingIndex(null);
        }
    };

    const handleSendMessage = async () => {
        if (!message.trim()) {
            toast.warning("Please enter a message.");
            return;
        }

        if (selectedFileIndex === null) {
            toast.warning("Please select a document.");
            return;
        }

        const selectedFile = uploadedFiles[selectedFileIndex];
        const buildingId = initialBuildings?.Building_id;
        const officeId = initialBuildings?.office?.id;

        if (!selectedFile?.file_id || !buildingId || !officeId) {
            toast.error("Missing file or location info.");
            return;
        }

        let newSessionId = sessionId;
        if (!sessionId) {
            newSessionId = uuidv4();
            setSessionId(newSessionId);
        }

        const payload = {
            question: message,
            file_id: selectedFile.file_id,
            building_id: buildingId,
            office_id: officeId,
            session_id: newSessionId,
        };

        const userMessage = {
            message,
            sender: "User",
            timestamp: new Date(),
        };

        try {
            setIsSending(true);
            setMessages((prev) => [...prev, userMessage]);
            setMessage("");
            scrollToBottom();

            const response = await dispatch(AskQuestionAPI(payload)).unwrap();

            const adminMessage = {
                message: response.answer,
                sender: "Admin",
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, adminMessage]);
            scrollToBottom();
        } catch (error) {
            toast.error("Send message failed.");
        } finally {
            setIsSending(false);
        }
    };





    return (
   <div className="container-fluid py-3" style={{ height: "100vh" }}>
  <div className="row h-100">
    <div className="col-md-3 border-end bg-light d-flex flex-column p-3">
     <button
  className="btn btn-light d-flex align-items-center justify-content-start gap-2 w-100 mb-3 border"
  onClick={() => {
    const newId = uuidv4();
    const newChat = {
      sessionId: newId,
      name: `New Chat ${chatList.length + 1}`,
      timestamp: new Date().toISOString().split("T")[0],
    };
    setChatList([newChat, ...chatList]);
    setMessages([]);
    setSessionId(newId);
    setSelectedChatId(newId);
  }}
  style={{ textAlign: "left" }}
>
  <span className="fw-semibold"> ➕ New Chat</span>
</button>
     <div className="flex-grow-1 overflow-auto">
  {chatList.map((chat, index) => (
    <div
      key={index}
      className={`chat-item d-flex justify-between align-items-start p-2 rounded mb-2 position-relative ${
        selectedChatId === chat.sessionId ? "text-dark" : "bg-light"
      } border`}
      style={{ cursor: "pointer" }}
      onClick={() => {
        setSelectedChatId(chat.sessionId);
        setSessionId(chat.sessionId);
        setMessages([]);
      }}
    >
      <div className="flex-grow-1">
        <div className="fw-semibold">{chat.name}</div>
        <div className="text-muted small">{chat.timestamp}</div>
      </div>
      <button
        className="btn btn-sm btn-outline-danger delete-btn"
        onClick={(e) => {
          e.stopPropagation(); 
          const updatedChats = chatList.filter((_, i) => i !== index);
          setChatList(updatedChats);
          if (selectedChatId === chat.sessionId) {
            setSelectedChatId(null);
            setMessages([]);
            setSessionId(null);
          }
        }}
      >
        <i className="bi bi-trash"></i>
      </button>
    </div>
  ))}
</div>

    </div>

    {/* Main Chat Area */}
    <div className="col-md-9 d-flex flex-column">
      {/* Chat Messages */}
      <div
        ref={chatRef}
        className="flex-grow-1 overflow-auto p-3 bg-light rounded mb-2 hide-scrollbar"
      >
        <h5 className="text-muted mb-3">💬 Chat Messages</h5>
        {messages.length > 0 ? (
          messages.map((msg, i) => (
            <div key={i} className={`mb-2 small ${msg.sender === "Admin" ? "text-start" : "text-end"}`}>
              <div
                className={`d-inline-block px-3 py-2 rounded ${msg.sender === "Admin" ? "bg-secondary text-white" : "bg-primary text-white"}`}
              >
                {msg.message}
              </div>
              <div className="text-muted fst-italic mt-1" style={{ fontSize: "0.75rem" }}>
                {msg.sender} • {new Date(msg.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ))
        ) : (
          <div className="text-muted">No messages yet.</div>
        )}

        {isSending && (
          <div className="text-start small mt-2">
            <div className="d-inline-block px-3 py-2 rounded bg-secondary text-white">
              <span className="spinner-border spinner-border-sm me-2" role="status" />
              Admin is typing...
            </div>
          </div>
        )}
      </div>

      <div className="pt-2">
        <div className="overflow-auto mb-2 p-2 bg-white border rounded hide-scrollbar" style={{ maxHeight: "105px" }}>
          <h5 className="mb-3">📄 Uploaded Documents</h5>
          {uploadedFiles.length > 0 ? (
            uploadedFiles.map((file, index) => (
              <div
                key={index}
                className={`border p-2 rounded mb-2 ${selectedFileIndex === index ? "border-primary bg-light" : ""}`}
                onClick={() => setSelectedFileIndex(index)}
                style={{ cursor: "pointer" }}
              >
                <div className="d-flex justify-content-between align-items-center">
                  <span>{file.original_file_name || file.name}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-muted">No documents uploaded yet.</div>
          )}
        </div>

        {/* Upload/Replace Indicators */}
        {isUploading && (
          <div className="text-primary mb-2">
            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
            Uploading...
          </div>
        )}
        {fileToReplace && editIndex !== null && (
          <div className="mb-3">
            <button className="btn btn-success" onClick={confirmUpdate} disabled={isReplacing}>
              {isReplacing ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Updating...
                </>
              ) : (
                "Confirm Update File"
              )}
            </button>
          </div>
        )}

        {/* Selected File Alert */}
        {selectedFileIndex !== null && uploadedFiles[selectedFileIndex] && (
          <div className="alert alert-secondary d-flex justify-content-between align-items-center p-2 mb-2">
            <div>{uploadedFiles[selectedFileIndex].original_file_name || uploadedFiles[selectedFileIndex].name}</div>
            <i
              className="bi bi-x-circle me-1"
              onClick={() => setSelectedFileIndex(null)}
              style={{ cursor: "pointer" }}
            ></i>
          </div>
        )}

        {/* Hidden File Input */}
        <input type="file" ref={fileInputRef} className="d-none" onChange={handleReplace} />

        {/* Message Input */}
        <div className="d-flex align-items-center border rounded p-2 bg-white">
          <input
            type="text"
            className="form-control me-2"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button className="btn btn-primary" onClick={handleSendMessage}>
            <i className="bi bi-send"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</div>

    );
};




