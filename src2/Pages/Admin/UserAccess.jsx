import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  ListRequestSubmit,
  Request_Approved_Deny_Submit,
} from "../../Networking/Admin/APIs/PermissionApi";
import { useDispatch } from "react-redux";
import RAGLoader from "../../Component/Loader";

export const UserAccess = () => {
  const dispatch = useDispatch();
  const [groupedRequests, setGroupedRequests] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedRequests, setSelectedRequests] = useState({});
  const [actionLoading, setActionLoading] = useState(false); 

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const fetchPendingUsers = async () => {
    try {
      const res = await dispatch(ListRequestSubmit()).unwrap();
      const grouped = {};

      res.forEach((user) => {
        user.requested_buildings.forEach((building) => {
          const bId = building.building_id;
          if (!grouped[bId]) {
            grouped[bId] = {
              building_name: building.building_name,
              building_id: bId,
              leases: [],
            };
          }
          grouped[bId].leases.push({
            user_id: user.user_id,
            user_name: user.user_name,
            email: user.email,
            lease_id: building.lease_id,
            lease_number: building.lease_number,
            request_id: building.request_id,
            status: building.status,
          });
        });
      });

      setGroupedRequests(grouped);
    } catch (error) {
      toast.error("Failed to load pending users.");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = (requestId) => {
    setSelectedRequests((prev) => ({
      ...prev,
      [requestId]: !prev[requestId],
    }));
  };

  const handleAction = async (action, requestId) => {
    if (!requestId) return;
    try {
      setActionLoading(true);
      const data = {
        request_id: requestId,
        action,
      };
      await dispatch(Request_Approved_Deny_Submit(data)).unwrap();
      await fetchPendingUsers();
      setSelectedRequests({});
    } catch (error) {
      toast.error(`Failed to ${action} request.`);
    } finally {
      setActionLoading(false); 
    }
  };

  if (loading)
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "100vh" }}
      >
        <RAGLoader />
      </div>
    );

  return (
    <div className="container p-4" style={{ position: "relative" }}>
      {actionLoading && (
        <div className="upload-overlay">
          <div className="text-center">
            <div className="spinner-border text-primary" role="status"></div>
            <div className="upload-text">Processing request...</div>
          </div>
        </div>
      )}

      {Object.keys(groupedRequests).length === 0 ? (
        <div className="text-center">
          <h5 className="text-muted">No pending requests</h5>
        </div>
      ) : (
        <div className="row g-3">
          {Object.values(groupedRequests).map((building) => (
            <div
              key={building.building_id}
              className="col-12 col-sm-12 col-md-6 col-lg-6 col-xl-4"
            >
              <div className="card shadow-sm h-100 d-flex flex-column">
                <div className="card-header text-dark">
                  <strong>{building.building_name}</strong> —{" "}
                  <small>ID: {building.building_id}</small>
                </div>
                <div
                  className="card-body overflow-auto"
                  style={{ maxHeight: "300px" }}
                >
                  {building.leases.map((lease) => (
                    <div
                      key={lease.request_id}
                      className="border rounded p-3 mb-2 bg-light"
                    >
                      <div className="form-check d-flex justify-content-between align-items-center flex-wrap">
                        <div className="me-2">
                          <input
                            className="form-check-input me-2"
                            type="checkbox"
                            id={`chk-${lease.request_id}`}
                            checked={selectedRequests[lease.request_id] || false}
                            onChange={() => handleCheckboxChange(lease.request_id)}
                            disabled={actionLoading}
                          />
                          <label
                            className="form-check-label"
                            htmlFor={`chk-${lease.request_id}`}
                            style={{ wordBreak: "break-word" }} 
                          >
                            <strong>{lease.user_name}</strong>
                            <br />({lease.email})
                          </label>
                        </div>
                        {lease.status && (
                          <span
                            className={`badge bg-${
                              lease.status === "approved" ? "success" : "secondary"
                            } mt-2 mt-sm-0`}
                          >
                            {lease.status}
                          </span>
                        )}
                      </div>

                      <div className="mt-2 d-flex justify-content-end gap-2 flex-wrap">
                        <button
                          className="btn btn-sm btn-success"
                          onClick={() => handleAction("approve", lease.request_id)}
                          disabled={!selectedRequests[lease.request_id] || actionLoading}
                        >
                          Approve
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleAction("deny", lease.request_id)}
                          disabled={!selectedRequests[lease.request_id] || actionLoading}
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
