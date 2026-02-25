import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Spinner, Form, Button } from "react-bootstrap";
import { toast } from "react-toastify";
import "bootstrap-icons/font/bootstrap-icons.css";
import {
  FeedbackSubmit,
  fetchBuildings,
} from "../../../Networking/User/APIs/Feedback/feedbackApi";

export const InformationCollaboration = () => {
  const dispatch = useDispatch();

  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [loading, setLoading] = useState(false);

  const [buildings, setBuildings] = useState([]);
  const [selectedBuilding, setSelectedBuilding] = useState("");
  const [buildingLoading, setBuildingLoading] = useState(false);

  const [fields, setFields] = useState([{ key: "", value: "" }]);

  // Fetch buildings when category changes
  const handleCategoryChange = async (e) => {
    const value = e.target.value;

    setCategory(value);
    setSelectedBuilding("");
    setBuildings([]);
    setSubcategory("");

    if (!value) return;

    try {
      setBuildingLoading(true);
      const result = await dispatch(fetchBuildings(value)).unwrap();
      const list = result?.data || result || [];
      setBuildings(list);
    } catch (err) {
      setBuildings([]);
    } finally {
      setBuildingLoading(false);
    }
  };

  const handleFieldChange = (index, name, value) => {
    const updated = [...fields];
    updated[index][name] = value;
    setFields(updated);
  };

  const addField = () => {
    setFields([...fields, { key: "", value: "" }]);
  };

  const removeField = (index) => {
    const updated = fields.filter((_, i) => i !== index);
    setFields(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!category) return toast.error("Select category");
    if (!selectedBuilding) return toast.error("Select building");

    if (category === "BuildingInfo" && !subcategory) {
      return toast.error("Select subcategory");
    }

    // Convert dynamic fields to object
    const keyValueObject = {};
    fields.forEach((f) => {
      if (f.key.trim()) {
        keyValueObject[f.key] = f.value;
      }
    });

    const payload = {
      category: category,
      building_id: Number(selectedBuilding),
      form_data: keyValueObject,
    };

    if (subcategory) {
      payload.subcategory = subcategory;
    }

    try {
      setLoading(true);

      const resultAction = await dispatch(FeedbackSubmit(payload));

      if (FeedbackSubmit.fulfilled.match(resultAction)) {
        toast.success("Submitted successfully!");

        // Reset form
        setCategory("");
        setSelectedBuilding("");
        setBuildings([]);
        setSubcategory("");
        setFields([{ key: "", value: "" }]);
      } else {
        toast.error(resultAction.payload || "Something went wrong");
      }
    } catch (err) {
      toast.error("Submission failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid d-flex align-items-center">
      <div className="p-3 border_card" style={{ width: "100%" }}>
        <Form onSubmit={handleSubmit}>
          {/* CATEGORY */}
          <Form.Group className="mb-4">
            <Form.Label className="fw-semibold white_text">
              Select Category
            </Form.Label>
            <Form.Select value={category} onChange={handleCategoryChange}>
              <option value="">-- Select category --</option>
              <option value="TenantMarket">Tenant Market</option>
              <option value="Comps">Comps</option>
              <option value="TenantInformation">Tenant Info</option>
              <option value="ThirdParty">Third Party</option>
              <option value="Colleague">Employee</option>
              <option value="BuildingInfo">Building Info</option>
              <option value="ComparativeBuilding">
                Comparative Building Info
              </option>
              <option value="FireSafety">
                Fire Safety & Building Mechanise
              </option>
              <option value="Lease&Loi">Lease Agreement & LOI</option>
              <option value="Gemini">Gemini</option>
              <option value="portfolio">Portfolio</option>
            </Form.Select>
          </Form.Group>

          {/* BUILDING LOADING */}
          {buildingLoading && (
            <div className="text-center mb-3">
              <div className="small text-muted">Loading buildings...</div>
            </div>
          )}

          {/* BUILDING SELECT */}
          {!buildingLoading && buildings.length > 0 && (
            <Form.Group className="mb-4">
              <Form.Label className="fw-semibold white_text">
                Select Building
              </Form.Label>
              <Form.Select
                value={selectedBuilding}
                onChange={(e) => setSelectedBuilding(e.target.value)}
              >
                <option value="">-- Select building --</option>
                {buildings.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          )}

          {/* SUBCATEGORY */}
          {category === "BuildingInfo" && selectedBuilding && (
            <Form.Group className="mb-4">
              <Form.Label className="fw-semibold white_text">
                Select Subcategory
              </Form.Label>
              <Form.Select
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
              >
                <option value="">-- Select subcategory --</option>
                <option value="building_info">building_info</option>
                <option value="tenantinformation">tenantinformation</option>
              </Form.Select>
            </Form.Group>
          )}

          {/* EXTRA FIELDS */}
          {category &&
            !buildingLoading &&
            (selectedBuilding || buildings.length === 0) && (
              <div className="mb-4">
                <Form.Label className="fw-semibold white_text">
                  Extra Details
                </Form.Label>

                {fields.map((field, index) => (
                  <div key={index} className="d-flex gap-2 mb-2">
                    <Form.Control
                      placeholder="Key"
                      value={field.key}
                      onChange={(e) =>
                        handleFieldChange(index, "key", e.target.value)
                      }
                    />
                    <Form.Control
                      placeholder="Value"
                      value={field.value}
                      onChange={(e) =>
                        handleFieldChange(index, "value", e.target.value)
                      }
                    />

                    {fields.length > 1 && (
                      <Button
                        variant="danger"
                        onClick={() => removeField(index)}
                      >
                        −
                      </Button>
                    )}
                  </div>
                ))}

                <Button variant="secondary" size="sm" onClick={addField}>
                  + Add Field
                </Button>
              </div>
            )}

          {/* SUBMIT */}
          <div className="text-center">
            {category && (
              <Button
                type="submit"
                className="px-5 py-2 fw-semibold"
                style={{
                  borderRadius: "25px",
                  background: "#0dcaf0",
                  border: "none",
                  fontSize: "16px",
                }}
                disabled={loading}
              >
                {loading ? <Spinner size="sm" animation="border" /> : "Submit"}
              </Button>
            )}
          </div>
        </Form>
      </div>
    </div>
  );
};