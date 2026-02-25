import React, { useState } from "react";
import { Form, Button, Card, Spinner, Alert } from "react-bootstrap";
import { Bar } from "react-chartjs-2";
import { useDispatch, useSelector } from "react-redux";
import { getBenchmark } from "../../../Networking/Admin/APIs/forumApi";

export const Benchmark = () => {
  const dispatch = useDispatch();

  const {
    loading,
    Data: benchmarkData,
    error: apiError,
  } = useSelector((state) => state.ForumSlice);

  const [sfBand, setSfBand] = useState("");
  const [submarket, setSubmarket] = useState("");
  const [buildingClass, setBuildingClass] = useState("");
  const [formError, setFormError] = useState("");

  const SUBMARKET_OPTIONS = [
    "Midtown",
    "Plaza District",
    "Midtown South",
    "Flatiron",
    "Downtown",
    "Financial District",
    "Northern New Jersey",
    "Westchester",
    "Miami",
    "Palm Beach County",
    "Central New Jersey",
    "New Jersey Waterfront",
    "Brooklyn",
    "Downtown Brooklyn",
  ];

  const SF_BAND_OPTIONS = [
    "50,000 SF",
    "100,000 SF",
    "250,000 SF",
    "500,000 SF",
    "1,000,000 SF+",
  ];

  const CLASS_OPTIONS = ["A", "B", "C", "D"];

  const LABEL_MAP = {
    property_insurance_psf: "Property Insurance ($/PSF)",
    electric_psf: "Electric ($/PSF)",
    gas_psf: "Gas ($/PSF)",
    water_psf: "Water ($/PSF)",
    janitorial_cleaning_psf: "Janitorial & Cleaning ($/PSF)",
    property_mgmt_fees_psf: "Property Management Fees ($/PSF)",
    lobby_attendant_security_psf: "Lobby Attendant & Security ($/PSF)",
    security_monitoring_systems_psf: "Security Monitoring ($/PSF)",
    accounting_psf: "Accounting ($/PSF)",
    legal_psf: "Legal ($/PSF)",
    ti_allowances_psf: "TI Allowances ($/PSF)",
    commissions_psf: "Commissions ($/PSF)",
    interest_rates_psf: "Interest Rates ($/PSF)",
    realestate_taxes_psf: "Real Estate Taxes ($/PSF)",
  };

  const handleFetch = () => {
    if (!sfBand || !submarket || !buildingClass) {
      setFormError("All fields are required");
      return;
    }

    setFormError("");

    dispatch(
      getBenchmark({
        sf_band: sfBand,
        submarket,
        building_class: buildingClass,
      })
    );
  };

  const renderChart = () => {
    if (!benchmarkData) return null;

    if (
      !benchmarkData.benchmark ||
      typeof benchmarkData.benchmark !== "object"
    ) {
      return (
        <div className="text-center">
          <Alert variant="warning">No benchmark data available</Alert>
        </div>
      );
    }


    const keys = Object.keys(benchmarkData.benchmark);

    const labels = keys.map((key) => LABEL_MAP[key] || key);

    const values = keys.map((key) => benchmarkData.benchmark[key] ?? 0);

    return (
      <div style={{ width: "100%", overflowX: "auto" }}>
        <div style={{ minWidth: "650px" }}>
          <Bar
            data={{
              labels,
              datasets: [
                {
                  label: "Benchmark Avg ($/PSF)",
                  data: values,
                  backgroundColor: "rgba(54, 162, 235, 0.5)",
                },
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  labels: { font: { size: 12 } },
                },
              },
              scales: {
                x: {
                  ticks: {
                    maxRotation: 60,
                    minRotation: 30,
                  },
                },
              },
            }}
            height={350}
          />
        </div>
      </div>
    );
  };

  return (
    <div>
      {" "}
      <div
        className="header-bg {
-bg d-flex justify-content-start px-3 align-items-center sticky-header"
      >
        <h5 className="mb-0 text-light mx-4">DET Benchmarking</h5>
      </div>
      <div className="container-fuild p-3">
        <Card className="p-4 shadow-sm">
          <div className="row g-3">
            <div className="col-12 col-sm-6 col-md-4">
              <Form.Group>
                <Form.Label>SF Band</Form.Label>
                <Form.Select
                  value={sfBand}
                  onChange={(e) => setSfBand(e.target.value)}
                >
                  <option value="">Select SF Band</option>
                  {SF_BAND_OPTIONS.map((band, i) => (
                    <option key={i} value={band}>
                      {band}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </div>

            <div className="col-12 col-sm-6 col-md-4">
              <Form.Group>
                <Form.Label>Submarket</Form.Label>
                <Form.Select
                  value={submarket}
                  onChange={(e) => setSubmarket(e.target.value)}
                >
                  <option value="">Select Submarket</option>
                  {SUBMARKET_OPTIONS.map((item, i) => (
                    <option key={i} value={item}>
                      {item}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </div>

            <div className="col-12 col-sm-6 col-md-4">
              <Form.Group>
                <Form.Label>Building Class</Form.Label>
                <Form.Select
                  value={buildingClass}
                  onChange={(e) => setBuildingClass(e.target.value)}
                >
                  <option value="">Select Class</option>
                  {CLASS_OPTIONS.map((cls, i) => (
                    <option key={i} value={cls}>
                      {cls}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </div>
          </div>

          <div className="d-flex justify-content-center mt-3">
            <Button
              className="w-100 w-sm-50 w-md-25"
              variant="secondary"
              onClick={handleFetch}
              disabled={loading}
            >
              {loading ? <Spinner size="sm" /> : "Get Benchmark"}
            </Button>
          </div>

          <hr />

          {formError && <Alert variant="danger">{formError}</Alert>}
          {apiError && <Alert variant="danger">{apiError}</Alert>}

          <div className="mt-4">{renderChart()}</div>
        </Card>
      </div>
    </div>
  );
};
