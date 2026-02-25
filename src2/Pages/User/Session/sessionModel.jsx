import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { get_Session_List_Specific } from "../../../Networking/User/APIs/Chat/ChatApi";

export const SessionListModal = ({ show, onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [sessionList, setSessionList] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);

  const fetchSessions = async () => {
    setIsLoadingSessions(true);
    try {
      const res = await dispatch(get_Session_List_Specific()).unwrap();
      setSessionList(res);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingSessions(false);
    }
  };

  useEffect(() => {
    if (show) fetchSessions();
  }, [show]);

  const handleSelect = async (session) => {
    setSelectedChatId(session.session_id);
    onClose();

    switch (session.category) {
      case "Broker":
        navigate("/ThirdPartychat", {
          state: { sessionId: session.session_id },
        });
        break;
      case "Colleague":
        navigate("/ColleagueChat", {
          state: { sessionId: session.session_id },
        });
        break;
      case "Building":
        navigate("/BuildingChat", { state: { sessionId: session.session_id } });
        break;
      case "Market":
        navigate("/CompsChat", { state: { sessionId: session.session_id } });
        break;
      default:
        console.warn("Unknown category:", session.category);
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case "Broker":
        return "badge bg-warning text-dark";
      case "Colleague":
        return "badge bg-info text-dark";
      case "Building":
        return "badge bg-success";
      case "Market":
        return "badge bg-primary";
      default:
        return "badge bg-secondary";
    }
  };

  if (!show) return null;

  return (
    <>
      <div className="modal-backdrop fade show" onClick={onClose} />

      <div className="modal fade show d-block" role="dialog" aria-modal="true">
        <div className="modal-dialog modal-dialog-centered modal-sm">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Session List</h5>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
              ></button>
            </div>
            <div className="modal-body">
              {isLoadingSessions ? (
                <p className="text-center">Loading sessions...</p>
              ) : sessionList && sessionList.length > 0 ? (
                <div
                  className="list-group"
                  style={{ maxHeight: "300px", overflowY: "auto" }}
                >
                  {sessionList.map((session) => (
                    <button
                      key={session.session_id}
                      onClick={() => handleSelect(session)}
                      className={`list-group-item d-flex justify-content-between align-items-center ${
                        selectedChatId === session.session_id ? "active" : ""
                      }`}
                    >
                      <span>
                        {session.name ||
                          `Session ${session.session_id.slice(0, 8)}`}
                      </span>
                      <span className={getCategoryColor(session.category)}>
                        {session.category}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-muted text-center">No sessions available</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
