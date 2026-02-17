import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import "bootstrap/dist/css/bootstrap.min.css";
import { DealFormApi } from "../../../Networking/User/APIs/DealTracker/dealTrackerApi";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

const DealForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    tenant_name: "",
    building_address_interest: "",
    current_building_address: "",
    floor_suite_interest: "",
    floor_suite_current: "",
    broker_of_record: "",
    landlord_lead_of_record: "",
    current_lease_expiration: "",
    space_inquiry_date: "",
    space_inquiry_notes: "",
  });

  const baseStages = [
    { stage_name: "Tour", order_index: 1 },
    { stage_name: "Follow Up (Post Tour 1)", order_index: 2 },
    { stage_name: "Tour 2", order_index: 3 },
    { stage_name: "Follow Up (Post Tour 2)", order_index: 4 },
    { stage_name: "Status Update", order_index: 5 },
    { stage_name: "Letter of Intent (LOI) Received", order_index: 6 },
    {
      stage_name: "RFP Submitted or Counter Proposal Submitted",
      order_index: 7,
    },
    {
      stage_name: "Letter of Intent Counter Proposal Received",
      order_index: 8,
    },
    { stage_name: "Letter of Intent Counter Submitted", order_index: 9 },
    { stage_name: "Follow Up (Post LOI)", order_index: 12 },
    { stage_name: "Lease Draft Submitted", order_index: 14 },
  ];

  const initializeStage = (stage) => ({
    stage_name: stage.stage_name,
    order_index: stage.order_index,
    completed_at: null,
    is_completed: false,
    notes: "",
  });

  const [stages, setStages] = useState(baseStages.map(initializeStage));
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleStageChange = (index, key, value) => {
    const updated = [...stages];

    if (key === "is_completed") {
      updated[index][key] = value;
      if (value === true) {
        updated[index]["completed_at"] = new Date().toISOString();
      } else {
        updated[index]["completed_at"] = null;
      }
    } else {
      updated[index][key] = value;
    }

    setStages(updated);
  };

  const addLOIRound = () => {
    const currentStages = [...stages];
    const lastOrderIndex = Math.max(...currentStages.map((s) => s.order_index));

    const newRound = [
      {
        stage_name: "Additional LOI Received",
        order_index: lastOrderIndex + 1,
        completed_at: null,
        is_completed: false,
        notes: "",
      },
      {
        stage_name: "Additional LOI Counter Submitted",
        order_index: lastOrderIndex + 2,
        completed_at: null,
        is_completed: false,
        notes: "",
      },
    ];

    setStages([...currentStages, ...newRound]);
  };

  const handleSubmit = async () => {
    if (loading) return;

    const hasAnyFormValue =
      Object.values(form).some((value) =>
        typeof value === "string" ? value.trim() !== "" : !!value,
      ) ||
      stages.some(
        (stage) =>
          stage.is_completed || (stage.notes && stage.notes.trim() !== ""),
      );

    if (!hasAnyFormValue) {
      toast.error("Please enter at least one piece of information");
      return;
    }

    setSaving(true);

    const formPayload = {};
    Object.entries(form).forEach(([key, value]) => {
      if (typeof value === "string" && value.trim() !== "") {
        formPayload[key] = value.trim();
      } else if (value && typeof value !== "string") {
        formPayload[key] = value;
      }
    });

    const stagesPayload = stages.map((stage) => {
      const stageObj = {
        stage_name: stage.stage_name,
        order_index: stage.order_index,
      };
      if (stage.is_completed !== undefined) {
        stageObj.is_completed = stage.is_completed;
      }
      if (stage.completed_at) {
        stageObj.completed_at = stage.completed_at;
      }
      if (stage.notes && stage.notes.trim() !== "") {
        stageObj.notes = stage.notes.trim();
      }
      return stageObj;
    });

    const payload = {
      ...formPayload,
      stages: stagesPayload,
    };

    try {
      const resultAction = await dispatch(DealFormApi(payload));

      if (DealFormApi.fulfilled.match(resultAction)) {
        navigate("/deal-list/");
        setForm({
          tenant_name: "",
          building_address_interest: "",
          current_building_address: "",
          floor_suite_interest: "",
          floor_suite_current: "",
          broker_of_record: "",
          landlord_lead_of_record: "",
          current_lease_expiration: "",
          space_inquiry_date: "",
          space_inquiry_notes: "",
        });
        setStages(baseStages.map(initializeStage));
      } else if (DealFormApi.rejected.match(resultAction)) {
        toast.error(resultAction.error?.message || "Failed to save deal");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error("Error:", error);
    } finally {
      setSaving(false);
    }
  };
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  const handleDateChange = (key, value) => {
    if (value) {
      const date = new Date(value);
      setForm({ ...form, [key]: date.toISOString() });
    } else {
      setForm({ ...form, [key]: "" });
    }
  };

  return (
    <div>
      <div className="header-bg sticky-header px-3 py-2">
        <div className="d-flex justify-content-center align-items-center">
          <div className="d-flex align-items-center gap-3">
            <div className="d-flex flex-wrap align-items-center gap-2 text-center mx-4  justify-content-center py-2">
              <h4
                className="fw-bold m-0 portfolio-title"
                style={{ color: "#217ae6" }}
              >
                PORTFOLIO PULSE |
              </h4>

              <h4 className="fw-bold text-light m-0">
                New Lease Deal - Deal Tracker
              </h4>
            </div>
          </div>
        </div>
      </div>

      <div className="container-fluid">
        <div className="my-4 d-flex justify-content-md-start">
          <div
            className="bg-dark text-white py-2 d-flex align-items-center justify-content-center gap-2"
            onClick={() => navigate(-1)}
            style={{
              cursor: "pointer",
              width: "110px",
              borderRadius: 10,
            }}
          >
            <FaArrowLeft size={16} />
            <span>Back</span>
          </div>
        </div>
        {loading && (
          <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-dark bg-opacity-25 z-3">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        )}

        <div className="p-4 shadow-sm bg-white rounded border position-relative">
          {saving && (
            <div className="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-white bg-opacity-75 z-2">
              <div className="text-center">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Saving...</span>
                </div>
                <p className="mt-2">Saving deal...</p>
              </div>
            </div>
          )}

          <h5 className="fw-bold pb-2 border-bottom mb-3">
            Deal Identification
          </h5>

          <div className="row g-3">
            {[
              ["Tenant Name", "tenant_name", "text", false],
              [
                "Building Address of Interest",
                "building_address_interest",
                "text",
                false,
              ],
              [
                "Current Building Address",
                "current_building_address",
                "text",
                false,
              ],
              ["Floor/Suite (Interest)", "floor_suite_interest", "text", false],
              ["Floor/Suite (Current)", "floor_suite_current", "text", false],
              ["Broker of Record", "broker_of_record", "text", false],
              [
                "Landlord Lead of Record",
                "landlord_lead_of_record",
                "text",
                false,
              ],
              [
                "Current Lease Expiration Date",
                "current_lease_expiration",
                "date",
                false,
              ],
            ].map(([label, key, type, required], idx) => (
              <div className="col-md-6 col-12" key={idx}>
                <label className="fw-semibold">
                  {label} {required && <span className="text-danger">*</span>}
                </label>
                <input
                  type={type}
                  className="form-control"
                  value={
                    type === "date" ? formatDateForInput(form[key]) : form[key]
                  }
                  onChange={(e) => {
                    if (type === "date") {
                      handleDateChange(key, e.target.value);
                    } else {
                      setForm({ ...form, [key]: e.target.value });
                    }
                  }}
                  required={false}
                  disabled={saving}
                />
              </div>
            ))}
          </div>

          <div className="row g-3 my-2">
            <div className="col-md-6 col-12">
              <label className="fw-semibold">Space Inquiry Date</label>
              <input
                type="date"
                className="form-control"
                value={formatDateForInput(form.space_inquiry_date)}
                onChange={(e) =>
                  handleDateChange("space_inquiry_date", e.target.value)
                }
                disabled={saving}
              />
            </div>

            <div className="col-md-6 col-12">
              <label className="fw-semibold">Space Inquiry Notes</label>
              <input
                className="form-control"
                placeholder="Enter inquiry notes..."
                value={form.space_inquiry_notes}
                onChange={(e) =>
                  setForm({ ...form, space_inquiry_notes: e.target.value })
                }
                disabled={saving}
              />
            </div>
          </div>

          <h5 className="fw-bold mt-4 pb-2 border-bottom">
            Deal Process Tracking
          </h5>

          {stages.map((item, i) => (
            <div key={i} className="p-1 px-2 mb-1 bg-light">
              <div className="row g-3 align-items-center">
                <div className="col-md-1 col-lg-1 col-2 text-start text-md-center pt-2 pt-md-0">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    checked={item.is_completed}
                    onChange={(e) =>
                      handleStageChange(i, "is_completed", e.target.checked)
                    }
                    disabled={saving}
                  />
                </div>
                <div className="col-md-3 col-lg-3 col-12">
                  <strong>{item.stage_name}</strong>
                </div>
                <div className="col-md-2 col-lg-2 col-12">
                  <input
                    type="date"
                    className="form-control"
                    value={
                      item.completed_at
                        ? item.completed_at.substring(0, 10)
                        : ""
                    }
                    onChange={(e) =>
                      handleStageChange(
                        i,
                        "completed_at",
                        e.target.value
                          ? new Date(e.target.value).toISOString()
                          : null,
                      )
                    }
                    disabled={saving || !item.is_completed}
                  />
                </div>
                <div className="col-md-4 col-lg-5 col-12">
                  <input
                    className="form-control"
                    placeholder="Notes..."
                    value={item.notes}
                    onChange={(e) =>
                      handleStageChange(i, "notes", e.target.value)
                    }
                    rows="2"
                    disabled={saving}
                  />
                </div>
                <div className="col-md-2 col-lg-1 text-primary text-start text-md-end pb-2 pb-md-0">
                  Notes
                </div>
              </div>
            </div>
          ))}

          <button
            className="btn btn-outline-primary mt-3"
            onClick={addLOIRound}
            disabled={saving}
          >
            + Add Another LOI Round
          </button>

          <div className="d-flex flex-wrap justify-content-center gap-3 mt-4 pt-3">
            <button
              className="btn text-light px-4"
              style={{
                backgroundColor: "#217ae6",
                borderRadius: 5,
                borderColor: "#217ae6",
              }}
              onClick={handleSubmit}
              disabled={saving || loading}
            >
              {saving ? "Saving..." : "Save Deal"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DealForm;
