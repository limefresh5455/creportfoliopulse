"use client";

import React, { useState } from "react";
import { Trash2, Plus } from "lucide-react";
import { useDispatch } from "react-redux";
import { distilledCompTracker } from "../../../Networking/Admin/APIs/distilledCompTrackerApi";

export const DestilledCompTracker = () => {
  const dispatch = useDispatch();

  const [addressAnon, setAddressAnon] = useState("");
  const [sfRounded, setSfRounded] = useState("");
  const [submarket, setSubmarket] = useState("");
  const [buildingClass, setBuildingClass] = useState("A");
  const [floorSegment, setFloorSegment] = useState("Base");
  const [tenantEntity, setTenantEntity] = useState("");
  const [dealType, setDealType] = useState("New Deal");
  const [guaranteeType, setGuaranteeType] = useState("Corporate");
  const [termMonths, setTermMonths] = useState("");
  const [rentSchedule, setRentSchedule] = useState([
    { rent: 0, start_y: 1, end_y: 1 },
  ]);
  const [escalationType, setEscalationType] = useState("Fixed");
  const [escalationValue, setEscalationValue] = useState("");
  const [freeRentMonths, setFreeRentMonths] = useState("");
  const [tiAllowancePsf, setTiAllowancePsf] = useState("");
  const [securityDepMonths, setSecurityDepMonths] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState("idle");

  const TENANT_ENTITY_OPTIONS = [
    "Public Company",
    "LLP",
    "LLC",
    "Startup < 3yr",
    "SPE",
  ];

  const BUILDING_CLASS_OPTIONS = ["A", "B", "C"];

  const FLOOR_SEGMENT_OPTIONS = ["Base", "Middies", "Tower"];

  const DEAL_TYPE_OPTIONS = ["New Deal", "Renewal"];

  const GUARANTEE_TYPE_OPTIONS = ["Personal", "Good Guy", "Corporate", "None"];

  const ESCALATION_TYPE_OPTIONS = ["Fixed", "Percent"];

  const validateSfRounded = (value) => {
    if (value === "" || value === 0) return true;
    return value % 1000 === 0;
  };

  const addRentPeriod = () => {
    setRentSchedule([...rentSchedule, { rent: 0, start_y: 1, end_y: 1 }]);
  };

  const removeRentPeriod = (index) => {
    if (rentSchedule.length > 1) {
      setRentSchedule(rentSchedule.filter((_, i) => i !== index));
    }
  };

  const updateRentPeriod = (index, field, value) => {
    const updated = [...rentSchedule];
    updated[index][field] = value;
    setRentSchedule(updated);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!addressAnon.trim()) {
      newErrors.address_anon = "Anonymous address is required";
    }

    if (!sfRounded || sfRounded <= 0) {
      newErrors.sf_rounded = "SF Rounded is required";
    } else if (!validateSfRounded(sfRounded)) {
      newErrors.sf_rounded = "SF must be a multiple of 1000";
    }

    if (!submarket.trim()) {
      newErrors.submarket = "Submarket is required";
    }

    if (!FLOOR_SEGMENT_OPTIONS.includes(floorSegment)) {
      newErrors.floor_segment = "Invalid floor segment selected";
    }

    if (!TENANT_ENTITY_OPTIONS.includes(tenantEntity)) {
      newErrors.tenant_entity = "Please select a valid tenant entity";
    }
    console.log(newErrors, "newErrors");

    if (!termMonths || termMonths < 1) {
      newErrors.term_months = "Term months must be at least 1";
    }

    if (!rentSchedule.length) {
      newErrors.base_rent_schedule =
        "At least one base rent schedule entry is required";
    } else {
      rentSchedule.forEach((row, index) => {
        if (!row.rent || row.rent <= 0) {
          newErrors[`rent_${index}`] = `Rent PSF is required (Row ${
            index + 1
          })`;
        }
        if (!row.start_y || !row.end_y) {
          newErrors[`year_${index}`] = `Year range required (Row ${index + 1})`;
        }
        if (row.start_y > row.end_y) {
          newErrors[
            `year_logic_${index}`
          ] = `Start year cannot exceed end year (Row ${index + 1})`;
        }
      });
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      toast.error("Please fix the highlighted errors");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitStatus("idle");

    const payload = {
      address_anon: addressAnon,
      sf_rounded: Number(sfRounded),
      submarket,
      building_class: buildingClass,
      floor_segment: floorSegment,
      tenant_entity: tenantEntity,
      guarantee_type: guaranteeType,
      term_months: Number(termMonths),
      base_rent_schedule: rentSchedule.map(({ rent, start_y, end_y }) => ({
        rent: Number(rent),
        start_y: Number(start_y),
        end_y: Number(end_y),
      })),
      escalation_type: escalationType,
      escalation_value: Number(escalationValue) || 0,
      free_rent_months: Number(freeRentMonths) || 0,
    };

    try {
      const response = await dispatch(distilledCompTracker(payload));

      setSubmitStatus("success");

      setAddressAnon("");
      setSfRounded("");
      setSubmarket("");
      setBuildingClass("A");
      setFloorSegment("Base");
      setTenantEntity("");
      setGuaranteeType("Corporate");
      setTermMonths("");
      setRentSchedule([{ rent: 0, start_y: 1, end_y: 1 }]);
      setEscalationType("Fixed");
      setEscalationValue("");
      setFreeRentMonths("");
    } catch (err) {
      console.error("Submission error:", err);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container-fluid p-3">
      <div className="mb-4 text-center text-md-start">
        <h4 className="fw-bold">
          Distilled Comp Tracker (DCT) Submission
        </h4>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="card mb-4 shadow-sm border-0">
          <div className="card-header bg-primary text-white text-center text-md-start">
            Building & Tenant Information
          </div>

          <div className="card-body">
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <label className="form-label">
                  Anonymous Address <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  value={addressAnon}
                  onChange={(e) => setAddressAnon(e.target.value)}
                  className={`form-control ${
                    errors.address_anon ? "is-invalid" : ""
                  }`}
                  placeholder="e.g., Midtown Office Tower"
                  required
                />
                {errors.address_anon && (
                  <div className="invalid-feedback">{errors.address_anon}</div>
                )}
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label">
                  SF Rounded (multiple of 1000){" "}
                  <span className="text-danger">*</span>
                </label>
                <input
                  type="number"
                  value={sfRounded}
                  onChange={(e) =>
                    setSfRounded(e.target.value ? Number(e.target.value) : "")
                  }
                  min="0"
                  step="1000"
                  className={`form-control ${
                    errors.sf_rounded ? "is-invalid" : ""
                  }`}
                  required
                />
                {errors.sf_rounded && (
                  <div className="invalid-feedback">{errors.sf_rounded}</div>
                )}
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label">
                  Submarket <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  value={submarket}
                  onChange={(e) => setSubmarket(e.target.value)}
                  className={`form-control ${
                    errors.submarket ? "is-invalid" : ""
                  }`}
                  required
                />
                {errors.submarket && (
                  <div className="invalid-feedback">{errors.submarket}</div>
                )}
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label">Building Class</label>
                <select
                  value={buildingClass}
                  onChange={(e) => setBuildingClass(e.target.value)}
                  className="form-select"
                >
                  {BUILDING_CLASS_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label">Floor Segment</label>
                <select
                  value={floorSegment}
                  onChange={(e) => setFloorSegment(e.target.value)}
                  className="form-select"
                >
                  {FLOOR_SEGMENT_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label">
                  Tenant Entity <span className="text-danger">*</span>
                </label>
                <select
                  value={tenantEntity}
                  onChange={(e) => setTenantEntity(e.target.value)}
                  className={`form-select ${
                    errors.tenant_entity ? "is-invalid" : ""
                  }`}
                  required
                >
                  <option value="">Select from list...</option>
                  {TENANT_ENTITY_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                {errors.tenant_entity && (
                  <div className="invalid-feedback">{errors.tenant_entity}</div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="card mb-4 shadow-sm border-0">
          <div className="card-header bg-success text-white text-center text-md-start">
            Deal Details
          </div>

          <div className="card-body">
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <label className="form-label">Deal Type</label>
                <select
                  value={dealType}
                  onChange={(e) => setDealType(e.target.value)}
                  className="form-select"
                >
                  {DEAL_TYPE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label">Guarantee Type</label>
                <select
                  value={guaranteeType}
                  onChange={(e) => setGuaranteeType(e.target.value)}
                  className="form-select"
                >
                  {GUARANTEE_TYPE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label">
                  Term (Months) <span className="text-danger">*</span>
                </label>
                <input
                  type="number"
                  value={termMonths}
                  onChange={(e) =>
                    setTermMonths(e.target.value ? Number(e.target.value) : "")
                  }
                  min="1"
                  className={`form-control ${
                    errors.term_months ? "is-invalid" : ""
                  }`}
                  required
                />
                {errors.term_months && (
                  <div className="invalid-feedback">{errors.term_months}</div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="card mb-4 shadow-sm border-0">
          <div className="card-header bg-primary text-white text-center text-md-start">
            Base Rent Schedule ($/PSF)
          </div>

          <div className="card-body">
            {rentSchedule.map((period, index) => (
              <div key={index} className="row g-3 mb-3 align-items-end">
                <div className="col-12 col-md-3">
                  <label className="form-label">Rent PSF</label>
                  <input
                    type="number"
                    step="0.01"
                    value={period.rent}
                    onChange={(e) =>
                      updateRentPeriod(
                        index,
                        "rent",
                        Number(e.target.value) || 0
                      )
                    }
                    className="form-control"
                    required
                  />
                </div>
                <div className="col-12 col-md-3">
                  <label className="form-label">Start Year</label>
                  <input
                    type="number"
                    min="1"
                    value={period.start_y}
                    onChange={(e) =>
                      updateRentPeriod(
                        index,
                        "start_y",
                        Number(e.target.value) || 1
                      )
                    }
                    className="form-control"
                    required
                  />
                </div>
                <div className="col-12 col-md-3">
                  <label className="form-label">End Year</label>
                  <input
                    type="number"
                    min="1"
                    value={period.end_y}
                    onChange={(e) =>
                      updateRentPeriod(
                        index,
                        "end_y",
                        Number(e.target.value) || 1
                      )
                    }
                    className="form-control"
                    required
                  />
                </div>
                <div className="col-12 col-md-3">
                  <button
                    type="button"
                    onClick={() => removeRentPeriod(index)}
                    disabled={rentSchedule.length === 1}
                    className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2"
                  >
                    <Trash2 size={18} />
                    Remove
                  </button>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addRentPeriod}
              className="btn btn-outline-primary d-flex align-items-center justify-content-center gap-2 w-100"
            >
              <Plus size={18} />
              Add Rent Period
            </button>
          </div>
        </div>

        <div className="card mb-4 shadow-sm border-0">
          <div className="card-header bg-success text-white text-center text-md-start">
            Additional Terms
          </div>

          <div className="card-body">
            <div className="row g-3">
              <div className="col-12 col-sm-6 col-lg-3">
                <label className="form-label">Escalation Type</label>
                <select
                  value={escalationType}
                  onChange={(e) => setEscalationType(e.target.value)}
                  className="form-select"
                >
                  {ESCALATION_TYPE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-12 col-sm-6 col-lg-3">
                <label className="form-label">Escalation Value (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={escalationValue}
                  onChange={(e) =>
                    setEscalationValue(
                      e.target.value ? Number(e.target.value) : ""
                    )
                  }
                  className="form-control"
                />
              </div>

              <div className="col-12 col-sm-6 col-lg-3">
                <label className="form-label">Free Rent Months</label>
                <input
                  type="number"
                  min="0"
                  value={freeRentMonths}
                  onChange={(e) =>
                    setFreeRentMonths(
                      e.target.value ? Number(e.target.value) : ""
                    )
                  }
                  className="form-control"
                />
              </div>

              <div className="col-12 col-sm-6 col-lg-3">
                <label className="form-label">TI Allowance PSF ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={tiAllowancePsf}
                  onChange={(e) =>
                    setTiAllowancePsf(
                      e.target.value ? Number(e.target.value) : ""
                    )
                  }
                  className="form-control"
                />
              </div>

              <div className="col-12 col-sm-6 col-lg-3">
                <label className="form-label">Security Deposit (Months)</label>
                <input
                  type="number"
                  min="0"
                  value={securityDepMonths}
                  onChange={(e) =>
                    setSecurityDepMonths(
                      e.target.value ? Number(e.target.value) : ""
                    )
                  }
                  className="form-control"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="d-flex flex-column align-items-center justify-content-center">
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-success btn-md px-4"
          >
            {isSubmitting ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                Submitting...
              </>
            ) : (
              <>Submit to DCT</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
