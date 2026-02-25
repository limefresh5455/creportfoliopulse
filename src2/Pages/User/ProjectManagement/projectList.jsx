import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  createProjectApi,
  deleteProjectApi,
  getProjectsApi,
  getWorkLetterSummaryApi,
  updateProjectApi,
} from "../../../Networking/User/APIs/ProjectManagement/projectManagement";
import { BackButton } from "../../../Component/backButton";

export const ProjectList = () => {
  const location = useLocation();
  const office = location.state?.office;

  const buildingId =
    office?.buildingId ||
    new URLSearchParams(location.search).get("buildingId");

  const address =
    office?.address || new URLSearchParams(location.search).get("address");

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const initialFormState = {
    building: "",
    projectName: "",
    description: "",
    startDate: "",
    targetDate: "",
    status: "draft",
  };

  const [createForm, setCreateForm] = useState(initialFormState);
  const [editForm, setEditForm] = useState(initialFormState);
  const [pageLoading, setPageLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);

  const handleCreateChange = (e) => {
    const { name, value } = e.target;
    setCreateForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const [projects, setProjects] = useState([]);
  const [editProject, setEditProject] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deletingProjectId, setDeletingProjectId] = useState(null);
  const [deleteModal, setDeleteModal] = useState({
    show: false,
    projectId: null,
  });
  const [summary, setSummary] = useState(null);

  const openDeleteModal = (projectId) => {
    setDeleteModal({ show: true, projectId });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ show: false, projectId: null });
  };

  useEffect(() => {
    if (!buildingId) return;

    const fetchProjects = async () => {
      setPageLoading(true);
      try {
        const res = await dispatch(
          getProjectsApi({ buildingId, skip: 0, limit: 10 }),
        ).unwrap();
        const mappedProjects = res.map((item) => ({
          id: item.id,
          name: item.project_name,
          description: item.description,
          building: item.building_address,
          status: capitalize(item.status),
          landlordCost: `$${Number(item.total_landlord_cost).toLocaleString()}`,
          tenantCost: `$${Number(item.total_tenant_cost).toLocaleString()}`,
          startDate: formatDate(item.start_date),
          targetDate: formatDate(item.target_completion_date),
          startDateRaw: item.start_date,
          targetDateRaw: item.target_completion_date,
        }));
        setProjects(mappedProjects);
      } finally {
        setPageLoading(false);
      }
    };

    fetchProjects();
  }, [dispatch, buildingId]);

  const fetchSummary = async () => {
    try {
      const res = await dispatch(getWorkLetterSummaryApi()).unwrap();
      setSummary(res);
    } catch (err) {
      console.error("Failed to load summary", err);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [dispatch]);

  const handleCreateProject = async () => {
    setCreating(true);
    try {
      const res = await dispatch(
        createProjectApi({
          ...createForm,
          buildingId,
        }),
      ).unwrap();
      fetchSummary();
      setProjects((prev) => [
        {
          id: res.id,
          name: address,
          description: res.description,
          building: res.building_address,
          status: capitalize(res.status),
          landlordCost: `$${Number(res.total_landlord_cost).toLocaleString()}`,
          tenantCost: `$${Number(res.total_tenant_cost).toLocaleString()}`,
          startDate: formatDate(res.start_date),
          targetDate: formatDate(res.target_completion_date),
          startDateRaw: res.start_date,
          targetDateRaw: res.target_completion_date,
        },
        ...prev,
      ]);
      setShowCreateModal(false);
      setCreateForm(initialFormState);
    } finally {
      setCreating(false);
    }
  };

  const handleEditClick = (project) => {
    setEditProject(project);
    setEditForm({
      building: project.building,
      projectName: project.name,
      description: project.description || "",
      startDate: project.startDateRaw,
      targetDate: project.targetDateRaw,
      status: project.status.toLowerCase(),
    });
    setShowEditModal(true);
  };

  const handleUpdateProject = async () => {
    if (!editProject) return;

    setUpdating(true);
    try {
      const res = await dispatch(
        updateProjectApi({
          projectId: editProject.id,
          buildingId,
          ...editForm,
        }),
      ).unwrap();
      fetchSummary();
      setProjects((prev) =>
        prev.map((p) =>
          p.id === editProject.id
            ? { ...p, name: address, status: capitalize(res.status) }
            : p,
        ),
      );

      setShowEditModal(false);
      setEditProject(null);
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!deleteModal.projectId) return;

    setDeletingProjectId(deleteModal.projectId);
    try {
      await dispatch(deleteProjectApi(deleteModal.projectId)).unwrap();
      setProjects((prev) => prev.filter((p) => p.id !== deleteModal.projectId));
      fetchSummary();
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setDeletingProjectId(null);
      closeDeleteModal();
    }
  };

  return (
    <div className="container-fluid p-4 bg-light min-vh-100">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center align-items-md-center gap-3 mb-4">
        <div className="d-flex mx-3 mx-md-0">
          <BackButton />
          <div className="mx-2 text-center text-md-start">
            <h4 className="fw-bold mb-1">Work Letter Projects</h4>
            <p className="text-muted mb-0">
              Create and manage work letter projects linked to buildings
            </p>
          </div>
        </div>

        <div
          className="flex-shrink-0"
          style={{ minWidth: "200px", maxWidth: "25%" }}
        >
          <button
            className="btn btn-secondary w-100"
            onClick={() => setShowCreateModal(true)}
          >
            <i className="bi bi-plus-circle me-2"></i>
            Create Project
          </button>
        </div>
      </div>
      <hr />
      <div className="row g-3 mb-4">
        <StatCard
          title="Total Projects"
          value={summary?.total_projects}
          icon="bi-folder"
        />

        <StatCard
          title="Draft"
          value={summary?.draft_projects}
          icon="bi-file-earmark-text"
          color="secondary"
        />

        <StatCard
          title="In Progress"
          value={summary?.in_progress_projects}
          icon="bi-arrow-repeat"
          color="primary"
        />

        <StatCard
          title="Completed"
          value={summary?.completed_projects}
          icon="bi-check-circle"
          color="success"
        />

        <StatCard
          title="On Hold"
          value={summary?.on_hold_projects}
          icon="bi-pause-circle"
          color="warning"
        />

        <StatCard
          title="Total Value"
          value={formatCurrency(summary?.total_value)}
          icon="bi-currency-dollar"
          color="dark"
        />
      </div>
      <hr />

      {pageLoading && (
        <div className="row g-3">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div className="col-12 col-sm-6 col-lg-4" key={idx}>
              <div className="skeleton-card">
                <div className="mb-2 skeleton" style={{ width: "50%" }}></div>
                <div className="mb-2 skeleton" style={{ width: "80%" }}></div>
                <div className="mb-2 skeleton" style={{ width: "90%" }}></div>
                <div className="d-flex justify-content-between mt-auto">
                  <div
                    className="skeleton"
                    style={{ width: "40px", height: "16px" }}
                  ></div>
                  <div
                    className="skeleton"
                    style={{ width: "40px", height: "16px" }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="row g-3">
        {projects.map((project) => (
          <div className="col-12 col-sm-6 col-lg-4" key={project.id}>
            <div
              className="card border-0 shadow-sm h-100 rounded-4 cursor-pointer hover-shadow"
              onClick={() =>
                navigate("/work-letter", {
                  state: {
                    projectId: project.id,
                    projectStatus: project.status,
                  },
                })
              }
            >
              <div className="card-body">
                <div className="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-2">
                  <div className="d-flex">
                    <i className="bi bi-geo-alt-fill me-1"></i>
                    <h6 className="fw-bold mb-0">{address}</h6>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <StatusBadge status={project.status} />
                    <i
                      className="bi bi-pencil-square text-primary cursor-pointer"
                      title="Edit project"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditClick(project);
                      }}
                    />
                    <i
                      className="bi text-danger cursor-pointer"
                      title="Delete project"
                      onClick={(e) => {
                        e.stopPropagation();
                        openDeleteModal(project.id);
                      }}
                    >
                      {deletingProjectId === project.id ? (
                        <span className="spinner-border spinner-border-sm text-danger"></span>
                      ) : (
                        <i className="bi bi-trash"></i>
                      )}
                    </i>
                  </div>
                </div>

                <div className="d-flex flex-column flex-sm-row justify-content-between gap-2 mb-2">
                  <div>
                    <small className="text-muted">Landlord Cost</small>
                    <div className="fw-semibold text-success">
                      {project.landlordCost}
                    </div>
                  </div>
                  <div>
                    <small className="text-muted">Tenant Cost</small>
                    <div className="fw-semibold text-primary">
                      {project.tenantCost}
                    </div>
                  </div>
                </div>

                <hr />
                <div className="d-flex justify-content-between small text-muted">
                  <span>Start: {project.startDate}</span>
                  <span>Target: {project.targetDate}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showCreateModal && (
        <div className="modal fade show d-block" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered modal-lg modal-fullscreen-sm-down">
            <div className="modal-content rounded-4">
              <div className="modal-header">
                <div>
                  <h5 className="modal-title fw-bold">
                    Create Work Letter Project
                  </h5>
                  <small className="text-muted">
                    Create a new work letter project for a building
                  </small>
                </div>
                <button
                  className="btn-close"
                  onClick={() => setShowCreateModal(false)}
                />
              </div>

              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label fw-semibold">Building</label>
                  <input
                    type="text"
                    className="form-control bg-light"
                    value={address}
                    disabled
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    Project Name *
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="projectName"
                    value={createForm.projectName}
                    onChange={handleCreateChange}
                    placeholder="Enter project name"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Description</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    name="description"
                    value={createForm.description}
                    onChange={handleCreateChange}
                    placeholder="Enter description"
                  />
                </div>

                <div className="row g-3">
                  <div className="col">
                    <label className="form-label fw-semibold">Start Date</label>
                    <input
                      type="date"
                      className="form-control"
                      name="startDate"
                      value={createForm.startDate}
                      onChange={handleCreateChange}
                    />
                  </div>

                  <div className="col">
                    <label className="form-label fw-semibold">
                      Target Completion
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      name="targetDate"
                      value={createForm.targetDate}
                      onChange={handleCreateChange}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>

                <button
                  className="btn btn-secondary"
                  onClick={handleCreateProject}
                  disabled={!createForm.projectName || creating}
                >
                  {creating ? <>Submiting...</> : "Submit"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="modal fade show d-block" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered modal-lg modal-fullscreen-sm-down">
            <div className="modal-content rounded-4">
              <div className="modal-header">
                <div>
                  <h5 className="modal-title fw-bold">
                    Edit Work Letter Project
                  </h5>
                  <small className="text-muted">
                    Update the work letter project details
                  </small>
                </div>
                <button
                  className="btn-close"
                  onClick={() => setShowEditModal(false)}
                />
              </div>

              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label fw-semibold">Building</label>
                  <input
                    type="text"
                    className="form-control bg-light"
                    value={address}
                    disabled
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    Project Name *
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="projectName"
                    value={editForm.projectName}
                    onChange={handleEditChange}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Description</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    name="description"
                    value={editForm.description}
                    onChange={handleEditChange}
                  />
                </div>

                <div className="row g-3 mb-3">
                  <div className="col">
                    <label className="form-label fw-semibold">Start Date</label>
                    <input
                      type="date"
                      className="form-control"
                      name="startDate"
                      value={editForm.startDate}
                      onChange={handleEditChange}
                    />
                  </div>

                  <div className="col">
                    <label className="form-label fw-semibold">
                      Target Completion
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      name="targetDate"
                      value={editForm.targetDate}
                      onChange={handleEditChange}
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Status</label>
                  <select
                    className="form-select"
                    name="status"
                    value={editForm.status}
                    onChange={handleEditChange}
                  >
                    <option value="draft">Draft</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="on_hold">On Hold</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={handleUpdateProject}
                  disabled={!editForm.projectName || updating}
                >
                  {updating ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Updating...
                    </>
                  ) : (
                    "Update"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {deleteModal.show && (
        <div className="modal fade show d-block" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Confirm Delete</h5>
                <button
                  className="btn-close"
                  onClick={closeDeleteModal}
                ></button>
              </div>
              <div className="modal-body">
                Are you sure you want to delete this project?
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-outline-secondary"
                  onClick={closeDeleteModal}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-danger"
                  onClick={handleDeleteProject}
                  disabled={deletingProjectId !== null}
                >
                  {deletingProjectId !== null ? (
                    <span className="spinner-border spinner-border-sm text-light"></span>
                  ) : (
                    "Delete"
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

const StatCard = ({ title, value, icon, color = "primary" }) => (
  <div className="col-6 col-sm-4 col-md-3 col-lg-2">
    <div className="card border-0 shadow-sm rounded-4 h-100">
      <div className="card-body d-flex flex-column align-items-center justify-content-center text-center gap-2">
        <div
          className={`bg-${color} bg-opacity-10 text-${color} rounded-circle d-flex align-items-center justify-content-center`}
          style={{ width: 42, height: 42 }}
        >
          <i className={`bi ${icon} fs-5`} />
        </div>

        <small className="text-muted">{title}</small>

        <div className="fw-bold fs-6">{value ?? "-"}</div>
      </div>
    </div>
  </div>
);

const StatusBadge = ({ status }) => {
  const map = {
    Draft: "secondary",
    Active: "primary",
    Completed: "success",
    "On Hold": "warning",
  };

  return (
    <span className={`badge bg-${map[status] || "secondary"}`}>{status}</span>
  );
};

const formatDate = (date) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("en-US");
};

const capitalize = (text) =>
  text ? text.charAt(0).toUpperCase() + text.slice(1) : "";

const formatCurrency = (value) => {
  if (!value) return "$0";
  return `$${Number(value).toLocaleString()}`;
};
