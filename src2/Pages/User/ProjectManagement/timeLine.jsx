import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchTimelinePhasesApi,
  addTimelinePhaseApi,
  updateTimelinePhaseApi,
} from "../../../Networking/User/APIs/ProjectManagement/projectManagement";

export const TimelinePhaseSection = ({ projectId }) => {
  const dispatch = useDispatch();
  const { list, loading } = useSelector((s) => s.timelineSlice);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmPhase, setConfirmPhase] = useState(null);
  const [marking, setMarking] = useState(false);

  const [form, setForm] = useState({
    phase_name: "",
    order_index: "",
    start_date: "",
    end_date: "",
  });

  const PHASES = [
    "Phase 1 - Demo",
    "Phase 2 - Rough-In",
    "Phase 3 - Electrical/HVAC",
    "Phase 4 - Finishes",
  ];

  useEffect(() => {
    dispatch(fetchTimelinePhasesApi({ projectId }));
  }, [dispatch, projectId]);

  const resetForm = () => {
    setForm({
      phase_name: "",
      order_index: "",
      start_date: "",
      end_date: "",
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);

      const payload = {
        ...form,
        order_index: Number(form.order_index),
      };

      if (editingId) {
        await dispatch(
          updateTimelinePhaseApi({
            projectId,
            phaseId: editingId,
            payload,
          }),
        ).unwrap();
      } else {
        await dispatch(
          addTimelinePhaseApi({
            projectId,
            payload,
          }),
        ).unwrap();
      }

      resetForm();
    } finally {
      setSubmitting(false);
    }
  };

  const editPhase = (phase) => {
    setForm({
      phase_name: phase.phase_name,
      order_index: phase.order_index,
      start_date: phase.start_date,
      end_date: phase.end_date,
    });
    setEditingId(phase.id);
    setShowForm(true);
  };

  const handleMark = (phase) => {
    const confirmed = window.confirm(
      `Are you sure you want to mark "${phase.phase_name}" as completed?`,
    );

    if (!confirmed) return;

    markCompleted(phase);
  };

  const markCompleted = async (phase) => {
    try {
      setMarking(true);

      await dispatch(
        updateTimelinePhaseApi({
          projectId,
          phaseId: phase.id,
          payload: {
            phase_name: phase.phase_name,
            order_index: phase.order_index,
            start_date: phase.start_date,
            end_date: phase.end_date,
            is_completed: true,
          },
        }),
      ).unwrap();
    } finally {
      setMarking(false);
      setConfirmPhase(null);
    }
  };

  return (
    <div className="timeline-wrapper">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="fw-bold mb-0">Project Timeline</h5>
        <button
          className="btn btn-sm btn-secondary"
          onClick={() => setShowForm(true)}
          disabled={submitting}
        >
          + Add Phase
        </button>
      </div>

      {showForm && (
        <div className="card mb-4 shadow-sm">
          <div className="card-body row g-2">
            <div className="col-md-4">
              <select
                className="form-select"
                value={form.phase_name}
                onChange={(e) =>
                  setForm({ ...form, phase_name: e.target.value })
                }
              >
                <option value="" disabled>
                  Select phase
                </option>

                {PHASES.map((phase) => (
                  <option key={phase} value={phase}>
                    {phase}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-2">
              <input
                type="number"
                className="form-control"
                placeholder="Order"
                value={form.order_index}
                onChange={(e) =>
                  setForm({ ...form, order_index: e.target.value })
                }
              />
            </div>

            <div className="col-md-3">
              <input
                type="date"
                className="form-control"
                value={form.start_date}
                onChange={(e) =>
                  setForm({ ...form, start_date: e.target.value })
                }
              />
            </div>

            <div className="col-md-3">
              <input
                type="date"
                className="form-control"
                value={form.end_date}
                onChange={(e) => setForm({ ...form, end_date: e.target.value })}
              />
            </div>

            <div className="col-12 text-end">
              <button
                className="btn btn-sm btn-outline-secondary me-2"
                onClick={resetForm}
                disabled={submitting}
              >
                Cancel
              </button>

              <button
                className="btn btn-sm btn-success"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    {editingId ? "Updating..." : "Saving..."}
                  </>
                ) : editingId ? (
                  "Update"
                ) : (
                  "Save"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <ul className="timeline list-unstyled">
          {Array.from({ length: 3 }).map((_, i) => (
            <li key={i} className="timeline-item mb-3 d-flex">
              <div
                className="me-3 mt-2 placeholder-glow"
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                }}
              >
                <span className="placeholder col-12 rounded-circle"></span>
              </div>

              <div className="card shadow-sm w-100">
                <div className="card-body d-flex justify-content-between">
                  <div className="w-75 placeholder-glow">
                    <span className="placeholder col-6 mb-2 d-block"></span>
                    <span className="placeholder col-4 d-block"></span>
                  </div>

                  <div className="text-end placeholder-glow">
                    <span className="placeholder col-6 d-block mb-2"></span>

                    <div className="d-flex gap-2 justify-content-end">
                      <span
                        className="placeholder rounded-circle"
                        style={{ width: 32, height: 32 }}
                      ></span>
                      <span
                        className="placeholder rounded-circle"
                        style={{ width: 32, height: 32 }}
                      ></span>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : list.length === 0 ? (
        <p className="text-muted">No timeline phases added</p>
      ) : (
        <ul className="timeline list-unstyled">
          {[...list]
            .sort((a, b) => a.order_index - b.order_index)
            .map((phase) => (
              <li key={phase.id} className="timeline-item mb-3 d-flex">
                <div
                  className={`timeline-dot me-3 mt-2 ${
                    phase.is_completed ? "bg-success" : "bg-secondary"
                  }`}
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                  }}
                />

                <div className="timeline-content card shadow-sm w-100">
                  <div className="card-body d-flex justify-content-between">
                    <div>
                      <h6 className="fw-bold mb-1">{phase.phase_name}</h6>
                      <small className="text-muted">
                        {phase.start_date} → {phase.end_date}
                      </small>

                      {phase.completed_at && (
                        <div className="text-success small mt-1">
                          Completed on{" "}
                          {new Date(phase.completed_at).toLocaleDateString()}
                        </div>
                      )}
                    </div>

                    <div className="text-end">
                      <span
                        className={`badge mb-2 ${
                          phase.is_completed
                            ? "bg-success"
                            : "bg-warning text-dark"
                        }`}
                      >
                        {phase.is_completed ? "Completed" : "Pending"}
                      </span>

                      {!phase.is_completed && (
                        <div className="d-flex gap-2 mt-2">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => editPhase(phase)}
                            disabled={submitting}
                            title="Edit"
                          >
                            <i className="bi bi-pencil" />
                          </button>

                          <button
                            className="btn btn-sm btn-outline-success"
                            onClick={() => setConfirmPhase(phase)}
                            disabled={marking}
                            title="Mark Completed"
                          >
                            <i className="bi bi-check-lg" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            ))}
        </ul>
      )}
      {confirmPhase && (
        <div className="modal fade show d-block" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Completion</h5>
                <button
                  type="button"
                  className="btn-close"
                  disabled={marking}
                  onClick={() => setConfirmPhase(null)}
                />
              </div>

              <div className="modal-body">
                Are you sure you want to mark{" "}
                <strong>{confirmPhase.phase_name}</strong> as completed?
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  disabled={marking}
                  onClick={() => setConfirmPhase(null)}
                >
                  Cancel
                </button>

                <button
                  className="btn btn-success"
                  disabled={marking}
                  onClick={() => markCompleted(confirmPhase)}
                >
                  {marking ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Marking...
                    </>
                  ) : (
                    "Yes, Mark Completed"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
