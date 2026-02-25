import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  get_Session_List_Specific,
  Delete_Chat_Session,
  get_Chat_History,
} from "../../../Networking/User/APIs/Chat/ChatApi";
import { toast } from "react-toastify";
import { Modal } from "react-bootstrap";

export const SessionList = ({ setShowSessionModal }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [sessionList, setSessionList] = useState([]);
  const [filteredSessions, setFilteredSessions] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [isDeleting, setIsDeleting] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showDeleteSessionModal, setShowDeleteSessionModal] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState(null);
  const [uniqueCategories, setUniqueCategories] = useState(["All"]);

  const fetchSessions = async () => {
    setIsLoadingSessions(true);
    try {
      const res = await dispatch(get_Session_List_Specific()).unwrap();
      setSessionList(res);

      const categories = [
        "All",
        ...new Set(res.map((s) => s.category).filter(Boolean)),
      ];
      setUniqueCategories(categories);

      applyFilters(res, selectedCategory, searchTerm);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingSessions(false);
    }
  };

  const applyFilters = (sessions, category, search) => {
    let filtered = [...sessions];

    if (category !== "All") {
      filtered = filtered.filter(
        (session) =>
          session.category &&
          session.category.toLowerCase() === category.toLowerCase(),
      );
    }

    if (search.trim() !== "") {
      filtered = filtered.filter(
        (session) =>
          session.title?.toLowerCase().includes(search.toLowerCase()) ||
          session.category?.toLowerCase().includes(search.toLowerCase()),
      );
    }

    setFilteredSessions(filtered);
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    applyFilters(sessionList, selectedCategory, searchTerm);
  }, [searchTerm, selectedCategory, sessionList]);

  const handleDeleteSession = async (id) => {
    try {
      setIsDeleting((prev) => ({ ...prev, [id]: true }));
      await dispatch(Delete_Chat_Session(id)).unwrap();

      const updatedList = sessionList.filter((s) => s.session_id !== id);
      setSessionList(updatedList);

      const categories = [
        "All",
        ...new Set(updatedList.map((s) => s.category).filter(Boolean)),
      ];
      setUniqueCategories(categories);

      const sessionsInCurrentCategory = updatedList.filter(
        (session) =>
          selectedCategory !== "All" &&
          session.category &&
          session.category.toLowerCase() === selectedCategory.toLowerCase(),
      );

      if (
        sessionsInCurrentCategory.length === 0 &&
        selectedCategory !== "All"
      ) {
        setSelectedCategory("All");
      }

      toast.success("Session deleted successfully!");
    } catch (error) {
      console.error("Failed to delete session:", error);
      toast.error("Failed to delete session");
    } finally {
      setIsDeleting((prev) => ({ ...prev, [id]: false }));
      setSessionToDelete(null);
    }
  };

  const handleSelect = async (session) => {
    setSelectedChatId(session.session_id);
    setSessionId(session.session_id);
    if (setShowSessionModal) setShowSessionModal(false);

    switch (session.category) {
      case "ThirdParty":
        navigate("/third-party-chat", {
          state: { sessionId: session.session_id, type: session.category },
        });
        break;
      case "Colleague":
        navigate("/employee-info-chat", {
          state: { sessionId: session.session_id, type: session.category },
        });
        break;
      case "ComparativeBuilding":
        navigate("/comparative-building-chat", {
          state: { sessionId: session.session_id, type: session.category },
        });
        break;
      case "TenantInformation":
        navigate("/tenant-information-chat", {
          state: { sessionId: session.session_id, type: session.category },
        });
        break;
      case "TenantMarket":
        navigate("/tenant-market", {
          state: { sessionId: session.session_id, type: session.category },
        });
        break;
      case "Comps":
        navigate("/comps-chat", {
          state: { sessionId: session.session_id, type: session.category },
        });
        break;
      case "Gemini":
        navigate("/gemini-chat", {
          state: { sessionId: session.session_id, type: session.category },
        });
        break;
      case "FireSafety":
        navigate("/user-fire-safety-building-mechanicals", {
          state: { sessionId: session.session_id, type: session.category },
        });
        break;
      case "building_info":
        navigate("/building-chat", {
          state: { sessionId: session.session_id, type: session.category },
        });
        break;
      case "report_generation":
        navigate("/ReportChat", {
          state: { sessionId: session.session_id, type: session.category },
        });
        break;
      case "portfolio":
        navigate("/portfolio-chat", {
          state: { sessionId: session.session_id, type: session.category },
        });
        break;
      case "Lease":
      case "LOI":
        navigate("/user-lease-loi-chat", {
          state: {
            sessionId: session.session_id,
            type: session.category,
            Building_id: session.building_id,
          },
        });
        break;
      default:
        console.warn("Unknown category:", session.category);
    }
  };

  const getCategoryStyle = (category) => {
    return "badge bg-dark text-white";
  };

  return (
    <>
      <div className="header-bg -bg d-flex justify-content-start px-3 align-items-center sticky-header">
        <h5 className="mb-0 text-light mx-4">Chat History</h5>
      </div>
      <div
        className="p-3 position-relative"
        style={{ maxWidth: "100%", minHeight: "100vh" }}
      >
        {isLoadingSessions && (
          <div
            className="d-flex justify-content-center align-items-center position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"
            style={{ zIndex: 10 }}
          >
            <div className="spinner-border text-light" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        )}

        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-3 gap-2">
          <select
            className="form-select form-select-sm w-100 w-md-auto"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{ maxWidth: 200 }}
          >
            {uniqueCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === "All" ? "All Categories" : cat}
              </option>
            ))}
          </select>

          <input
            type="text"
            className="form-control form-control-sm"
            placeholder="Search by title or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ maxWidth: 250 }}
          />
        </div>

        {!isLoadingSessions && (
          <>
            {filteredSessions && filteredSessions.length > 0 ? (
              <div
                className="list-group hide-scrollbar"
                style={{ overflowY: "auto" }}
              >
                {filteredSessions.map((session) => (
                  <div
                    key={session.session_id}
                    className={`d-flex align-items-center justify-content-between 
                    flex-wrap border rounded-3 mb-2 shadow-sm
                    ${
                      selectedChatId === session.session_id
                        ? "bg-dark text-white"
                        : "bg-light text-dark"
                    }`}
                    style={{
                      padding: "10px 12px",
                      transition: "all 0.2s ease-in-out",
                      cursor: "pointer",
                    }}
                    onClick={() => handleSelect(session)}
                  >
                    <div className="d-flex align-items-center flex-grow-1 col-12 col-sm-7 mb-2 mb-sm-0">
                      <span
                        className="text-truncate"
                        style={{
                          maxWidth: "100%",
                          fontWeight: "500",
                          fontSize: "0.95rem",
                        }}
                      >
                        {session.title ||
                          `Session ${session.session_id.slice(0, 8)}`}
                      </span>
                    </div>

                    <div className="col-12 col-sm-5 d-flex align-items-center justify-content-between gap-2 align-items-center justify-content-sm-end text-end">
                      <div className="text-start text-sm-center mb-0 mb-sm-0">
                        <span
                          className={getCategoryStyle(session.category)}
                          style={{
                            fontSize: "0.85rem",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {session.category}
                        </span>
                      </div>
                      <button
                        className={`btn btn-sm ${
                          selectedChatId === session.session_id
                            ? "btn-outline-light"
                            : "btn-outline-dark"
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSessionToDelete(session.session_id);
                          setShowDeleteSessionModal(true);
                        }}
                        disabled={isDeleting[session.session_id]}
                      >
                        {isDeleting[session.session_id] ? (
                          <span
                            className="spinner-border spinner-border-sm"
                            role="status"
                          ></span>
                        ) : (
                          <i className="bi bi-trash"></i>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div
                className="d-flex flex-column justify-content-center align-items-center text-center mt-5"
                style={{ opacity: 0.8 }}
              >
                <i
                  className="bi bi-inbox text-secondary mb-3"
                  style={{ fontSize: "3rem" }}
                ></i>
                <h6 className="text-muted">
                  {selectedCategory === "All"
                    ? "No sessions available"
                    : `No sessions found in "${selectedCategory}" category`}
                </h6>
                {selectedCategory !== "All" && (
                  <button
                    className="btn btn-sm btn-outline-primary mt-2"
                    onClick={() => setSelectedCategory("All")}
                  >
                    View All Categories
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
      <Modal
        show={showDeleteSessionModal}
        onHide={() => {
          setShowDeleteSessionModal(false);
          setSessionToDelete(null);
        }}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          Are you sure you want to delete this chat session?
        </Modal.Body>

        <Modal.Footer>
          <button
            className="btn btn-secondary"
            onClick={() => {
              setShowDeleteSessionModal(false);
              setSessionToDelete(null);
            }}
          >
            Cancel
          </button>
          <button
            className="btn btn-danger"
            onClick={() => {
              if (sessionToDelete) {
                handleDeleteSession(sessionToDelete);
              }
              setShowDeleteSessionModal(false);
            }}
            disabled={isDeleting[sessionToDelete]}
          >
            {isDeleting[sessionToDelete] ? (
              <span className="spinner-border spinner-border-sm text-light" />
            ) : (
              "Delete"
            )}
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
};
