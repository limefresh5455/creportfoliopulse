import React, { useState } from "react";
import { toast } from "react-toastify";
import "bootstrap/dist/css/bootstrap.min.css";
import { distilledExpenseTracker } from "../../../Networking/Admin/APIs/distilledExpenseTrackerApi";
import { useDispatch } from "react-redux";

const SUBMARKET_OPTIONS = [
  "Midtown",
  "Plaza District",
  "Midtown South",
  "Flatiron",
  "Downtown",
  "Financial District",
  "Northern New Jersey",
  " Westchester, Miami",
  " Palm Beach County",
  " Central New Jersey",
  "New Jersey Waterfront",
  "Brooklyn",
  "Downtown Brooklyn",
];
const SF_BAND_OPTIONS = [
  "50,000 SF",
  "100,000 SF",
  "250,000 SF",
  "500,000 SF",
  "1000,000 SF+",
];
const CLASS_OPTIONS = ["A", "B", "C", "D"];

export const DistilledExpenseTracker = () => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    building_sf_band: "",
    submarket_geo: "",
    building_class: "",

    realestate_taxes_psf: "",
    property_insurance_psf: "",
    electric_psf: "",
    gas_psf: "",
    water_psf: "",
    janitorial_cleaning_psf: "",
    property_mgmt_fees_psf: "",
    lobby_security_psf: "",
    security_monitoring_psf: "",
    accounting_psf: "",
    legal_psf: "",
    ti_allowances_psf: "",
    commissions_psf: "",
    interest_rates_psf: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type } = e.target;

    if (type === "number" && Number(value) < 0) {
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const requiredFields = [
      "building_sf_band",
      "submarket_geo",
      "building_class",
      "building_sf",
      "realestate_taxes_psf",
      "property_insurance_psf",
      "utilities_psf",
      "janitorial_psf",
      "prop_mgmt_fees_psf",
      "security_psf",
      "admin_charges_psf",
      "ti_buildout_psf",
      "capex_major_psf",
      "commission_advert_psf",
    ];

    for (const field of requiredFields) {
      const value = formData[field];

      if (value === "") {
        toast.error(`Field "${field}" is required`);
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    const payload = {
      building_sf_band: formData.building_sf_band,
      submarket_geo: formData.submarket_geo,
      building_class: formData.building_class,

      realestate_taxes_psf: Number(formData.realestate_taxes_psf),
      property_insurance_psf: Number(formData.property_insurance_psf),
      electric_psf: Number(formData.electric_psf),
      gas_psf: Number(formData.gas_psf),
      water_psf: Number(formData.water_psf),
      janitorial_cleaning_psf: Number(formData.janitorial_cleaning_psf),
      property_mgmt_fees_psf: Number(formData.property_mgmt_fees_psf),
      lobby_security_psf: Number(formData.lobby_security_psf),
      security_monitoring_psf: Number(formData.security_monitoring_psf),
      accounting_psf: Number(formData.accounting_psf),
      legal_psf: Number(formData.legal_psf),
      ti_allowances_psf: Number(formData.ti_allowances_psf),
      commissions_psf: Number(formData.commissions_psf),
      interest_rates_psf: Number(formData.interest_rates_psf),
    };

    try {
      const resultAction = await dispatch(
        distilledExpenseTracker(payload)
      ).unwrap();
      
      setFormData({
        building_sf_band: "",
        submarket_geo: "",
        building_class: "",
        building_sf: "",
        realestate_taxes_psf: "",
        property_insurance_psf: "",
        utilities_psf: "",
        janitorial_psf: "",
        prop_mgmt_fees_psf: "",
        security_psf: "",
        admin_charges_psf: "",
        ti_buildout_psf: "",
        capex_major_psf: "",
        commission_advert_psf: "",
      });
    } catch (err) {
      toast.error(err.message || "Error submitting expense");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fuild p-3">
       <div className="mb-4 text-center text-md-center">
        <h4 className="fw-bold">
          Distilled Expense Tracker (DET) Submission
        </h4>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card mb-4 shadow-sm">
          <div className="card-header bg-primary text-white text-center text-md-start">
            Building Metadata
          </div>

          <div className="card-body">
            <div className="row g-3">
              <div className="col-12 col-md-4">
                <label className="form-label">Building SF</label>
                <select
                  className="form-select"
                  name="building_sf_band"
                  value={formData.building_sf_band}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Building SF</option>
                  {SF_BAND_OPTIONS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-12 col-md-4">
                <label className="form-label">Submarket</label>
                <select
                  className="form-select"
                  name="submarket_geo"
                  value={formData.submarket_geo}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Submarket</option>
                  {SUBMARKET_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-12 col-md-4">
                <label className="form-label">Building Class</label>
                <select
                  className="form-select"
                  name="building_class"
                  value={formData.building_class}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Class</option>
                  {CLASS_OPTIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="card mb-4 shadow-sm">
          <div className="card-header bg-success text-white text-center text-md-start">
            Expense Data ($/SF)
          </div>

          <div className="card-body">
            <div className="row g-3">
              {[
                { label: "Real Estate Taxes", key: "realestate_taxes_psf" },
                { label: "Property Insurance", key: "property_insurance_psf" },
                { label: "Electric", key: "electric_psf" },
                { label: "Gas", key: "gas_psf" },
                { label: "Water", key: "water_psf" },
                {
                  label: "Janitorial Cleaning",
                  key: "janitorial_cleaning_psf",
                },
                { label: "Property Mgmt Fees", key: "property_mgmt_fees_psf" },
                { label: "Lobby Security", key: "lobby_security_psf" },
                {
                  label: "Security Monitoring",
                  key: "security_monitoring_psf",
                },
                { label: "Accounting", key: "accounting_psf" },
                { label: "Legal", key: "legal_psf" },
                { label: "TI Allowances", key: "ti_allowances_psf" },
                { label: "Commissions", key: "commissions_psf" },
                { label: "Interest Rates", key: "interest_rates_psf" },
              ].map((item) => (
                <div className="col-12 col-sm-6 col-lg-4" key={item.key}>
                  <label className="form-label">{item.label}</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    name={item.key}
                    value={formData[item.key]}
                    onChange={handleChange}
                    required
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="d-flex justify-content-center">
          <button
            type="submit"
            className="btn btn-success btn-md px-4"
            disabled={loading}
          >
            {loading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                Submitting...
              </>
            ) : (
              "Submit Expense"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
