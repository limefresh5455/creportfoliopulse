import React, { useEffect, useState } from "react";
import { Card, Button, Form, Modal, Accordion, Spinner } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import {
  createThoughtApi,
  deleteThoughtApi,
  deleteThreadsApi,
  get_Threads_Api,
  getThreadhistory,
  updateThoughtApi,
} from "../../../Networking/Admin/APIs/forumApi";
import { CreateThread } from "./createThread";
import { toast } from "react-toastify";
import { getProfileDetail } from "../../../Networking/User/APIs/Profile/ProfileApi";

export const PortfolioForum = () => {
  const dispatch = useDispatch();
  const { ThreadList } = useSelector((state) => state.ForumSlice);
  const { userdata } = useSelector((state) => state.ProfileSlice);

  const messagesEndRef = React.useRef(null);
  const fileInputRef = React.useRef(null);

  const [threads, setThreads] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [threadMessages, setThreadMessages] = useState([]);

  const [userdetail, setUserdetail] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFilePreview, setSelectedFilePreview] = useState(null);
  const [isExistingFile, setIsExistingFile] = useState(false);

  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [editingThoughtId, setEditingThoughtId] = useState(null);
  const [loadingId, setLoadingId] = useState(null);
  const [sending, setSending] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [threadToDelete, setThreadToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [threadMessages]);

  useEffect(() => {
    setLoadingThreads(true);
    dispatch(getProfileDetail());
    dispatch(get_Threads_Api())
      .unwrap()
      .finally(() => setLoadingThreads(false));
  }, []);

  useEffect(() => {
    setThreads(ThreadList);
  }, [ThreadList]);

  const formatRelativeDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();

    const diffTime = now - date;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    return `${diffDays}d ago`;
  };

  const filteredThreads = threads.filter(
    (t) =>
      t.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.author_name?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleCreatethread = () => {
    setShowCreateModal(true);
  };

  const handleDeleteThread = async (threadId) => {
    setThreadToDelete(threadId);
    setShowDeleteModal(true);
  };

  const confirmDeleteThread = async () => {
    try {
      setDeletingId(threadToDelete);
      await dispatch(deleteThreadsApi({ thread_id: threadToDelete })).unwrap();
      await dispatch(get_Threads_Api()).unwrap();
      if (selectedThread?.id === threadToDelete) {
        setSelectedThread(null);
        setThreadMessages([]);
      }
      toast.success("Thread deleted successfully");
    } catch (err) {
      toast.error("Failed to delete thread");
    } finally {
      setDeletingId(null);
      setShowDeleteModal(false);
      setThreadToDelete(null);
    }
  };

  const handlethreadhistory = async (thread) => {
    setSelectedThread(thread);
    setLoadingHistory(true);
    setUserdetail(userdata?.id);
    setEditingThoughtId(null);
    setNewMessage("");
    setSelectedFile(null);
    setSelectedFilePreview(null);

    try {
      const data = await dispatch(getThreadhistory(thread.id)).unwrap();
      setThreadMessages(data.thoughts || []);
    } catch (error) {
      toast.error("Failed to load thread history");
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleEdit = (thoughtId, content, thought) => {
    setEditingThoughtId(thoughtId);
    setNewMessage(content || "");

    if (thought?.has_file) {
      setSelectedFile(null);
      setIsExistingFile(true);

      setSelectedFilePreview({
        name: thought.file_name,
        size: thought.file_size
          ? (thought.file_size / 1024 / 1024).toFixed(2)
          : "",
        type: thought.file_type,
        url: thought.file_url,
      });
    } else {
      setSelectedFile(null);
      setSelectedFilePreview(null);
      setIsExistingFile(false);
    }
  };

  const handleDelete = async (threadId, thoughtId) => {
    if (!thoughtId) {
      toast.error("Thought ID is missing!");
      return;
    }

    try {
      setLoadingId(thoughtId);
      await dispatch(
        deleteThoughtApi({ thread_id: threadId, thought_id: thoughtId }),
      ).unwrap();

      toast.success("Thought deleted successfully");
      setThreadMessages((prev) => prev.filter((msg) => msg.id !== thoughtId));
      await dispatch(get_Threads_Api()).unwrap();
    } catch (err) {
      toast.error(err || "Failed to delete thought");
    } finally {
      setLoadingId(null);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Only images, PDFs, and Word documents are allowed");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    setSelectedFile(file);
    setSelectedFilePreview({
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(2),
      type: file.type,
    });

    e.target.value = null;
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    setSelectedFilePreview(null);
  };

  const handleSend = async () => {
    if (!newMessage.trim() && !selectedFile && !isExistingFile) {
      toast.warning("Please type a message or attach a file");
      return;
    }

    try {
      setSending(true);

      const formData = new FormData();
      formData.append("content", newMessage.trim());

      if (selectedFile) {
        formData.append("file", selectedFile);
      } else if (isExistingFile) {
        formData.append("keep_existing_file", "true");
      }

      if (editingThoughtId) {
        await dispatch(
          updateThoughtApi({
            thread_id: selectedThread.id,
            thought_id: editingThoughtId,
            data: formData,
          }),
        ).unwrap();
      } else {
        await dispatch(
          createThoughtApi({
            thread_id: selectedThread.id,
            data: formData,
          }),
        ).unwrap();
      }

      setNewMessage("");
      setSelectedFile(null);
      setSelectedFilePreview(null);
      setIsExistingFile(false);
      setEditingThoughtId(null);

      const data = await dispatch(getThreadhistory(selectedThread.id)).unwrap();
      setThreadMessages(data.thoughts || []);

      toast.success("Thought updated successfully");
    } catch (err) {
      toast.error("Failed to update thought");
    } finally {
      setSending(false);
    }
  };

  const getFileIcon = (fileType) => {
    if (fileType?.includes("image")) return "bi bi-file-earmark-image";
    if (fileType === "application/pdf")
      return "bi bi-file-earmark-pdf text-danger";
    if (fileType?.includes("word") || fileType?.includes("document"))
      return "bi bi-file-earmark-word text-primary";
    return "bi bi-file-earmark";
  };

  const getFileDisplay = (thought) => {
    if (!thought.has_file) return null;

    const fileType = thought.file_type;
    const fileName = thought.file_name || "Download file";

    if (fileType?.includes("image")) {
      return (
        <div className="mt-2">
          <img
            src={thought.file_url}
            alt={fileName}
            className="img-fluid rounded border"
            style={{ maxHeight: "200px", cursor: "pointer" }}
            onClick={() => window.open(thought.file_url, "_blank")}
          />
          <div className="text-muted small mt-1">
            <i className="bi bi-file-earmark-image me-1"></i>
            {fileName}
          </div>
        </div>
      );
    }

    return (
      <div className="mt-2">
        <a
          href={thought.file_url}
          target="_blank"
          rel="noopener noreferrer"
          className="d-flex align-items-center text-decoration-none"
        >
          <i className={`${getFileIcon(fileType)} me-2`}></i>
          <span className="fw-medium">{fileName}</span>
          {thought.file_size && (
            <span className="text-muted ms-2 small">
              ({thought.file_size} bytes)
            </span>
          )}
        </a>
      </div>
    );
  };

  return (
    <div className="container-fluid p-0" style={{ height: "100vh" }}>
      <div className="row g-0 h-100">
        <div className="d-block d-lg-none col-12 border-bottom">
          <Accordion>
            <Accordion.Item eventKey="0">
              <Accordion.Header style={{ paddingLeft: "25px" }}>
                Portfolio Threads ({threads.length})
              </Accordion.Header>
              <Accordion.Body style={{ maxHeight: "40vh", overflowY: "auto" }}>
                <Button
                  className="w-100 mb-3"
                  style={{ background: "#6c757d", border: 0 }}
                  onClick={handleCreatethread}
                >
                  + New Portfolio Thread
                </Button>

                <Form.Control
                  type="text"
                  placeholder="Search threads..."
                  className="mb-3"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />

                {loadingThreads ? (
                  <div className="text-center py-3">
                    <div className="spinner-border text-secondary" />
                    <p className="text-muted mt-2">Loading threads...</p>
                  </div>
                ) : (
                  filteredThreads.map((t) => (
                    <Card
                      key={t.id}
                      className={`p-3 mb-2 shadow-sm border ${
                        selectedThread?.id === t.id ? "border-primary" : ""
                      }`}
                      style={{ cursor: "pointer" }}
                      onClick={() => handlethreadhistory(t)}
                    >
                      <h6
                        className="fw-bold mb-1 text-truncate"
                        style={{ maxWidth: "100%" }}
                      >
                        {t.title?.length > 28
                          ? t.title.slice(0, 28) + "..."
                          : t.title}
                      </h6>

                      <div className="d-flex justify-content-between align-items-center mt-1">
                        <div
                          className="d-flex align-items-center gap-2"
                          style={{ fontSize: 14 }}
                        >
                          <span>{t.author_name}</span>
                          <span>|</span>
                          <span>
                            last thought at{" "}
                            {t.last_thought_at
                              ? formatRelativeDate(t.last_thought_at)
                              : "-"}
                          </span>
                        </div>

                        <button
                          className="btn btn-sm btn-outline-danger d-flex align-items-center justify-content-center"
                          style={{ width: 32, height: 30, padding: 0 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteThread(t.id);
                          }}
                        >
                          {deletingId === t.id ? (
                            <Spinner
                              animation="border"
                              size="sm"
                              style={{ width: "14px", height: "14px" }}
                            />
                          ) : (
                            <i
                              className="bi bi-trash"
                              style={{ fontSize: 14 }}
                            ></i>
                          )}
                        </button>
                      </div>
                    </Card>
                  ))
                )}
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
        </div>

        <div
          className="d-none d-lg-block col-lg-3 border-end hide-scrollbar"
          style={{ overflowY: "auto", height: "100%" }}
        >
          <div className="p-3">
            <h5 className="fw-bold">Portfolio Threads ({threads.length})</h5>

            <Button
              className="w-100 my-3"
              style={{ background: "#6c757d", border: 0 }}
              onClick={handleCreatethread}
            >
              + New Portfolio Thread
            </Button>

            <Form.Control
              type="text"
              placeholder="Search threads by title or author..."
              className="mb-3"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            {loadingThreads ? (
              <div className="text-center py-4">
                <div className="spinner-border text-secondary" />
                <p className="text-muted mt-2">Loading threads...</p>
              </div>
            ) : (
              filteredThreads.map((t) => (
                <Card
                  key={t.id}
                  className={`p-3 mb-2 shadow-sm thread_card border ${
                    selectedThread?.id === t.id ? "border-primary" : ""
                  }`}
                  style={{ cursor: "pointer" }}
                  onClick={() => handlethreadhistory(t)}
                >
                  <div className="d-flex flex-column flex-md-row justify-content-between align-items-start gap-2">
                    <div className="flex-grow-1 thread_title">
                      <h6
                        className="fw-bold mb-1 text-truncate"
                        style={{ maxWidth: "100%" }}
                      >
                        {t.title?.length > 28
                          ? t.title.slice(0, 28) + "..."
                          : t.title}
                      </h6>
                    </div>

                    <div className="thread_btn d-flex flex-row flex-md-column align-items-center text-end gap-2">
                      <button
                        className="btn btn-sm btn-outline-danger d-flex align-items-center justify-content-center"
                        style={{ width: 32, height: 30, padding: 0 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteThread(t.id);
                        }}
                      >
                        {deletingId === t.id ? (
                          <Spinner
                            animation="border"
                            size="sm"
                            style={{ width: "14px", height: "14px" }}
                          />
                        ) : (
                          <i
                            className="bi bi-trash"
                            style={{ fontSize: 14 }}
                          ></i>
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="d-flex justify-content-between align-content-center">
                    <span className="text-center" style={{ fontSize: 14 }}>
                      {t.author_name}
                    </span>
                    <span>|</span>
                    <span className="text-center " style={{ fontSize: 14 }}>
                      last thought at{" "}
                      {t.last_thought_at
                        ? formatRelativeDate(t.last_thought_at)
                        : "-"}
                    </span>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>

        <div
          className="col-lg-9 col-12 d-flex flex-column p-3"
          style={{
            overflow: "hidden",
            height: "100%",
          }}
        >
          {!selectedThread ? (
            <div
              className="d-flex justify-content-center align-items-center"
              style={{ height: "100%", width: "100%" }}
            >
              <h5 className="text-muted m-0">
                Select a thread to view details
              </h5>
            </div>
          ) : (
            <>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h3 className="fw-bold m-0">{selectedThread.title}</h3>
                <span className="text-muted">
                  {selectedThread.thought_count || 0} thoughts
                </span>
              </div>
              <hr />

              <div
                style={{
                  flexGrow: 1,
                  overflowY: "auto",
                }}
                className="hide-scrollbar mb-3"
              >
                {loadingHistory ? (
                  <div
                    className="d-flex justify-content-center align-items-center"
                    style={{ height: "100%", width: "100%" }}
                  >
                    <div className="text-center">
                      <Spinner animation="border" variant="secondary" />
                      <p className="text-muted mt-2">Loading Thoughts...</p>
                    </div>
                  </div>
                ) : threadMessages.length === 0 ? (
                  <div
                    className="d-flex justify-content-center align-items-center"
                    style={{ height: "100%", width: "100%" }}
                  >
                    <div className="text-center">
                      <i className="bi bi-chat-left-dots fs-1 text-muted mb-2"></i>
                      <p className="text-muted m-0">No thoughts yet</p>
                      <p className="text-muted small">
                        Be the first to start the conversation!
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="d-flex flex-column">
                    {threadMessages.map((msg) => (
                      <Card
                        key={msg.id}
                        className={`p-3 mb-3 shadow-sm ${
                          msg.deleted ? "border-danger bg-light" : ""
                        } ${
                          msg.author_role === "admin"
                            ? "admin-thread"
                            : "user-thread"
                        }`}
                      >
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <h6
                            className={`fw-bold mb-0 ${
                              msg.author_role === "admin" ? "text-primary" : ""
                            }`}
                          >
                            {msg.author_name || "Unknown User"}
                            {msg.author_role === "admin" && (
                              <span className="badge bg-primary ms-2">
                                Admin
                              </span>
                            )}
                          </h6>
                          <span className="text-muted small">
                            {new Date(msg.created_at).toLocaleString()}
                          </span>
                        </div>

                        {msg.deleted ? (
                          <p className="text-danger fst-italic mb-2">
                            This message was deleted.
                          </p>
                        ) : (
                          <>
                            <p
                              className="mb-2"
                              style={{ whiteSpace: "pre-line" }}
                            >
                              {msg.content}
                            </p>

                            {msg.has_file && getFileDisplay(msg)}

                            <div className="d-flex justify-content-end mt-3">
                              {(userdata.role === "admin" ||
                                Number(msg.author_uid) === userdata?.id) && (
                                <div className="d-flex gap-2">
                                  <button
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={() =>
                                      handleEdit(msg.id, msg.content, msg)
                                    }
                                  >
                                    <i className="bi bi-pencil-square"></i>
                                  </button>

                                  <button
                                    className="btn btn-sm btn-outline-danger d-flex align-items-center"
                                    onClick={() =>
                                      handleDelete(selectedThread.id, msg.id)
                                    }
                                    disabled={loadingId === msg.id}
                                  >
                                    {loadingId === msg.id ? (
                                      <>
                                        <Spinner animation="border" size="sm" />
                                      </>
                                    ) : (
                                      <>
                                        <i className="bi bi-trash"></i>
                                      </>
                                    )}
                                  </button>
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </Card>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              <div
                style={{
                  position: "sticky",
                  bottom: 0,
                  zIndex: 10,
                }}
              >
                {selectedFilePreview && (
                  <div className="mb-3 p-3 bg-light border rounded d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                      <i
                        className={`${getFileIcon(selectedFilePreview.type)} me-3`}
                        style={{ fontSize: "1.5rem" }}
                      ></i>
                      <div>
                        <div className="fw-semibold">
                          {selectedFilePreview.name}
                        </div>
                        <div className="text-muted small">
                          {selectedFilePreview.size} MB •{" "}
                          {isExistingFile
                            ? "Already attached"
                            : "Ready to send"}
                        </div>
                      </div>
                    </div>

                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => {
                        setSelectedFile(null);
                        setSelectedFilePreview(null);
                        setIsExistingFile(false);
                      }}
                    >
                      <i className="bi bi-x"></i>
                    </button>
                  </div>
                )}

                <div className="d-flex align-items-center">
                  <label
                    className="btn btn-outline-secondary me-2 d-flex align-items-center justify-content-center"
                    style={{ width: "42px", height: "42px" }}
                    title="Attach file"
                  >
                    <i className="bi bi-paperclip"></i>
                    <input
                      ref={fileInputRef}
                      type="file"
                      hidden
                      accept="image/*,.pdf,.doc,.docx"
                      onChange={handleFileSelect}
                    />
                  </label>
                  <Form.Control
                    type="text"
                    placeholder={
                      editingThoughtId
                        ? "Editing thought..."
                        : "Type your thought here..."
                    }
                    className="flex-grow-1 me-2"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                  />
                  <button
                    className="btn btn-secondary rounded-circle d-flex justify-content-center align-items-center"
                    onClick={handleSend}
                    disabled={sending || (!newMessage.trim() && !selectedFile)}
                    style={{ width: "42px", height: "42px" }}
                    title="Send"
                  >
                    {sending ? (
                      <div className="spinner-border spinner-border-sm text-light"></div>
                    ) : (
                      <i className="bi bi-send-fill"></i>
                    )}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          Are you sure you want to delete this thread? All thoughts in this
          thread will also be deleted.
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>

          <Button
            variant="danger"
            onClick={confirmDeleteThread}
            disabled={deletingId === threadToDelete}
          >
            {deletingId === threadToDelete ? (
              <Spinner size="sm" animation="border" />
            ) : (
              "Delete"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Create New Portfolio Thread</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <CreateThread onClose={() => setShowCreateModal(false)} />
        </Modal.Body>
      </Modal>
    </div>
  );
};
