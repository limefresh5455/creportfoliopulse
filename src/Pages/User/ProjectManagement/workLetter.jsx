import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import AddLineItemModal from "./addLineItemModal";
import {
  deleteLineItemApi,
  fetchCostAnalysisApi,
  fetchLineItemsApi,
  updateLineItemApi,
} from "../../../Networking/User/APIs/ProjectManagement/projectManagement";
import { DocumentList } from "./documentList";
import { WorkLetterChat } from "./workLetterChat";
import { TimelinePhaseSection } from "./timeLine";
import { BackButton } from "../../../Component/backButton";

export const WorkLetter = () => {
  const location = useLocation();
  const dispatch = useDispatch();

  const projectId = location?.state?.projectId;
  const projectStatus = location?.state?.projectStatus;
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [costAnalysis, setCostAnalysis] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState("line_items");

  const { lineItems, loading } = useSelector((state) => state.lineItemSlice);

  const fetchData = async () => {
    if (!projectId) return;

    try {
      const [, costRes] = await Promise.all([
        dispatch(fetchLineItemsApi({ projectId })),
        dispatch(fetchCostAnalysisApi({ projectId })).unwrap(),
      ]);

      setCostAnalysis(costRes);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [dispatch, projectId, showAddModal]);

  const handleTimelineUpdate = async (form) => {
    try {
      setUpdating(true);

      await dispatch(
        updateLineItemApi({
          projectId,
          lineItemId: editItem.id,
          payload: {
            ...form,
            estimated_cost: Number(form.estimated_cost),
            landlord_cost: Number(form.landlord_cost),
            tenant_cost: Number(form.tenant_cost),
            actual_cost: form.actual_cost ? Number(form.actual_cost) : null,
          },
        }),
      ).unwrap();

      await fetchData();
      setEditItem(null);
    } catch (err) {
      console.error("Update failed", err);
    } finally {
      setUpdating(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      setDeletingId(deleteTarget.id);

      await dispatch(
        deleteLineItemApi({
          projectId,
          lineItemId: deleteTarget.id,
        }),
      ).unwrap();

      await fetchData();
      setDeleteTarget(null);
    } catch (err) {
      console.error("Delete failed", err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteLineItem = async (itemId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this line item?",
    );

    if (!confirmed) return;

    try {
      setDeletingId(itemId);

      await dispatch(
        deleteLineItemApi({
          projectId,
          lineItemId: itemId,
        }),
      ).unwrap();

      await fetchData();
    } catch (err) {
      console.error("Delete failed", err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="work-letter container-fluid p-4">
      <div className="d-flex justify-content-between align-items-start mb-4 p-3 rounded bg-white shadow-sm border">
        <div className="d-flex mx-0 mx-md-0">
          <BackButton />

          <div className="align-items-center text-muted small">
            <h4 className="fw-semibold mb-1 mx-2">6th Floor Work Letter</h4>
            <i className="bi bi-geo-alt-fill me-1"></i>
            <span>260 Fifth Avenue, New York, NY</span>
          </div>
        </div>

        <span className="badge rounded-pill bg-warning-subtle text-warning border border-warning">
          {projectStatus}
        </span>
      </div>

      <div className="row g-3 mb-4">
        <SummaryCard
          title="Landlord Cost"
          value={formatCurrency(costAnalysis?.total_landlord_cost)}
          color="text-success"
        />
        <SummaryCard
          title="Tenant Cost"
          value={formatCurrency(costAnalysis?.total_tenant_cost)}
          color="text-primary"
        />
        <SummaryCard
          title="Total Project Cost"
          value={formatCurrency(costAnalysis?.total_project_cost)}
          sub={`${lineItems.length} line items`}
        />
        <SummaryCard
          title="Responsibility Split"
          value="Landlord / Tenant"
          sub={`${formatCurrency(costAnalysis?.cost_by_responsibility?.landlord)} / ${formatCurrency(costAnalysis?.cost_by_responsibility?.tenant)}`}
        />
      </div>

      <div className="tabs-wrapper mb-3">
        <Tab
          label={`Line Items (${lineItems.length})`}
          active={activeTab === "line_items"}
          onClick={() => setActiveTab("line_items")}
        />
        <Tab
          label="Documents"
          active={activeTab === "documents"}
          onClick={() => setActiveTab("documents")}
        />
        <Tab
          label="Timeline"
          active={activeTab === "timeline"}
          onClick={() => setActiveTab("timeline")}
        />
        <Tab
          label="AI Assistant"
          active={activeTab === "ai"}
          onClick={() => setActiveTab("ai")}
        />
      </div>

      {activeTab === "line_items" && (
        <>
          <div className="d-flex gap-2 mb-3">
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setShowAddModal(true)}
            >
              + Add Line Item
            </button>
          </div>

          <div className="table-responsive">
            <table className="table align-middle">
              <thead className="table-light">
                <tr className="text-start">
                  <th>Category</th>
                  <th>Description</th>
                  <th>Responsible</th>
                  <th>Phase</th>
                  <th>Status</th>
                  <th>Est. Cost</th>
                  <th>Landlord</th>
                  <th>Tenant</th>
                  <th>Action</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {loading &&
                  Array.from({ length: 6 }).map((_, rowIndex) => (
                    <tr key={rowIndex}>
                      {Array.from({ length: 9 }).map((_, colIndex) => (
                        <td key={colIndex}>
                          <div className="placeholder-glow w-100">
                            <span
                              className="placeholder col-12 rounded"
                              style={{ height: "14px" }}
                            />
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}

                {!loading &&
                  [...lineItems]
                    .reverse()
                    .map((item) => (
                      <TableRow
                        key={item.id}
                        item={item}
                        onEdit={() => setEditItem(item)}
                        onDelete={() => setDeleteTarget(item)}
                        deleting={deletingId === item.id}
                      />
                    ))}
              </tbody>
            </table>
          </div>
          {deleteTarget && (
            <div
              className="modal show d-block"
              style={{ background: "rgba(0,0,0,.4)" }}
            >
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content rounded-4">
                  <div className="modal-header border-bottom-1">
                    <h5 className="modal-title text-dark">Delete Line Item</h5>
                    <button
                      className="btn-close"
                      onClick={() => setDeleteTarget(null)}
                    />
                  </div>

                  <div className="modal-body text-start">
                    <p className="mb-0">
                      Are you sure you want to delete this line item?
                    </p>
                  </div>

                  <div className="modal-footer border-0 justify-content-end gap-2">
                    <button
                      className="btn btn-outline-secondary"
                      onClick={() => setDeleteTarget(null)}
                      disabled={deletingId}
                    >
                      Cancel
                    </button>

                    <button
                      className="btn btn-danger"
                      onClick={confirmDelete}
                      disabled={deletingId}
                    >
                      {deletingId ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" />
                          Deleting...
                        </>
                      ) : (
                        "Yes, Delete"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === "documents" && (
        <div className="text-muted">
          <DocumentList projectId={projectId} />
        </div>
      )}

      {activeTab === "timeline" && (
        <TimelinePhaseSection projectId={projectId} />
      )}

      {activeTab === "ai" && <WorkLetterChat projectId={projectId} />}

      <AddLineItemModal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        projectId={projectId}
        onAdd={(items) => {
          dispatch(fetchLineItemsApi({ projectId }));
        }}
      />

      <EditTimelineModal
        show={!!editItem}
        item={editItem}
        onClose={() => setEditItem(null)}
        onSave={handleTimelineUpdate}
        loading={updating}
      />
    </div>
  );
};

const EditTimelineModal = ({ show, item, onClose, onSave, loading }) => {
  const [form, setForm] = useState({
    category: "",
    description: "",
    responsible_party: "",
    estimated_cost: "",
    landlord_cost: "",
    tenant_cost: "",
    actual_cost: "",
    timeline_phase: "",
    status: "",
    notes: "",
  });

  useEffect(() => {
    if (!item) return;

    setForm({
      category: item.category || "",
      description: item.description || "",
      responsible_party: item.responsible_party || "",
      estimated_cost: item.estimated_cost || "",
      landlord_cost: item.landlord_cost || "",
      tenant_cost: item.tenant_cost || "",
      actual_cost: item.actual_cost || "",
      timeline_phase: item.timeline_phase || "",
      status: item.status || "",
      notes: item.notes || "",
    });
  }, [item]);

  if (!show) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = () => {
    onSave(form);
  };

  return (
    <div className="modal show d-block">
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Edit Line Item</h5>
            <button className="btn-close" onClick={onClose} />
          </div>

          <div className="modal-body">
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Category</label>
                <input
                  className="form-control"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Responsible Party</label>
                <select
                  className="form-select"
                  name="responsible_party"
                  value={form.responsible_party}
                  onChange={handleChange}
                >
                  <option value="">Select</option>
                  <option value="landlord">Landlord</option>
                  <option value="tenant">Tenant</option>
                  <option value="shared">Shared</option>
                </select>
              </div>

              <div className="col-12">
                <label className="form-label">Description</label>
                <textarea
                  className="form-control"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">Estimated Cost</label>
                <input
                  type="number"
                  className="form-control"
                  name="estimated_cost"
                  value={form.estimated_cost}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">Landlord Cost</label>
                <input
                  type="number"
                  className="form-control"
                  name="landlord_cost"
                  value={form.landlord_cost}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">Tenant Cost</label>
                <input
                  type="number"
                  className="form-control"
                  name="tenant_cost"
                  value={form.tenant_cost}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">Actual Cost</label>
                <input
                  type="number"
                  className="form-control"
                  name="actual_cost"
                  value={form.actual_cost || ""}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">Timeline Phase</label>
                <select
                  className="form-select"
                  name="timeline_phase"
                  value={form.timeline_phase}
                  onChange={handleChange}
                >
                  <option>Pre-Construction</option>
                  <option>Phase 1 - Demo</option>
                  <option>Phase 2 - Rough-In</option>
                  <option>Phase 3 - Finishes</option>
                </select>
              </div>

              <div className="col-md-4">
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div className="col-12">
                <label className="form-label">Notes</label>
                <textarea
                  className="form-control"
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button className="btn btn-outline-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              className="btn btn-secondary"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? <>Updating...</> : "Update"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const TableRow = ({ item, onEdit, onDelete, deleting }) => (
  <tr className="text-start">
    <td>{item.category}</td>
    <td>{item.description}</td>
    <td>
      <span className={`text-dark badge role-${item.responsible_party}`}>
        {capitalize(item.responsible_party)}
      </span>
    </td>
    <td>{item.timeline_phase}</td>
    <td>
      <span className={`status-pill status-${item.status}`}>
        {capitalize(item.status)}
      </span>
    </td>
    <td>{formatCurrency(item.estimated_cost)}</td>
    <td className="text-success">{formatCurrency(item.landlord_cost)}</td>
    <td className="text-primary">{formatCurrency(item.tenant_cost)}</td>

    <td>
      <i
        className={`bi bi-pencil me-2 cursor ${deleting ? "text-muted" : ""}`}
        onClick={!deleting ? onEdit : undefined}
      />

      {deleting ? (
        <span
          className="spinner-border spinner-border-sm text-danger"
          role="status"
        />
      ) : (
        <i className="bi bi-trash text-danger cursor" onClick={onDelete} />
      )}
    </td>
  </tr>
);

const SummaryCard = ({
  title,
  value,
  sub,
  valueColor = "text-dark",
  progress,
  onClick,
}) => (
  <div className="col-md-3">
    <div
      className="card summary-tile h-100"
      onClick={onClick}
      role={onClick ? "button" : undefined}
    >
      <div className="card-body">
        <small className="text-muted fw-medium">{title}</small>

        <div className={`fw-bold fs-5 mt-1 ${valueColor}`}>{value}</div>

        {progress !== undefined && (
          <div className="progress progress-sm mt-2">
            <div className="progress-bar" style={{ width: `${progress}%` }} />
          </div>
        )}

        {sub && <small className="text-muted d-block mt-2">{sub}</small>}
      </div>
    </div>
  </div>
);

const Tab = ({ label, active, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`
      tab-btn
      ${active ? "tab-active fw-semibold" : "text-muted"}
    `}
  >
    {label}
  </button>
);

const formatCurrency = (val) =>
  val ? `$${Number(val).toLocaleString()}` : "-";

const capitalize = (t = "") => t.charAt(0).toUpperCase() + t.slice(1);
