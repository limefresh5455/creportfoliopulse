import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { commissionSimpleApi } from "../../../Networking/User/APIs/Calculator/calcApi";

export const CommissionCalculator = () => {
  const dispatch = useDispatch();

  const [grossArea, setGrossArea] = useState("");
  const [termYears, setTermYears] = useState("");
  const [freeRentMonths, setFreeRentMonths] = useState("");
  const [annualEscalation, setAnnualEscalation] = useState("");

  const [baseRentList, setBaseRentList] = useState([]);
  const [commissionList, setCommissionList] = useState([]);

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);


  const validate = () => {
    const err = {};

    if (!grossArea || grossArea <= 0)
      err.grossArea = "Gross area must be greater than 0";

    if (!termYears || termYears < 1 || termYears > 50)
      err.termYears = "Term must be between 1 and 50 years";

    if (annualEscalation < 0 || annualEscalation > 100)
      err.annualEscalation = "Escalation must be 0–100%";

    if (freeRentMonths < 0 || freeRentMonths > 36)
      err.freeRentMonths = "Free rent must be 0–36 months";

    if (baseRentList.length !== Number(termYears))
      err.baseRent = "Generate base rent rows";

    if (commissionList.length !== Number(termYears))
      err.commission = "Generate commission rows";

    const invalidBaseRent = baseRentList.some(
      (b) => b.rent === "" || b.rent <= 0
    );
    if (invalidBaseRent)
      err.baseRentValues = "All base rents must be greater than 0";

    const invalidRate = commissionList.some(
      (c) => c.rate_pct === "" || c.rate_pct < 0 || c.rate_pct > 100
    );
    if (invalidRate)
      err.commissionRates = "Commission rates must be 0–100%";

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const generateYearRows = () => {
    const years = Number(termYears);
    if (!years || years < 1) return;

    setBaseRentList(
      Array.from({ length: years }, (_, i) => ({
        year: i + 1,
        rent: "",
      }))
    );

    setCommissionList(
      Array.from({ length: years }, (_, i) => ({
        year: i + 1,
        rate_pct: "",
      }))
    );
  };


  const updateBaseRent = (index, value) => {
    const arr = [...baseRentList];
    arr[index].rent = value;
    setBaseRentList(arr);
  };

  const updateCommissionRate = (index, value) => {
    const arr = [...commissionList];
    arr[index].rate_pct = value;
    setCommissionList(arr);
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);

    const payload = {
      Square_Footage: Number(grossArea),
      Total_Term_Years: Number(termYears),
      Annual_Escalation_Rate: Number(annualEscalation),
      Free_Rent_Months: Number(freeRentMonths),
      Base_Rent_PSF: baseRentList.map((b) => Number(b.rent)),
      Commission_Rate_Annual_Pct: commissionList.map((c) => ({
        year: c.year,
        rate_pct: Number(c.rate_pct),
      })),
    };

    try {
      const res = await dispatch(commissionSimpleApi(payload));
      if (res.meta.requestStatus === "fulfilled") {
        setResult(res.payload);
      }
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="container-fluid p-3">
      <div className="row g-3">

  
        <div className="col-md-8">
          <div className="card p-3 shadow-sm">
            <h4 className="fw-bold">Deal Parameters</h4>
            <hr />

            <div className="row">
              {[
                ["Gross Area (SF)", grossArea, setGrossArea, errors.grossArea],
                ["Total Term (Years)", termYears, setTermYears, errors.termYears],
                ["Annual Escalation (%)", annualEscalation, setAnnualEscalation, errors.annualEscalation],
                ["Free Rent (Months)", freeRentMonths, setFreeRentMonths, errors.freeRentMonths],
              ].map(([label, val, setter, err], i) => (
                <div className="col-md-6 mb-3" key={i}>
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
              className="btn btn-outline-primary w-100 my-3"
              onClick={generateYearRows}
            >
              Generate Year Rows
            </button>

           
            <h5 className="fw-bold mt-3">Base Rent PSF (Per Year)</h5>
            <hr />
            {baseRentList.map((item, idx) => (
              <div className="mb-2" key={idx}>
                <label>Year {item.year}</label>
                <input
                  type="number"
                  className="form-control"
                  value={item.rent}
                  onChange={(e) => updateBaseRent(idx, e.target.value)}
                />
              </div>
            ))}

           
            <h5 className="fw-bold mt-4">Commission Rates (%)</h5>
            <hr />
            {commissionList.map((item, idx) => (
              <div className="mb-2" key={idx}>
                <label>Year {item.year}</label>
                <input
                  type="number"
                  className="form-control"
                  value={item.rate_pct}
                  onChange={(e) =>
                    updateCommissionRate(idx, e.target.value)
                  }
                />
              </div>
            ))}

            <button
              className="btn btn-primary w-100 mt-4"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Calculating..." : "Calculate"}
            </button>
          </div>
        </div>

  
        <div className="col-md-4">
          <div className="card p-3 shadow-sm">
            <h5 className="fw-bold">Calculated Results</h5>

            {!result && (
              <p className="text-muted">Submit to see result</p>
            )}

            {result && (
              <div className="p-2 bg-light rounded">
                <strong>Total Commission Due</strong>
                <div className="fs-5">
                  {formatCurrency(result.Total_Commission_Due)}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
