import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { SubleaseTrackerSubmit } from "../../../Networking/Admin/APIs/subleaseTrackerApi";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { BackButton } from "../../../Component/backButton";

export const SubleaseTracker = ({ data }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form, setForm] = useState(data || {});

  const [loading, setLoading] = useState(false);

  const quarters = ["Q1", "Q2", "Q3", "Q4"];

  const role = sessionStorage.getItem("role");
  const Role = role;
  console.log(Role, "Role");

  const resetForm = () => {
    setForm({
      subTenantName: "",
      buildingAddress: "",
      floor: "",
      commencementDate: "",
      expirationDate: "",
      subtenantHeadcount: "",
      tenantNoticeDate: "",
      subtenantRent: "",
      directTenantRent: "",
      subtenantContact: "",
      directTenantContact: "",
      notes: "",
      statusUpdates: {
        Q1: {
          checkIn: false,
          headcount: false,
          noteSent: false,
          holidayGift: false,
        },
        Q2: {
          checkIn: false,
          headcount: false,
          noteSent: false,
          holidayGift: false,
        },
        Q3: {
          checkIn: false,
          headcount: false,
          noteSent: false,
          holidayGift: false,
        },
        Q4: {
          checkIn: false,
          headcount: false,
          noteSent: false,
          holidayGift: false,
        },
      },
    });
  };

  const handleToggle = (q, field) => {
    setForm((prev) => ({
      ...prev,
      statusUpdates: {
        ...prev.statusUpdates,
        [q]: {
          ...prev.statusUpdates?.[q],
          [field]: !prev.statusUpdates?.[q]?.[field],
        },
      },
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);

    const payload = {
      sub_tenant_name: form.subTenantName || "",
      building_address: form.buildingAddress || "",
      floor_suite: form.floor || "",
      sublease_commencement_date: form.commencementDate || null,
      sublease_expiration_date: form.expirationDate || null,
      subtenant_headcount: Number(form.subtenantHeadcount) || 0,
      direct_tenant_notice_of_renewal_date: form.tenantNoticeDate || null,
      subtenant_current_rent: form.subtenantRent || "",
      direct_tenant_current_rent: form.directTenantRent || "",
      subtenant_contact_info: form.subtenantContact || "",
      direct_tenant_contact_info: form.directTenantContact || "",
      notes: form.notes || "",
      q1: {
        check_in: form.statusUpdates?.Q1?.checkIn || false,
        headcount_confirmation: form.statusUpdates?.Q1?.headcount || false,
        building_update_note_sent: form.statusUpdates?.Q1?.noteSent || false,
        holiday_gift: form.statusUpdates?.Q1?.holidayGift || false,
      },
      q2: {
        check_in: form.statusUpdates?.Q2?.checkIn || false,
        headcount_confirmation: form.statusUpdates?.Q2?.headcount || false,
        building_update_note_sent: form.statusUpdates?.Q2?.noteSent || false,
        holiday_gift: form.statusUpdates?.Q2?.holidayGift || false,
      },
      q3: {
        check_in: form.statusUpdates?.Q3?.checkIn || false,
        headcount_confirmation: form.statusUpdates?.Q3?.headcount || false,
        building_update_note_sent: form.statusUpdates?.Q3?.noteSent || false,
        holiday_gift: form.statusUpdates?.Q3?.holidayGift || false,
      },
      q4: {
        check_in: form.statusUpdates?.Q4?.checkIn || false,
        headcount_confirmation: form.statusUpdates?.Q4?.headcount || false,
        building_update_note_sent: form.statusUpdates?.Q4?.noteSent || false,
        holiday_gift: form.statusUpdates?.Q4?.holidayGift || false,
      },
    };

    try {
      await dispatch(SubleaseTrackerSubmit(payload)).unwrap();
      toast.success("Sublease saved successfully!");
      {
        Role === "admin"
          ? navigate("/sublease-tracker-list")
          : navigate("/user-sublease-tracker-list");
      }

      resetForm();
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fuild p-4">
      <div className="d-flex align-items-center my-2">
        <BackButton />
        <h2 className="fw-bold ms-2">New Sublease Tracker</h2>
      </div>

      <div className="card p-4 mb-4">
        <h4 className="mb-5">Sublease Identification</h4>
        <div className="row g-3">
          {[
            { label: "Sub-Tenant Name", name: "subTenantName" },
            { label: "Building Address", name: "buildingAddress" },
            { label: "Floor/Suite", name: "floor" },
            {
              label: "Sublease Commencement Date",
              name: "commencementDate",
              type: "date",
            },
            {
              label: "Sublease Expiration Date",
              name: "expirationDate",
              type: "date",
            },
            { label: "Subtenant Headcount", name: "subtenantHeadcount" },
            {
              label: "Direct Tenant Notice of Renewal Date",
              name: "tenantNoticeDate",
              type: "date",
            },
            { label: "Subtenant Current Rent", name: "subtenantRent" },
            { label: "Direct Tenant Current Rent", name: "directTenantRent" },
            {
              label: "Subtenant Contact Info",
              name: "subtenantContact",
              placeholder: "Name, Phone, Email",
            },
            {
              label: "Direct Tenant Contact Info",
              name: "directTenantContact",
              placeholder: "Name, Phone, Email",
            },
          ].map((field, idx) => (
            <div
              key={idx}
              className="d-flex flex-column flex-md-row align-items-start col-12 col-md-12"
            >
              <div className="col-12 col-md-3 mb-2 mb-md-0">
                <label className="fw-bold form-label">{field.label}</label>
              </div>
              <div className="col-12 col-md-9">
                <input
                  type={field.type || "text"}
                  name={field.name}
                  value={form[field.name] || ""}
                  onChange={handleChange}
                  placeholder={field.placeholder || ""}
                  className="form-control border-primary"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-4 mb-4">
        <h4 className="mb-3">Notes</h4>

        <textarea
          name="notes"
          rows="4"
          value={form.notes}
          onChange={handleChange}
          className="form-control border-primary"
          placeholder="Enter any additional notes here..."
        />
      </div>

      <div className="card p-4 mb-2">
        <h4 className="mb-3">Lease & Tenant Details</h4>

        {quarters.map((q) => (
          <div>
            <h5 className="mb-3">{q} Status Update</h5>
            <div
              key={q}
              className="card p-3 mb-3"
              style={{ backgroundColor: "#e9eef6" }}
            >
              <div className="row">
                {[
                  { label: "Check In", field: "checkIn" },
                  { label: "Headcount Confirmation", field: "headcount" },
                  { label: "Building Update Note Sent", field: "noteSent" },
                  { label: "Holiday Gift", field: "holidayGift" },
                ].map((item, idx) => (
                  <div key={idx} className="col-md-6">
                    <div className="form-check form-switch">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={form.statusUpdates?.[q]?.[item.field] || false}
                        onChange={() => handleToggle(q, item.field)}
                      />
                      <label className="form-check-label">{item.label}</label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="d-flex flex-wrap justify-content-center gap-2">
        <button
          onClick={handleSubmit}
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? (
            <span className="spinner-border spinner-border-sm me-2"></span>
          ) : null}
          {loading ? "Submitting..." : "Submit"}
        </button>
      </div>
    </div>
  );
};

