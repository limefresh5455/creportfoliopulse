import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  DealTrackerList,
  DeleteDealTracker,
} from "../../../Networking/User/APIs/DealTracker/dealTrackerApi";
import { FaArrowLeft } from "react-icons/fa";

const DealList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteLoadingId, setDeleteLoadingId] = useState(null);

  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await dispatch(DealTrackerList()).unwrap();

      if (Array.isArray(result)) {
        setList(result);
      } else if (result && Array.isArray(result.data)) {
        setList(result.data);
      } else if (result && result.results) {
        setList(result.results);
      } else {
        setList([]);
      }
    } catch (err) {
      console.error("Error fetching deals:", err);
      setError(err.message || "Failed to load deals");
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateForm = () => {
    navigate("/deals/new");
  };

  const handleViewEdit = (dealId) => {
    navigate(`/deals/${dealId}`);
  };

  const handleDelete = async (dealId) => {
    setDeleteLoadingId(dealId);
    try {
      await dispatch(DeleteDealTracker({ dealId })).unwrap();
      await fetchDeals();
    } finally {
      setDeleteLoadingId(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const getLastUpdated = (deal) => {
    return deal.updated_at || deal.created_at || deal.last_updated;
  };

  const getCurrentStatus = (deal) => {
    if (deal.stages && Array.isArray(deal.stages)) {
      const completedStages = deal.stages.filter((stage) => stage.is_completed);
      if (completedStages.length > 0) {
        const lastCompleted = completedStages.sort(
          (a, b) => new Date(b.completed_at) - new Date(a.completed_at)
        )[0];
        return lastCompleted.stage_name;
      }
    }
    return "Not Started";
  };

  const filteredDeals = list.filter((deal) => {
    if (!searchTerm) return true;

    const term = searchTerm.toLowerCase();
    return (
      (deal.tenant_name && deal.tenant_name.toLowerCase().includes(term)) ||
      (deal.building_address_interest &&
        deal.building_address_interest.toLowerCase().includes(term)) ||
      (deal.current_building_address &&
        deal.current_building_address.toLowerCase().includes(term)) ||
      (deal.broker_of_record &&
        deal.broker_of_record.toLowerCase().includes(term)) ||
      (getCurrentStatus(deal) &&
        getCurrentStatus(deal).toLowerCase().includes(term))
    );
  });

  if (loading) {
    return (
      <div>
        <div className="header-bg sticky-header px-3 py-2">
          <div className="d-flex align-items-center justify-content-between gap-2 flex-grow-1 min-w-0">
            <div className="d-flex flex-column justify-content-center ms-4 text-truncate">
              <h5 className="mb-0 text-light text-truncate">
                View Deal Tracker
              </h5>
              <small className="text-light text-truncate">
                (Main List View)
              </small>
            </div>

            <button
              className="btn text-white btn-sm px-3"
              style={{ backgroundColor: "#217ae6", borderColor: "#217ae6" }}
              onClick={handleCreateForm}
            >
              Create Deal
            </button>
          </div>
        </div>

        <div
          className="container-fuild p-4 shadow-sm"
          style={{
            background: "#f5f7fa",
            borderRadius: "8px",
            height: "100vh",
          }}
        >
          <div
            className="d-flex justify-content-center align-items-center"
            style={{ minHeight: "400px" }}
          >
            <div className="text-center">
              <div className="spinner-border text-secondary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3">Loading deals...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="container-fuild p-4 shadow-sm"
        style={{ background: "#f5f7fa", borderRadius: "8px" }}
      >
        <div className="mb-4">
          <div className="text-start mb-3">
            <h4 className="fw-bold mb-0">View Deal Tracker</h4>
            <small className="text-muted d-block">(Main List View)</small>
          </div>

          <div className="text-start">
            <button
              className="btn text-white w-100 px-3 py-2"
              style={{ backgroundColor: "#217ae6", borderColor: "#217ae6" }}
              onClick={handleCreateForm}
            >
              Create New Deal
            </button>
          </div>
        </div>

        <div className="alert alert-danger" role="alert">
          <strong>Error:</strong> {error}
          <div className="mt-2">
            <button
              className="btn btn-outline-primary btn-sm"
              onClick={fetchDeals}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="header-bg sticky-header px-3 py-2">
        <div className="d-flex align-items-center justify-content-between gap-2 flex-grow-1 min-w-0">
          <div className="d-flex flex-column justify-content-center ms-4 text-truncate">
            <h5 className="mb-0 text-light text-truncate">View Deal Tracker</h5>
            <small className="text-light text-truncate">(Main List View)</small>
          </div>

          <button
            className="btn text-white btn-sm px-3"
            style={{ backgroundColor: "#217ae6", borderColor: "#217ae6" }}
            onClick={handleCreateForm}
          >
            Create Deal
          </button>
        </div>
      </div>
      <div className="d-flex justify-content-around align-items-center m-2">
        <div
          className="bg-dark text-white py-2 mx-1  d-flex align-items-center justify-content-center gap-2"
          onClick={() => navigate(-1)}
          style={{
            cursor: "pointer",
            width: "50px",
            height: "35px",
            borderRadius: 5,
          }}
        >
          <FaArrowLeft size={16} />
        </div>
        <div className="input-group ">
          <span className="input-group-text bg-white border-end-0">
            <i className="bi bi-search"></i>
          </span>
          <input
            type="text"
            className="form-control border-start-0"
            placeholder="Search deals by tenant name, address, broker, or status..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              className="btn btn-outline-secondary"
              type="button"
              onClick={() => setSearchTerm("")}
            >
              Clear
            </button>
          )}
        </div>
      </div>
      <div
        className="container-fuild p-4 shadow-sm"
        style={{ background: "#f5f7fa", borderRadius: "8px", height: "100vh" }}
      >
        {filteredDeals.length === 0 ? (
          <div className="text-center py-5">
            <div className="mb-3">
              <i
                className="bi bi-inbox"
                style={{ fontSize: "3rem", color: "#6c757d" }}
              ></i>
            </div>
            <h5>No deals found</h5>
            <p className="text-muted">
              {searchTerm
                ? "No deals match your search criteria."
                : "Get started by creating your first deal."}
            </p>
            {!searchTerm && (
              <button
                className="btn text-white px-4"
                style={{ backgroundColor: "#217ae6", borderColor: "#217ae6" }}
                onClick={handleCreateForm}
              >
                Create Your First Deal
              </button>
            )}
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table mt-3 align-middle w-800">
              <thead className="table-light">
                <tr>
                  <th style={{ fontWeight: "600", fontSize: "14px" }}>
                    Tenant Name
                  </th>
                  <th style={{ fontWeight: "600", fontSize: "14px" }}>
                    Building of Interest
                  </th>
                  <th style={{ fontWeight: "600", fontSize: "14px" }}>
                    Broker (Individual)
                  </th>
                  <th style={{ fontWeight: "600", fontSize: "14px" }}>
                    Status / Last Action
                  </th>
                  <th style={{ fontWeight: "600", fontSize: "14px" }}>
                    Last Updated
                  </th>
                  <th style={{ fontWeight: "600", fontSize: "14px" }}>
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredDeals.map((item) => (
                  <tr key={item.id || item._id} style={{ fontSize: "14px" }}>
                    <td>
                      <div className="fw-semibold">
                        {item.tenant_name || "N/A"}
                      </div>
                      {item.floor_suite_interest && (
                        <small className="text-muted">
                          {item.floor_suite_interest}
                        </small>
                      )}
                    </td>
                    <td>
                      <div>{item.building_address_interest || "N/A"}</div>
                      {item.current_building_address && (
                        <small className="text-muted">
                          Current: {item.current_building_address}
                        </small>
                      )}
                    </td>
                    <td>
                      <div>{item.broker_of_record || "N/A"}</div>
                      {item.landlord_lead_of_record && (
                        <small className="text-muted">
                          Landlord: {item.landlord_lead_of_record}
                        </small>
                      )}
                    </td>
                    <td>
                      <span
                        className="badge"
                        style={{
                          backgroundColor: "#e1ebfd",
                          color: "#217ae6",
                          padding: "6px 10px",
                          fontSize: "12px",
                          borderRadius: "6px",
                        }}
                      >
                        {getCurrentStatus(item)}
                      </span>
                      {item.current_lease_expiration && (
                        <div className="mt-1 small">
                          <i className="bi bi-calendar me-1"></i>
                          Expires: {formatDate(item.current_lease_expiration)}
                        </div>
                      )}
                    </td>
                    <td className="text-muted">
                      {formatDate(getLastUpdated(item))}
                    </td>
                    <td className="">
                      <div className="table-icons">

                        <button
                          className="btn btn-sm text-white me-2"
                          style={{
                            backgroundColor: "#217ae6",
                            borderColor: "#217ae6",
                            padding: "4px 12px",
                            fontSize: "13px",
                          }}
                          onClick={() => handleViewEdit(item.id || item._id)}
                        >
                          View/Edit
                        </button>
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          style={{
                            padding: "4px 12px",
                            fontSize: "13px",
                          }}
                          onClick={() => handleDelete(item.id)}
                          disabled={deleteLoadingId === item.id}
                        >
                          {deleteLoadingId === item.id ? (
                            <span className="spinner-border spinner-border-sm"></span>
                          ) : (
                            <i className="bi bi-trash"></i>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DealList;
