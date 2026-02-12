import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { calcSubmitApi } from "../../../Networking/User/APIs/Calculator/calcApi";

export const LeaseFinanceCalculator = () => {
  const dispatch = useDispatch();

  const [grossArea, setGrossArea] = useState("");
  const [termYears, setTermYears] = useState("");
  const [freeRentMonths, setFreeRentMonths] = useState("");
  const [baseRentYear1, setBaseRentYear1] = useState("");
  const [annualEscalation, setAnnualEscalation] = useState("");
  const [tiAllowance, setTiAllowance] = useState("");
  const [discountRate, setDiscountRate] = useState("");

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState({});


  const [input, setInput] = useState("");


  const handleClick = (value) => setInput((prev) => prev + value);


  const clearInput = () => setInput("");


  const backspace = () => setInput((prev) => prev.slice(0, -1));


  const calculate = () => {
    try {

      const res = Function(`"use strict"; return (${input})`)();
      setInput(String(res));
    } catch {
      setInput("Error");
    }
  };

  const formatCurrency = (value, decimals = 0) =>
  Number(value).toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });


  const validate = () => {
    const err = {};

    if (!grossArea || Number(grossArea) <= 0)
      err.grossArea = "Gross Area must be greater than 0";

    if (!termYears || Number(termYears) < 1 || Number(termYears) > 50)
      err.termYears = "Term must be between 1–50 years";

    if (!baseRentYear1 || Number(baseRentYear1) <= 0)
      err.baseRentYear1 = "Base Rent must be greater than 0";

    if (
      annualEscalation === "" ||
      Number(annualEscalation) < 0 ||
      Number(annualEscalation) > 100
    )
      err.annualEscalation = "Escalation must be between 0–100%";

    if (
      freeRentMonths === "" ||
      Number(freeRentMonths) < 0 ||
      Number(freeRentMonths) > 36
    )
      err.freeRentMonths = "Free Rent must be between 0–36 months";

    if (!tiAllowance || Number(tiAllowance) < 0)
      err.tiAllowance = "TI Allowance must be 0 or greater";

    if (!discountRate || Number(discountRate) < 0 || Number(discountRate) > 100)
      err.discountRate = "Discount Rate must be 0–100%";


    setErrors(err);
    return Object.keys(err).length === 0;
  };


  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);

    const payload = {
      Gross_Area_SF: Number(grossArea),
      Total_Term_Years: Number(termYears),
      Face_Rent_PSF: Number(baseRentYear1),
      Annual_Escalation_Rate: Number(annualEscalation),
      Free_Rent_Months: Number(freeRentMonths),
      TI_Allowance_PSF: Number(tiAllowance),
      Discount_Rate: Number(discountRate),

    };

    try {
      const response = await dispatch(calcSubmitApi(payload));
      if (response.meta?.requestStatus === "fulfilled") {
        setResult(response.payload);
      }
    } finally {
      setLoading(false);
    }
  };

 return (
  <div className="container-fluid p-3">
    <div className="row g-3">

     
      <div className="col-12 col-lg-8">
        <div className="card p-3 shadow-sm h-100">
          <h4 className="fw-bold">Deal Parameters</h4>
          <hr />

          <div className="row">
            {[
              ["Gross Area (SF)", grossArea, setGrossArea, errors.grossArea],
              ["Total Term (Years)", termYears, setTermYears, errors.termYears],
              ["Base Rent PSF – Year 1", baseRentYear1, setBaseRentYear1, errors.baseRentYear1],
              ["Annual Escalation (%)", annualEscalation, setAnnualEscalation, errors.annualEscalation],
              ["Free Rent (Months)", freeRentMonths, setFreeRentMonths, errors.freeRentMonths],
              ["TI Allowance (PSF)", tiAllowance, setTiAllowance, errors.tiAllowance],
              ["Discount Rate (%)", discountRate, setDiscountRate, errors.discountRate],
            ].map(([label, val, setter, err], idx) => (
              <div className="col-12 col-md-6 mb-3" key={idx}>
                <label className="fw-semibold">{label}</label>
                <input
                  type="number"
                  className={`form-control ${err ? "is-invalid" : ""}`}
                  value={val}
                  onChange={(e) => setter(e.target.value)}
                />
                {err && <div className="invalid-feedback">{err}</div>}
              </div>
            ))}
          </div>

          <button
            className="btn btn-primary w-100 mt-2"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <span className="spinner-border spinner-border-sm"></span>
            ) : (
              "Calculate"
            )}
          </button>
        </div>
      </div>

   
      <div className="col-12 col-lg-4">
           <div className="card shadow-sm p-2">
            <h5 className="fw-bold mb-3">Calculated Results</h5>
            {!result && <p className="text-muted">Submit to see result.</p>}
            {result && (
              <>
                <div className="p-2 bg-light rounded mb-2">
                  <strong>Net Effective Rent (PSF Annual):</strong>
                  <h4>
                    ${Number(result.NER_PSF_Annual).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </h4>
                </div>

                <div className="p-2 bg-light rounded mb-2">
                  <div className="fw-semibold">Total Cash Outflow (Concessions)</div>
                  <div className="fs-5">
                    ${formatCurrency(result.Total_Cash_Outflow_Concessions, 2)}
                  </div>
                </div>

                <div className="p-2 bg-light rounded mb-2">
                  <div className="fw-semibold">NPV Rent</div>
                  <div className="fs-5">
                    ${formatCurrency(result.NPV_Rent, 2)}
                  </div>
                </div>

              </>
            )}
          </div>
        <div className="card p-3 shadow-sm ">
          <h5 className="fw-bold mb-3 text-center">Calculator</h5>

          <input
            value={input}
            readOnly
            className="form-control mb-3 text-end fs-4"
            style={{ background: "#f7f7f7", height: "55px" }}
          />

          <div
            className="d-grid"
            style={{
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "10px",
            }}
          >
            {[
              "7", "8", "9", "/",
              "4", "5", "6", "*",
              "1", "2", "3", "-",
              "0", ".", "⌫", "+",
              "=", "C",
            ].map((btn) => (
              <button
                key={btn}
                onClick={() => {
                  if (btn === "=") calculate();
                  else if (btn === "⌫") backspace();
                  else if (btn === "C") clearInput();
                  else handleClick(btn);
                }}
                className="btn fw-bold"
                style={{
                  padding: "14px",
                  fontSize: "18px",
                  background: btn === "=" ? "#0d6efd" : "#e9ecef",
                  color: btn === "=" ? "white" : "black",
                  borderRadius: "10px",
                }}
              >
                {btn}
              </button>
            ))}
          </div>
        </div>
      </div>

    </div>
  </div>
);

};
