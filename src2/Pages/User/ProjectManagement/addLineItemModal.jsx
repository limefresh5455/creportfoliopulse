import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { addLineItemsBulkApi } from "../../../Networking/User/APIs/ProjectManagement/projectManagement";

const CATEGORIES = [
  "Demolition",
  "Electrical",
  "HVAC",
  "Plumbing",
  "Flooring",
  "Painting",
];

const PHASES = [
  "Phase 1 - Demo",
  "Phase 2 - Rough-In",
  "Phase 3 - Electrical/HVAC",
  "Phase 4 - Finishes",
];

const RESPONSIBLE_MAP = {
  Landlord: "landlord",
  Tenant: "tenant",
  Shared: "shared",
};

export default function AddLineItemModal({ show, onClose, onAdd, projectId }) {
  const dispatch = useDispatch();

  const [form, setForm] = useState({
    category: "",
    responsible: "Landlord",
    description: "",
    cost: "",
    phase: "",
    notes: "",
  });

  const [lineItems, setLineItems] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  if (!show) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddToList = () => {
    if (!form.category || !form.description) return;

    setLineItems((prev) => [
      ...prev,
      {
        category: form.category,
        description: form.description,
        responsible_party: RESPONSIBLE_MAP[form.responsible],
        estimated_cost: Number(form.cost || 0),
        timeline_phase: form.phase,
        status: "pending",
        notes: form.notes,
      },
    ]);

    setForm({
      category: "",
      responsible: "Landlord",
      description: "",
      cost: "",
      phase: "",
      notes: "",
    });
  };

  const handleSubmitBulk = async () => {
    if (!lineItems.length) return;

    try {
      setSubmitting(true);

      const resultAction = await dispatch(
        addLineItemsBulkApi({
          projectId,
          lineItems,
        }),
      ).unwrap();

      onAdd(resultAction?.line_items || []);

      setLineItems([]);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal fade show d-block" tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content rounded-4">
          <div className="modal-header">
            <div>
              <h5 className="modal-title fw-bold">Add Line Items</h5>
              <small className="text-muted">
                Add multiple cost items before submitting
              </small>
            </div>
            <button className="btn-close" onClick={onClose} />
          </div>

          <div className="modal-body">
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label fw-semibold">Category *</label>
                <select
                  className="form-select"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                >
                  <option value="">Select category</option>
                  {CATEGORIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">
                  Responsible Party *
                </label>
                <select
                  className="form-select"
                  name="responsible"
                  value={form.responsible}
                  onChange={handleChange}
                >
                  <option>Landlord</option>
                  <option>Tenant</option>
                  <option>Shared</option>
                </select>
              </div>

              <div className="col-12">
                <label className="form-label fw-semibold">Description *</label>
                <textarea
                  className="form-control"
                  rows="3"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">Estimated Cost</label>
                <input
                  type="number"
                  className="form-control"
                  name="cost"
                  value={form.cost}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">Timeline Phase</label>
                <select
                  className="form-select"
                  name="phase"
                  value={form.phase}
                  onChange={handleChange}
                >
                  <option value="">Select phase</option>
                  {PHASES.map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div className="col-12">
                <label className="form-label fw-semibold">Notes</label>
                <textarea
                  className="form-control"
                  rows="2"
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                />
              </div>
            </div>

            {lineItems.length > 0 && (
              <div className="mt-4">
                <h6 className="fw-bold">
                  Items to be added ({lineItems.length})
                </h6>
                <ul className="list-group">
                  {lineItems.map((item, idx) => (
                    <li key={idx} className="list-group-item">
                      <strong>{item.category}</strong> — {item.description}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button
              className="btn btn-outline-secondary"
              onClick={handleAddToList}
            >
              Add to List
            </button>

            <button
              className="btn btn-secondary"
              onClick={handleSubmitBulk}
              disabled={!lineItems.length || submitting}
            >
              {submitting ? <>Submitting...</> : `Submit`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
