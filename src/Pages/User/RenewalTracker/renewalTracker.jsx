import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { RenewalTrackerSubmit } from "../../../Networking/Admin/APIs/RenewalTrackeApi";
import { BackButton } from "../../../Component/backButton";

export const RenewalTracker = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const role = sessionStorage.getItem("role");
  const Role = role;
  console.log(Role, "Role");

  const [form, setForm] = useState({
    tenant_name: "",
    building_address: "",
    floor_suite: "",
    lease_commencement_date: "",
    lease_expiration_date: "",
    tenant_headcount: "",
    notice_of_renewal_date: "",
    renewal_clause: false,
    tenant_current_rent: "",
    most_recent_building_comp: "",
    tenant_contact_info: "",
    notes: "",
    q1: {
      check_in: false,
      headcount_confirmation: false,
      building_update_note_sent: false,
      holiday_gift: false,
    },
    q2: {
      check_in: false,
      headcount_confirmation: false,
      building_update_note_sent: false,
      holiday_gift: false,
    },
    q3: {
      check_in: false,
      headcount_confirmation: false,
      building_update_note_sent: false,
      holiday_gift: false,
    },
    q4: {
      check_in: false,
      headcount_confirmation: false,
      building_update_note_sent: false,
      holiday_gift: false,
    },
  });

  const [loading, setLoading] = useState(false);
  const quarters = ["q1", "q2", "q3", "q4"];

  const resetForm = () => {
    setForm({
      tenant_name: "",
      building_address: "",
      floor_suite: "",
      lease_commencement_date: "",
      lease_expiration_date: "",
      tenant_headcount: "",
      notice_of_renewal_date: "",
      renewal_clause: false,
      tenant_current_rent: "",
      most_recent_building_comp: "",
      tenant_contact_info: "",
      notes: "",
      q1: {
        check_in: false,
        headcount_confirmation: false,
        building_update_note_sent: false,
        holiday_gift: false,
      },
      q2: {
        check_in: false,
        headcount_confirmation: false,
        building_update_note_sent: false,
        holiday_gift: false,
      },
      q3: {
        check_in: false,
        headcount_confirmation: false,
        building_update_note_sent: false,
        holiday_gift: false,
      },
      q4: {
        check_in: false,
        headcount_confirmation: false,
        building_update_note_sent: false,
        holiday_gift: false,
      },
    });
  };

  const handleQuarterToggle = (quarter, field) => {
    setForm((prev) => ({
      ...prev,
      [quarter]: {
        ...prev[quarter],
        [field]: !prev[quarter][field],
      },
    }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async () => {
    if (!form.tenant_name.trim()) {
      toast.error("Tenant name is required");
      return;
    }

    if (!form.building_address.trim()) {
      toast.error("Building address is required");
      return;
    }

    if (!form.floor_suite.trim()) {
      toast.error("Floor/Suite is required");
      return;
    }

    setLoading(true);

    const payload = {
      tenant_name: form.tenant_name,
      building_address: form.building_address,
      floor_suite: form.floor_suite,
      lease_commencement_date: form.lease_commencement_date || null,
      lease_expiration_date: form.lease_expiration_date || null,
      tenant_headcount: form.tenant_headcount
        ? parseInt(form.tenant_headcount)
        : 0,
      notice_of_renewal_date: form.notice_of_renewal_date || null,
      renewal_clause: form.renewal_clause,
      tenant_current_rent: form.tenant_current_rent,
      most_recent_building_comp: form.most_recent_building_comp,
      tenant_contact_info: form.tenant_contact_info,
       notes: form.notes,
      q1: form.q1,
      q2: form.q2,
      q3: form.q3,
      q4: form.q4,
    };

    try {
      await dispatch(RenewalTrackerSubmit(payload)).unwrap();
      toast.success("Renewal tracker created successfully!");
      resetForm();

      {
        Role === "admin"
          ? navigate("/admin-renewal-tracker-list")
          : navigate("/user-renewal-tracker-list");
      }
    } catch (error) {
      console.error("Error creating renewal tracker:", error);
      toast.error(error?.message || "Failed to create renewal tracker");
    } finally {
      setLoading(false);
    }
  };

  const renderQuarterSection = (quarter, quarterName) => (
    <div key={quarter} className="mb-4">
      <h5 className="mb-3 fw-bold">{quarterName}</h5>
      <div className="card p-3" style={{ backgroundColor: "#e9eef6" }}>
        <div className="row">
          <div className="col-md-6 mb-2">
            <div className="form-check form-switch">
              <input
                type="checkbox"
                className="form-check-input"
                checked={form[quarter]?.check_in || false}
                onChange={() => handleQuarterToggle(quarter, "check_in")}
                id={`${quarter}-checkin`}
              />
              <label
                className="form-check-label"
                htmlFor={`${quarter}-checkin`}
              >
                Check In
              </label>
            </div>
          </div>

          <div className="col-md-6 mb-2">
            <div className="form-check form-switch">
              <input
                type="checkbox"
                className="form-check-input"
                checked={form[quarter]?.headcount_confirmation || false}
                onChange={() =>
                  handleQuarterToggle(quarter, "headcount_confirmation")
                }
                id={`${quarter}-headcount`}
              />
              <label
                className="form-check-label"
                htmlFor={`${quarter}-headcount`}
              >
                Headcount Confirmation
              </label>
            </div>
          </div>

          <div className="col-md-6 mb-2">
            <div className="form-check form-switch">
              <input
                type="checkbox"
                className="form-check-input"
                checked={form[quarter]?.building_update_note_sent || false}
                onChange={() =>
                  handleQuarterToggle(quarter, "building_update_note_sent")
                }
                id={`${quarter}-note-sent`}
              />
              <label
                className="form-check-label"
                htmlFor={`${quarter}-note-sent`}
              >
                Building Update Note Sent
              </label>
            </div>
          </div>

          <div className="col-md-6 mb-2">
            <div className="form-check form-switch">
              <input
                type="checkbox"
                className="form-check-input"
                checked={form[quarter]?.holiday_gift || false}
                onChange={() => handleQuarterToggle(quarter, "holiday_gift")}
                id={`${quarter}-holiday-gift`}
              />
              <label
                className="form-check-label"
                htmlFor={`${quarter}-holiday-gift`}
              >
                Holiday Gift
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container-fuild p-3">
      <div className="d-flex align-items-center my-4">
        <BackButton />
        <h2 className="fw-bold ms-2">New Renewal Tracker</h2>
      </div>
      <div className="card p-4 mb-4">
        <h4 className="mb-5 fw-bold">Basic Information</h4>
        <div className="row g-3">
          {[
            {
              label: "Tenant Name",
              name: "tenant_name",
              type: "text",
              required: true,
            },
            {
              label: "Building Address",
              name: "building_address",
              type: "text",
              required: true,
            },
            {
              label: "Floor/Suite",
              name: "floor_suite",
              type: "text",
              required: true,
            },
            {
              label: "Lease Commencement Date",
              name: "lease_commencement_date",
              type: "date",
            },
            {
              label: "Lease Expiration Date",
              name: "lease_expiration_date",
              type: "date",
            },
            {
              label: "Notice of Renewal Date",
              name: "notice_of_renewal_date",
              type: "date",
            },
            {
              label: "Tenant Headcount",
              name: "tenant_headcount",
              type: "number",
            },
          ].map((field, idx) => (
            <div key={idx} className="col-md-6">
              <label className="form-label fw-bold">
                {field.label}{" "}
                {field.required && <span className="text-danger">*</span>}
              </label>
              <input
                type={field.type}
                name={field.name}
                value={form[field.name]}
                onChange={handleChange}
                className="form-control border-primary"
                required={field.required}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="card p-4 mb-4">
        <h4 className="mb-5 fw-bold">Renewal & Financial Information</h4>
        <div className="row g-3">
          <div className="col-md-6">
            <div className="form-check">
              <input
                type="checkbox"
                className="form-check-input"
                name="renewal_clause"
                checked={form.renewal_clause}
                onChange={handleChange}
                id="renewal-clause"
              />
              <label
                className="form-check-label fw-bold"
                htmlFor="renewal-clause"
              >
                Renewal Clause
              </label>
            </div>
          </div>

          <div className="col-md-6">
            <label className="form-label fw-bold">Tenant Current Rent</label>
            <input
              type="text"
              name="tenant_current_rent"
              value={form.tenant_current_rent}
              onChange={handleChange}
              className="form-control border-primary"
              placeholder="e.g., $5,000/month"
            />
          </div>

          <div className="col-md-6">
            <label className="form-label fw-bold">
              Most Recent Building Comp
            </label>
            <input
              type="text"
              name="most_recent_building_comp"
              value={form.most_recent_building_comp}
              onChange={handleChange}
              className="form-control border-primary"
              placeholder="Recent building comparable information"
            />
          </div>

          <div className="col-md-12">
            <label className="form-label fw-bold">
              Tenant Contact Information
            </label>
            <textarea
              name="tenant_contact_info"
              value={form.tenant_contact_info}
              onChange={handleChange}
              className="form-control border-primary"
              rows="3"
              placeholder="Name, Phone, Email, etc."
            />
          </div>
        </div>
      </div>
      <div className="card p-4 mb-4">
        <h4 className="mb-4 fw-bold">Notes</h4>
        <div className="row">
          <div className="col-md-12">
            
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              className="form-control border-primary"
              rows="4"
              placeholder="Enter any additional notes related to this tenant or renewal..."
            />
          </div>
        </div>
      </div>

      <div className="card p-4 mb-5">
        <h4 className="mb-5 fw-bold">Quarterly Status Updates</h4>
        {quarters.map((quarter, index) =>
          renderQuarterSection(quarter, `Quarter ${index + 1}`)
        )}
      </div>

      <div className="d-flex flex-wrap justify-content-center gap-3">
        <button
          onClick={handleSubmit}
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2"></span>
              Submitting...
            </>
          ) : (
            "Submit"
          )}
        </button>
      </div>
    </div>
  );
};
