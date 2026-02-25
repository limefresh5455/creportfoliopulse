import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import {
  getadminfeedbacksubmit,
  getuserfeedbacksubmit,
} from "../../../Networking/Admin/APIs/feedbackApi";
import { Container, Modal, Button, Table, Form } from "react-bootstrap";
import RAGLoader from "../../../Component/Loader";
import Pagination from "../../../Component/pagination";
import { toast } from "react-toastify";
import {
  DeleteFeedbackSubmit,
  ReviewInformationCollaboration,
} from "../../../Networking/User/APIs/Feedback/feedbackApi";
import { EditInformationCollaboration } from "../../User/UserInformationCollaboration/editInformationCollaboration";

export const AdminInformationCollaboration = () => {
  const dispatch = useDispatch();

  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(null);
  const [editModal, setEditModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [editLoading, setEditLoading] = useState(false);

  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const [viewModal, setViewModal] = useState(false);

  const [reviewModal, setReviewModal] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewDecision, setReviewDecision] = useState(null);

  const [updatingStatusId, setUpdatingStatusId] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const fetchSubmissions = async () => {
    try {
      const data = await dispatch(getadminfeedbacksubmit()).unwrap();
      setSubmissions(data.entries);
      setRole(data.current_user_role);
    } catch (error) {
      console.error("Error fetching submissions:", error);
      // toast.error("Failed to load submissions");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchSubmissions();
  }, [dispatch]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentSubmissions = submissions
    .slice()
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(indexOfFirstItem, indexOfLastItem);

  const openEditModal = (submission) => {
    setSelectedSubmission({ ...submission });
    setEditModal(true);
  };

  const openViewModal = (submission) => {
    setSelectedSubmission(submission);
    setViewModal(true);
  };

  const openDeleteModal = (id) => setDeleteId(id);

  const openReviewModal = (submission) => {
    setSelectedSubmission(submission);
    setReviewDecision(null);
    setReviewModal(true);
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await dispatch(DeleteFeedbackSubmit(deleteId)).unwrap();
      setSubmissions((prev) => prev.filter((item) => item.id !== deleteId));
      toast.success("Deleted successfully");
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Delete failed");
    } finally {
      setDeleteLoading(false);
      setDeleteId(null);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    if (updatingStatusId) return;
    setUpdatingStatusId(id);
    try {
      const updated = await dispatch(
        ReviewInformationCollaboration({
          id,
          decision: newStatus,
        }),
      ).unwrap();
      fetchSubmissions();
      setSubmissions((prev) =>
        prev.map((item) =>
          item.id === updated.id ? { ...item, ...updated } : item,
        ),
      );
      toast.success(`Status updated to ${newStatus}`);
    } catch (err) {
      console.error("Status update error:", err);
      // toast.error("Failed to update status");
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const handleReview = async () => {
    if (!selectedSubmission || !reviewDecision) return;
    setReviewLoading(true);
    try {
      const updated = await dispatch(
        ReviewInformationCollaboration({
          id: selectedSubmission.id,
          decision: reviewDecision,
        }),
      ).unwrap();

      setSubmissions((prev) =>
        prev.map((item) =>
          item.id === updated.id ? { ...item, ...updated } : item,
        ),
      );
      toast.success(`Submission ${reviewDecision} successfully`);
      setReviewModal(false);
    } catch (err) {
      console.error("Review error:", err);
      // toast.error("Failed to update status");
    } finally {
      setReviewLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "approved":
        return "bg-success";
      case "pending":
        return "bg-warning text-dark";
      case "rejected":
        return "bg-danger";
      default:
        return "bg-secondary";
    }
  };

  if (loading) {
    return (
      <div
        className="d-flex p-1 justify-content-center align-items-center"
        style={{ height: "50vh" }}
      >
        <RAGLoader />
      </div>
    );
  }

  return (
    <div className="collab-wrapper p-3">
      {submissions.length === 0 ? (
        <div className="text-center py-5 empty-state">
          <h5 className="">No submissions found</h5>
          <p className="text-secondary">
            Users have not submitted any tenant information yet.
          </p>
        </div>
      ) : (
        <>
          <div className="table-responsive collab-table-scroll">
            <table className="table table-hover align-middle collab-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>User ID</th>
                  <th>Category</th>
                  <th>Tenant Details</th>
                  <th>Submitted</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentSubmissions.map((item, index) => (
                  <tr key={item.id}>
                    <td>{indexOfFirstItem + index + 1}</td>
                    <td>{item.user_id}</td>
                    <td>{item.category}</td>
                    <td>
                      <div>
                        <strong>{item.form_data?.tenant_name}</strong>
                      </div>
                      <div className="small">
                        Rent: ₹{item.form_data?.rent?.toLocaleString()} | Floor:{" "}
                        {item.form_data?.floor} | Area:{" "}
                        {item.form_data?.area_sqft} sq.ft
                      </div>
                      <div className="small text-muted">
                        Lease: {item.form_data?.lease_start} –{" "}
                        {item.form_data?.lease_end}
                      </div>
                    </td>
                    <td>
                      {new Date(item.created_at).toLocaleDateString("en-US", {
                        month: "2-digit",
                        day: "2-digit",
                        year: "2-digit",
                      })}
                    </td>
                    <td>
                      <div style={{ minWidth: "120px" }}>
                        {updatingStatusId === item.id ? (
                          <div className="d-flex justify-content-center align-items-center">
                            updating...
                          </div>
                        ) : (
                          <Form.Select
                            size="sm"
                            value={item.status}
                            disabled={role !== "admin"}
                            onChange={(e) =>
                              handleStatusChange(item.id, e.target.value)
                            }
                            className={`border-0 rounded-pill fw-semibold text-center ${getStatusBadge(
                              item.status
                            )}`}
                            style={{ cursor: role === "admin" ? "pointer" : "not-allowed" }}
                          >
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                          </Form.Select>
                        )}
                      </div>
                    </td>
                    <td className="text-end">
                      <div className="d-flex justify-content-end align-items-center gap-2">
                        <button
                          className="icon-btn view-btn"
                          title="View"
                          onClick={() => openViewModal(item)}
                        >
                          <i className="bi bi-eye"></i>
                        </button>
                        {role == "admin" && (
                          <>
                            <button
                              className="icon-btn edit-btn"
                              title="Edit"
                              onClick={() => openEditModal(item)}
                            >
                              <i className="bi bi-pencil"></i>
                            </button>

                            <button
                              className="icon-btn delete-btn"
                              title="Delete"
                              onClick={() => openDeleteModal(item.id)}
                              disabled={deleteLoading && deleteId === item.id}
                            >
                              {deleteLoading && deleteId === item.id ? (
                                <span className="spinner-border spinner-border-sm"></span>
                              ) : (
                                <i className="bi bi-trash-fill"></i>
                              )}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            totalItems={submissions.length}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={(value) => {
              setItemsPerPage(value);
              setCurrentPage(1);
            }}
          />
        </>
      )}

      <Modal
        className="modal_wrapper"
        show={viewModal}
        onHide={() => setViewModal(false)}
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Tenant Information Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedSubmission && (
            <>
              <p>
                <strong>ID:</strong> {selectedSubmission.id}
              </p>
              <p>
                <strong>User ID:</strong> {selectedSubmission.user_id}
              </p>
              <p>
                <strong>Category:</strong> {selectedSubmission.category}
              </p>
              <p>
                <strong>Building ID:</strong> {selectedSubmission.building_id}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                <span
                  className={`badge ${getStatusBadge(
                    selectedSubmission.status,
                  )}`}
                >
                  {selectedSubmission.status}
                </span>
              </p>
              <p>
                <strong>Submitted:</strong>{" "}
                {new Date(selectedSubmission.created_at).toLocaleString()}
              </p>
              {selectedSubmission.reviewed_by && (
                <p>
                  <strong>Reviewed by:</strong> {selectedSubmission.reviewed_by}{" "}
                  at {new Date(selectedSubmission.reviewed_at).toLocaleString()}
                </p>
              )}
              <hr />
              <h6>Tenant Information</h6>
              <div className="border rounded p-3 bg-light">
                <p className="text-dark">
                  <strong>Tenant Name:</strong>{" "}
                  {selectedSubmission.form_data?.tenant_name}
                </p>
                <p className="text-dark">
                  <strong>Lease Period:</strong>{" "}
                  {selectedSubmission.form_data?.lease_start} to{" "}
                  {selectedSubmission.form_data?.lease_end}
                </p>
                <p className="text-dark">
                  <strong>Monthly Rent:</strong> ₹
                  {selectedSubmission.form_data?.rent?.toLocaleString()}
                </p>
                <p className="text-dark">
                  <strong>Floor:</strong> {selectedSubmission.form_data?.floor}
                </p>
                <p className="text-dark">
                  <strong>Area:</strong>{" "}
                  {selectedSubmission.form_data?.area_sqft} sq.ft
                </p>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setViewModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        className="modal_wrapper"
        show={editModal}
        onHide={() => setEditModal(false)}
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Edit Tenant Information</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedSubmission && (
            <EditInformationCollaboration
              key={selectedSubmission.id}
              data={selectedSubmission}
              onClose={() => setEditModal(false)}
            />
          )}
        </Modal.Body>
      </Modal>

      <Modal
        className="modal_wrapper"
        show={!!deleteId}
        onHide={() => setDeleteId(null)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this tenant information submission?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setDeleteId(null)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            disabled={deleteLoading}
          >
            {deleteLoading ? "Deleting..." : "Delete"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};
