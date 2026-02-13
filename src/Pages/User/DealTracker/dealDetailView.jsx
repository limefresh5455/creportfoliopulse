import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import {
  getDealTracker,
  updateDealTracker,
} from "../../../Networking/User/APIs/DealTracker/dealTrackerApi";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const DealDetailView = () => {
  const { dealId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [deal, setDeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    tenant_name: "",
    building_address_interest: "",
    current_building_address: "",
    floor_suite_interest: "",
    floor_suite_current: "",
    broker_of_record: "",
    landlord_lead_of_record: "",
    current_lease_expiration: "",
  });

  const [stages, setStages] = useState([]);

  useEffect(() => {
    if (dealId) {
      fetchDealDetails();
    }
  }, [dealId, dispatch]);

  const fetchDealDetails = async () => {
    try {
      setLoading(true);
      const result = await dispatch(getDealTracker({ dealId })).unwrap();
      setDeal(result);

      setForm({
        tenant_name: result.tenant_name || "",
        building_address_interest: result.building_address_interest || "",
        current_building_address: result.current_building_address || "",
        floor_suite_interest: result.floor_suite_interest || "",
        floor_suite_current: result.floor_suite_current || "",
        broker_of_record: result.broker_of_record || "",
        landlord_lead_of_record: result.landlord_lead_of_record || "",
        current_lease_expiration: result.current_lease_expiration
          ? result.current_lease_expiration.substring(0, 10)
          : "",
      });

      if (result.stages && Array.isArray(result.stages)) {
        setStages(
          result.stages.map((stage) => ({
            ...stage,
            completed_at: stage.completed_at
              ? stage.completed_at.substring(0, 10)
              : "",
          })),
        );
      }
    } catch (err) {
      console.error("Error fetching deal details:", err);
      toast.error("Failed to load deal details");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleStageChange = (index, field, value) => {
    const updatedStages = [...stages];

    if (field === "is_completed") {
      updatedStages[index][field] = value;
      if (value === true) {
        updatedStages[index]["completed_at"] = new Date()
          .toISOString()
          .substring(0, 10);
      } else {
        updatedStages[index]["completed_at"] = "";
      }
    } else {
      updatedStages[index][field] = value;
    }

    setStages(updatedStages);
  };

  const handleEditToggle = () => {
    if (isEditMode) {
      fetchDealDetails();
    }
    setIsEditMode(!isEditMode);
  };

  const handleSave = async () => {
    if (!dealId) return;

    if (!form.tenant_name.trim()) {
      toast.error("Tenant Name is required");
      return;
    }

    if (!form.building_address_interest.trim()) {
      toast.error("Building Address of Interest is required");
      return;
    }

    setSaving(true);

    const payload = {
      ...form,
      stages: stages.map((stage) => {
        const stageData = {
          id: stage.id,
          stage_name: stage.stage_name,
          order_index: stage.order_index,
          is_completed: stage.is_completed,
          notes: stage.notes || "",
        };

        if (stage.is_completed && stage.completed_at) {
          const date = new Date(stage.completed_at);
          stageData.completed_at = date.toISOString();
        }

        return stageData;
      }),
    };

    try {
      const result = await dispatch(
        updateDealTracker({
          dealId,
          data: payload,
        }),
      ).unwrap();

      setDeal(result);
      setIsEditMode(false);

      setForm({
        tenant_name: result.tenant_name || "",
        building_address_interest: result.building_address_interest || "",
        current_building_address: result.current_building_address || "",
        floor_suite_interest: result.floor_suite_interest || "",
        floor_suite_current: result.floor_suite_current || "",
        broker_of_record: result.broker_of_record || "",
        landlord_lead_of_record: result.landlord_lead_of_record || "",
        current_lease_expiration: result.current_lease_expiration
          ? result.current_lease_expiration.substring(0, 10)
          : "",
      });
    } catch (error) {
      console.error("Error updating deal:", error);
      toast.error(error?.message || "Failed to update deal");
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="container-fluid p-0">
        <div className="header-bg sticky-header px-3 py-2">
          <div className="d-flex justify-content-between align-items-center flex-column flex-md-row mx-4">
            <h5 className="text-light text-center mb-2 mb-md-0">
              {isEditMode ? "Edit Lease Deal" : "View Lease Deal"} – Deal
              Tracker
            </h5>

            <div className="d-flex gap-2 mt-2 mt-md-0">
              {isEditMode ? (
                <>
                  <button
                    className="btn btn-outline-secondary"
                    onClick={handleEditToggle}
                    disabled={saving}
                  >
                    Cancel
                  </button>

                  <button
                    className="btn text-light"
                    style={{
                      backgroundColor: "#217ae6",
                      borderColor: "#217ae6",
                    }}
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                        />
                        Saving...
                      </>
                    ) : (
                      "Save"
                    )}
                  </button>
                </>
              ) : (
                <button
                  className="btn text-light"
                  style={{
                    backgroundColor: "#217ae6",
                    borderColor: "#217ae6",
                  }}
                  onClick={handleEditToggle}
                >
                  Edit Deal
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="d-flex flex-column justify-content-center align-items-center vh-100">
          <div className="spinner-border text-secondary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading deal details...</p>
        </div>
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger">Deal not found</div>
      </div>
    );
  }

  return (
    <div>
      <div className="header-bg sticky-header px-3 py-2">
        <div
          className="d-flex justify-content-between align-items-center flex-column flex-md-row
         mx-4"
        >
          <div className="d-flex align-items-center gap-3">
            <h5 className="text-light text-center mb-2 mb-md-0">
              {isEditMode ? "Edit Lease Deal" : "View Lease Deal"} – Deal
              Tracker
            </h5>
          </div>
          <div className="d-flex gap-2">
            {isEditMode ? (
              <>
                <button
                  className="btn btn-outline-secondary"
                  onClick={handleEditToggle}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  className="text-light"
                  style={{
                    borderColor: "#217ae6",
                    backgroundColor: "#217ae6",
                    borderRadius: 5,
                  }}
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                      ></span>
                      Saving...
                    </>
                  ) : (
                    "Save"
                  )}
                </button>
              </>
            ) : (
              <>
                <button
                  className="text-light border-0 p-2"
                  style={{
                    backgroundColor: "#217ae6",
                    borderColor: "#217ae6",
                    borderRadius: 5,
                  }}
                  onClick={handleEditToggle}
                >
                  Edit Deal
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="container-fuild p-3">
        <div className="card p-4 mb-4">
          <h5 className="fw-bold border-bottom pb-2 mb-4">
            Deal Identification
          </h5>

          <div className="row g-3">
            {[
              {
                label: "Tenant Name",
                name: "tenant_name",
                type: "text",
                required: true,
              },
              {
                label: "Building of Interest",
                name: "building_address_interest",
                type: "text",
                required: true,
              },
              {
                label: "Current Building Address",
                name: "current_building_address",
                type: "text",
              },
              {
                label: "Floor/Suite (Interest)",
                name: "floor_suite_interest",
                type: "text",
              },
              {
                label: "Floor/Suite (Current)",
                name: "floor_suite_current",
                type: "text",
              },
              {
                label: "Broker of Record",
                name: "broker_of_record",
                type: "text",
              },
              {
                label: "Landlord Lead of Record",
                name: "landlord_lead_of_record",
                type: "text",
              },
              {
                label: "Current Lease Expiration Date",
                name: "current_lease_expiration",
                type: "date",
              },
            ].map((field) => (
              <div className="col-md-6 col-12" key={field.name}>
                <label className="fw-semibold">
                  {field.label}
                  {field.required && (
                    <span className="text-danger ms-1">*</span>
                  )}
                </label>
                {isEditMode ? (
                  <input
                    type={field.type}
                    className="form-control"
                    name={field.name}
                    value={form[field.name] || ""}
                    onChange={handleInputChange}
                    required={field.required}
                    disabled={saving}
                  />
                ) : (
                  <div className="form-control-plaintext">
                    {form[field.name] || (
                      <span className="text-muted">Not specified</span>
                    )}
                  </div>
                )}
              </div>
            ))}

            <div className="col-md-6 col-12">
              <label className="fw-semibold">Last Updated</label>
              <div className="form-control-plaintext">
                {formatDate(deal.last_updated) || "N/A"}
              </div>
            </div>
            <div className="col-md-6 col-12">
              <label className="fw-semibold">Last Edited By</label>
              <div className="form-control-plaintext">
                {deal.last_edited_by || "N/A"}
              </div>
            </div>
            {deal.created_at && (
              <div className="col-md-6 col-12">
                <label className="fw-semibold">Created</label>
                <div className="form-control-plaintext">
                  {formatDate(deal.created_at)}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="card p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h5 className="fw-bold mb-0">Deal Process Tracking</h5>
            {isEditMode && (
              <div className="text-muted">
                {stages.filter((s) => s.is_completed).length} of {stages.length}{" "}
                stages completed
              </div>
            )}
          </div>

          {stages.length === 0 ? (
            <div className="text-center py-4 text-muted">
              No stages found for this deal
            </div>
          ) : (
            <div className="stages-list">
              {stages.map((stage, index) => (
                <div
                  key={stage.id || index}
                  className={`stage-item border rounded p-3 mb-3 ${
                    stage.is_completed ? "bg-light" : ""
                  }`}
                >
                  <div className="row align-items-center">
                    <div className="col-md-1 col-2 text-center">
                      {isEditMode ? (
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={stage.is_completed || false}
                          onChange={(e) =>
                            handleStageChange(
                              index,
                              "is_completed",
                              e.target.checked,
                            )
                          }
                          disabled={saving}
                        />
                      ) : (
                        <span
                          className={
                            stage.is_completed
                              ? "text-success"
                              : "text-secondary"
                          }
                        >
                          {stage.is_completed ? "✓" : "○"}
                        </span>
                      )}
                    </div>

                    <div className="col-md-3 col-10">
                      <strong>{stage.stage_name}</strong>
                    </div>

                    <div className="col-md-2 col-12 mt-2 mt-md-0">
                      {isEditMode ? (
                        <input
                          type="date"
                          className="form-control"
                          value={stage.completed_at || ""}
                          onChange={(e) =>
                            handleStageChange(
                              index,
                              "completed_at",
                              e.target.value,
                            )
                          }
                          disabled={saving || !stage.is_completed}
                        />
                      ) : (
                        <div className="form-control-plaintext">
                          {stage.completed_at
                            ? formatDate(stage.completed_at)
                            : "Not completed"}
                        </div>
                      )}
                    </div>

                    <div className="col-md-6 col-12 mt-2 mt-md-0">
                      {isEditMode ? (
                        <textarea
                          className="form-control"
                          rows="2"
                          placeholder="Notes..."
                          value={stage.notes || ""}
                          onChange={(e) =>
                            handleStageChange(index, "notes", e.target.value)
                          }
                          disabled={saving}
                        />
                      ) : (
                        <div className="form-control-plaintext">
                          {stage.notes || (
                            <span className="text-muted">No notes</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DealDetailView;
