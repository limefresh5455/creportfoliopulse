import { useState } from "react";
import { useDispatch } from "react-redux";
import { Form } from "react-bootstrap";
import { itcalculatorApi } from "../../../Networking/User/APIs/Calculator/calcApi";

const LINE_ITEMS = [
  "Demolition",
  "New HVAC System",
  "Painting",
  "Lighting",
  "Plumbing",
  "Carpeting",
  "Glass Front Offices",
  "Pantry Remodel",
  "Bathroom Remodel",
  "Tile (Stone/Ceramic)",
  "Hardwood Polishing",
];

export const TICalculator = () => {
  const dispatch = useDispatch();

  const [sf, setSf] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleCheckboxChange = (item) => {
    setSelectedItems((prev) => {
      const updated = prev.includes(item)
        ? prev.filter((i) => i !== item)
        : [...prev, item];

      if (updated.length > 0) {
        setErrors((e) => ({ ...e, items: null }));
      }

      return updated;
    });
  };

  const validate = () => {
    const newErrors = {};

    if (!sf || Number(sf) <= 0) {
      newErrors.sf = "Square footage must be greater than 0";
    }

    if (selectedItems.length === 0) {
      newErrors.items = "Please select at least one line item";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatCurrency = (value, decimals = 0) =>
    Number(value || 0).toLocaleString("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });

  const handleCalculate = async () => {
    if (!validate()) return;

    setLoading(true);

    const payload = {
      sf: Number(sf),
      items: selectedItems,
    };

    try {
      const response = await dispatch(itcalculatorApi(payload));

      if (response.meta?.requestStatus === "fulfilled") {
        setResult(response.payload);
      } else {
        alert("Calculation failed");
      }
    } catch (error) {
      console.error("API Error:", error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid">
      <div className="card shadow-sm">
        <div className="card-body">
          <h4 className="fw-bold mb-3">TI Calculator</h4>

          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">Square Footage (SF)</Form.Label>
            <Form.Control
              type="number"
              placeholder="e.g. 10000"
              value={sf}
              isInvalid={!!errors.sf}
              onChange={(e) => {
                setSf(e.target.value);
                if (Number(e.target.value) > 0) {
                  setErrors((prev) => ({ ...prev, sf: null }));
                }
              }}
            />
            <Form.Control.Feedback type="invalid">
              {errors.sf}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">TI Line Items</Form.Label>

            <div className="border rounded p-3">
              {LINE_ITEMS.map((item) => (
                <Form.Check
                  key={item}
                  type="checkbox"
                  id={item}
                  label={item}
                  checked={selectedItems.includes(item)}
                  onChange={() => handleCheckboxChange(item)}
                  className="mb-2"
                />
              ))}
            </div>

            {errors.items && (
              <div className="text-danger mt-1">{errors.items}</div>
            )}
          </Form.Group>

          <button
            className="btn btn-primary w-100"
            onClick={handleCalculate}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Calculating...
              </>
            ) : (
              "Calculate"
            )}
          </button>
        </div>
      </div>

      {result && (
        <div className="card shadow-sm mt-4">
          <div className="card-body">
            <h6 className="fw-bold mb-3">Breakdown</h6>

            <ul className="list-group mb-3">
              {Object.entries(result.breakdown || {}).map(([key, value]) => (
                <li key={key} className="list-group-item">
                  <div className="d-flex justify-content-between">
                    <span className="fw-semibold">{key}</span>
                    <span>${formatCurrency(value.cost)}</span>
                  </div>

                  {value.formula && (
                    <small className="text-muted d-block ms-2">
                      {value.formula}
                    </small>
                  )}
                </li>
              ))}
            </ul>

            <div className="d-flex justify-content-between">
              <span className="fw-semibold">Contingency</span>
              <span>${formatCurrency(result.contingency)}</span>
            </div>

            <hr />

            <div className="d-flex justify-content-between fs-5 fw-bold text-success">
              <span>Estimated Total</span>
              <span>${formatCurrency(result.estimated_total)}</span>
            </div>

            <div className="text-end text-muted mt-1 fs-5 fw-bold">
              Cost per SF: ${formatCurrency(result.cost_per_sf, 2)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
