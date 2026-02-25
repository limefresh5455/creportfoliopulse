import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Spinner, Form, Button } from "react-bootstrap";
import { toast } from "react-toastify";
import {
  fetchBuildings,
  UpdateFeedback,
} from "../../../Networking/User/APIs/Feedback/feedbackApi";

export const EditInformationCollaboration = ({ data, onClose, onSuccess }) => {
  const dispatch = useDispatch();

  const [category, setCategory] = useState("");
  const [buildings, setBuildings] = useState([]);
  const [selectedBuilding, setSelectedBuilding] = useState("");
  const [buildingLoading, setBuildingLoading] = useState(false);

  const [fields, setFields] = useState([{ key: "", value: "" }]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!data) return;
    console.log(data, "data");

    setCategory(data.category || "");
    setSelectedBuilding(data.building_id ? String(data.building_id) : "");

    if (data.form_data) {
      const arr = Object.entries(data.form_data).map(([k, v]) => ({
        key: k,
        value: v,
      }));
      setFields(arr.length ? arr : [{ key: "", value: "" }]);
    }
  }, [data]);

  useEffect(() => {
    if (!data?.building_id) return;
    if (!buildings.length) return;

    setSelectedBuilding(String(data.building_id));
  }, [buildings]);

  useEffect(() => {
    if (!category) return;

    const loadBuildings = async () => {
      try {
        setBuildingLoading(true);
        const res = await dispatch(fetchBuildings(category)).unwrap();
        setBuildings(res?.data || res || []);
      } catch (err) {
        console.log(err);
        setBuildings([]);
      } finally {
        setBuildingLoading(false);
      }
    };

    loadBuildings();
  }, [category, dispatch]);

  const handleFieldChange = (index, name, value) => {
    const updated = [...fields];
    updated[index][name] = value;
    setFields(updated);
  };

  const addField = () => {
    setFields([...fields, { key: "", value: "" }]);
  };

  const removeField = (index) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!category) return toast.error("Select category");
    if (!selectedBuilding && buildings.length > 0)
      return toast.error("Select building");

    const obj = {};
    fields.forEach((f) => {
      if (f.key?.trim()) obj[f.key.trim()] = f.value ?? "";
    });

    try {
      setLoading(true);

      await dispatch(
        UpdateFeedback({
          id: data.id,
          category,
          building_id: selectedBuilding ? Number(selectedBuilding) : null,
          form_data: obj,
        }),
      ).unwrap();

      toast.success("Updated successfully");
      onSuccess?.();
      onClose?.();
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group className="mb-3">
        <Form.Label>Category</Form.Label>
        <Form.Select
          value={category}
          disabled
          onChange={(e) => {
            setCategory(e.target.value);
            setSelectedBuilding("");
          }}
        >
          <option value="">Select</option>
          <option value="TenantMarket">Tenant Market</option>
          <option value="Comps">Comps</option>
          <option value="TenantInformation">Tenant Info</option>
          <option value="ThirdParty">Third Party</option>
          <option value="Colleague">Employee</option>
          <option value="BuildingInfo">Building Info</option>
          <option value="ComparativeBuilding">Comparative Building</option>
          <option value="FireSafety">Fire Safety</option>
          <option value="Lease&Loi">Lease & LOI</option>
          <option value="Gemini">Gemini</option>
          <option value="portfolio">Portfolio</option>
        </Form.Select>
      </Form.Group>

      {buildingLoading && (
        <div className="text-center mb-3">
          <Spinner size="sm" />
        </div>
      )}

      {!buildingLoading && buildings.length > 0 && (
        <Form.Group className="mb-3">
          <Form.Label>Building</Form.Label>
          <Form.Select
            value={selectedBuilding}
            disabled
            onChange={(e) => setSelectedBuilding(e.target.value)}
          >
            <option value="">Select building</option>
            {buildings.map((b) => (
              <option key={b.id} value={String(b.id)}>
                {b.name}
              </option>
            ))}
          </Form.Select>
        </Form.Group>
      )}

      <Form.Label>Extra Details</Form.Label>

      {fields.map((field, index) => (
        <div key={index} className="d-flex gap-2 mb-2">
          <Form.Control
            placeholder="Key"
            value={field.key}
            onChange={(e) => handleFieldChange(index, "key", e.target.value)}
          />
          <Form.Control
            placeholder="Value"
            value={field.value}
            onChange={(e) => handleFieldChange(index, "value", e.target.value)}
          />

          {fields.length > 1 && (
            <Button variant="danger" onClick={() => removeField(index)}>
              −
            </Button>
          )}
        </div>
      ))}

      <Button size="sm" variant="secondary" onClick={addField}>
        + Add Field
      </Button>

      <div className="text-center mt-4">
        <Button type="submit" disabled={loading}>
          {loading ? <Spinner size="sm" /> : "Update"}
        </Button>
      </div>
    </Form>
  );
};
