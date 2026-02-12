import React, { useState } from "react";
import { useDispatch } from "react-redux";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { distilledBenchmarkApi } from "../../../Networking/Admin/APIs/distilledCompTrackerApi";
import { Card, Form, Button, Spinner } from "react-bootstrap";

const TENANT_ENTITY_OPTIONS = ["Public Company", "LLP", "LLC", "Startup < 3yr", "SPE"];
const FLOOR_SEGMENT_OPTIONS = ["Base", "Middies", "Tower"];
const GUARANTEE_TYPE_OPTIONS = ["Personal", "Good Guy", "Corporate", "None"];
const BUILDING_CLASS_OPTIONS = ["A", "B", "C"];

export const DistilledCompTracker = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const [form, setForm] = useState({
    submarket: "",
    building_class: "",
    floor_segment: "",
    tenant_entity: "",
    guarantee_type: "",
    term_months_min: "",
    term_months_max: "",
    sf_rounded_min: "",
    sf_rounded_max: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const validate = () => {
    const err = {};

  
    if (!form.submarket.trim()) err.submarket = "Submarket is required";
    if (!form.building_class) err.building_class = "Building Class is required";
    if (!form.guarantee_type) err.guarantee_type = "Guarantee Type is required";
    if (!form.floor_segment) err.floor_segment = "Floor Segment is required";
    if (!form.tenant_entity) err.tenant_entity = "tenent Entity is required";


    const termMin = form.term_months_min ? Number(form.term_months_min) : 0;
    const termMax = form.term_months_max ? Number(form.term_months_max) : 999;
    const sfMin = form.sf_rounded_min ? Number(form.sf_rounded_min) : 0;
    const sfMax = form.sf_rounded_max ? Number(form.sf_rounded_max) : 999999;

    if (termMin < 0) err.term_months_min = "Term Min cannot be negative";
    if (termMax < 0) err.term_months_max = "Term Max cannot be negative";
    if (termMin > termMax) err.term_months_max = "Term Max must be ≥ Term Min";

    if (sfMin < 0) err.sf_rounded_min = "SF Min cannot be negative";
    if (sfMax < 0) err.sf_rounded_max = "SF Max cannot be negative";
    if (sfMin > sfMax) err.sf_rounded_max = "SF Max must be ≥ SF Min";

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setHasSubmitted(true);
    setResult(null);
    setChartData([]);

    try {
      const payload = {
        submarket: form.submarket.trim(),
        building_class: form.building_class,
        floor_segment: form.floor_segment || null,
        tenant_entity: form.tenant_entity || null,
        guarantee_type: form.guarantee_type || null,
        term_months_min: form.term_months_min ? Number(form.term_months_min) : 0,
        term_months_max: form.term_months_max ? Number(form.term_months_max) : 999,
        sf_rounded_min: form.sf_rounded_min ? Number(form.sf_rounded_min) : 0,
        sf_rounded_max: form.sf_rounded_max ? Number(form.sf_rounded_max) : 999999,
      };

      const data = await dispatch(distilledBenchmarkApi(payload)).unwrap();

      setResult(data);

      if (data.sufficient_data) {
        const formatted = [
          {
            name: "Base Rent ($/SF)",
            your: data?.your_deal?.base_rent ?? 0,
            benchmark: data?.avg_base_rent ?? 0,
          },
          {
            name: "Net Effective Rent ($/SF)",
            your: data?.your_deal?.ner ?? 0,
            benchmark: data?.avg_net_effective_rent ?? 0,
          },
          {
            name: "TI Allowance ($/SF)",
            your: data?.your_deal?.ti_allowance ?? 0,
            benchmark: data?.avg_ti_allowance_psf ?? 0,
          },
          {
            name: "Free Rent (Months)",
            your: data?.your_deal?.free_rent ?? 0,
            benchmark: data?.avg_free_rent_months ?? 0,
          },
        ];
        setChartData(formatted);
      }
    } catch (err) {
      console.error("Benchmark API error", err);
      setResult({
        sufficient_data: false,
        message: "An error occurred while fetching benchmark data.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid py-5 px-2 px-md-4">
      <div className="row justify-content-center">
        <div className="col-md-12">
          <Card className="p-4">
            <Form onSubmit={handleSubmit}>
              <div className="row align-items-center g-3">
                <div className="col-12 col-md-6">
                  <Form.Group>
                    <Form.Label className="fw-semibold">Submarket *</Form.Label>
                    <Form.Control
                      type="text"
                      name="submarket"
                      placeholder="e.g., Downtown Austin"
                      value={form.submarket}
                      onChange={handleChange}
                      isInvalid={!!errors.submarket}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.submarket}
                    </Form.Control.Feedback>
                  </Form.Group>
                </div>

                <div className="col-12 col-md-6">
                  <Form.Group>
                    <Form.Label className="fw-semibold">Building Class *</Form.Label>
                    <Form.Select
                      name="building_class"
                      value={form.building_class}
                      onChange={handleChange}
                      isInvalid={!!errors.building_class}
                    >
                      <option value="">Select Class</option>
                      {BUILDING_CLASS_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      {errors.building_class}
                    </Form.Control.Feedback>
                  </Form.Group>
                </div>

                
                <div className="col-12 col-md-4">
                  <Form.Group>
                    <Form.Label className="fw-semibold">Floor Segment</Form.Label>
                    <Form.Select
                      name="floor_segment"
                      value={form.floor_segment}
                      onChange={handleChange}
                      isInvalid={!!errors.floor_segment}
                    >
                      <option value="">Select Segment</option>
                      {FLOOR_SEGMENT_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      {errors.floor_segment}
                    </Form.Control.Feedback>
                  </Form.Group>
                </div>

                <div className="col-12 col-md-4">
                  <Form.Group>
                    <Form.Label className="fw-semibold">Tenant Entity</Form.Label>
                    <Form.Select
                      name="tenant_entity"
                      value={form.tenant_entity}
                      onChange={handleChange}
                       isInvalid={!!errors.tenant_entity}
                    >
                      <option value="">Select Tenant Entity</option>
                      {TENANT_ENTITY_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      {errors.tenant_entity}
                    </Form.Control.Feedback>
                  </Form.Group>
                </div>

                <div className="col-12 col-md-4">
                  <Form.Group>
                    <Form.Label className="fw-semibold">Guarantee Type</Form.Label>
                    <Form.Select
                      name="guarantee_type"
                      value={form.guarantee_type}
                      onChange={handleChange}
                       isInvalid={!!errors.guarantee_type}
                    >
                      <option value="">Select Guarantee Type</option>
                      {GUARANTEE_TYPE_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      {errors.guarantee_type}
                    </Form.Control.Feedback>
                  </Form.Group>
                </div>

               
                {[
                  ["term_months_min", "Term Min (months)", errors.term_months_min],
                  ["term_months_max", "Term Max (months)", errors.term_months_max],
                  ["sf_rounded_min", "SF Min", errors.sf_rounded_min],
                  ["sf_rounded_max", "SF Max", errors.sf_rounded_max],
                ].map(([name, label, err], idx) => (
                  <div className="col-6 col-md-3" key={idx}>
                    <Form.Group>
                      <Form.Label className="fw-semibold">{label}</Form.Label>
                      <Form.Control
                        type="number"
                        name={name}
                        placeholder={label.includes("Max") ? "999999" : "0"}
                        value={form[name]}
                        onChange={handleChange}
                        isInvalid={!!err}
                      />
                      <Form.Control.Feedback type="invalid">{err}</Form.Control.Feedback>
                    </Form.Group>
                  </div>
                ))}
              </div>

              <div className="d-flex justify-content-center mt-4">
                <Button
                  type="submit"
                  className="w-100 w-md-25"
                  variant="secondary"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Spinner size="sm" className="me-2" />
                      Analyzing Market Comps...
                    </>
                  ) : (
                    "Benchmark Comparison"
                  )}
                </Button>
              </div>
            </Form>
          </Card>

        
          {hasSubmitted && (
            <div className="mt-3">
              {!result?.sufficient_data ? (
                <div className="card border-0 shadow-lg rounded-4">
                  <div className="card-body text-center py-5 bg-white">
                    <h4 className="text-danger fw-bold">
                      Insufficient Comp Data for Benchmark.
                    </h4>
                    <p className="lead text-muted mt-3">{result?.message || "Not enough comparable transactions match your criteria (requires at least 10 distinct clients)."}</p>
                    <p className="text-muted">Try broadening your filters to include more comparable leases.</p>
                  </div>
                </div>
              ) : (
                <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
                  <div className="card-header bg-white border-bottom py-4">
                    <h4 className="mb-1 fw-bold text-dark">Your Deal vs Market Benchmark</h4>
                    <p className="text-muted mb-0">
                      Based on <strong>{result.comp_count}</strong> comparable leases from <strong>{result.distinct_companies}</strong> distinct companies
                    </p>
                  </div>
                  <div className="card-body p-4 bg-light">
                    <ResponsiveContainer width="100%" height={450}>
                      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <XAxis dataKey="name" tick={{ fill: "#4b5563", fontSize: 14, fontWeight: 600 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: "#6b7280" }} axisLine={false} tickLine={false} />
                        <Tooltip cursor={{ fill: "rgba(0,0,0,0.05)" }} contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }} />
                        <Legend wrapperStyle={{ paddingTop: "30px" }} iconType="rect" iconSize={16} />
                        <Bar dataKey="your" name="Your Deal" fill="#3b82f6" radius={[8, 8, 0, 0]} barSize={50} />
                        <Bar dataKey="benchmark" name="Market Average" fill="#10b981" radius={[8, 8, 0, 0]} barSize={50} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DistilledCompTracker;
