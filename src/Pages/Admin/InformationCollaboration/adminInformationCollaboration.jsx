import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import {
  getadminfeedbacksubmit,
  getuserfeedbacksubmit,
} from "../../../Networking/Admin/APIs/feedbackApi";
import { Container, Modal, Button, Table } from "react-bootstrap";
import RAGLoader from "../../../Component/Loader";
import Pagination from "../../../Component/pagination";
import {
  DeleteFeedbackSubmit,
  UpdateFeedback,
} from "../../../Networking/User/APIs/Feedback/feedbackApi";
import { toast } from "react-toastify";

export const AdminInformationCollaboration = () => {
  const dispatch = useDispatch();

  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editModal, setEditModal] = useState(false);
  const [editText, setEditText] = useState("");
  const [editId, setEditId] = useState(null);
  const [editLoading, setEditLoading] = useState(false);

  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const [viewModal, setViewModal] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const role = sessionStorage.getItem("role");
        if (role === "admin") {
          const data = await dispatch(getadminfeedbacksubmit()).unwrap();
          setFeedbacks(data.reverse());
        } else if (role === "user") {
          const data = await dispatch(getuserfeedbacksubmit()).unwrap();
          setFeedbacks(data.reverse());
        }
      } catch (error) {
        console.error("Error fetching feedback:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeedback();
  }, [dispatch]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentFeedbacks = feedbacks
    .slice(indexOfFirstItem, indexOfLastItem)
    .reverse();

  const openEditModal = (feedback) => {
    setEditId(feedback.id);
    setEditText(feedback.feedback);
    setEditModal(true);
  };

  const handleEdit = async () => {
    if (!editText.trim()) {
      toast.error("Collaboration cannot be empty");
      return;
    }

    setEditLoading(true);
    try {
      await dispatch(
        UpdateFeedback({ feedback_id: editId, feedback: editText }),
      ).unwrap();
      setFeedbacks((prev) =>
        prev.map((item) =>
          item.id === editId ? { ...item, feedback: editText } : item,
        ),
      );
      toast.success("Updated successfully!");
      setEditModal(false);
    } catch (err) {
      toast.error(err || "Update failed");
    } finally {
      setEditLoading(false);
    }
  };

  const openViewModal = (feedback) => {
    setSelectedFeedback(feedback);
    setViewModal(true);
  };

  const openDeleteModal = (id) => setDeleteId(id);

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await dispatch(DeleteFeedbackSubmit(deleteId)).unwrap();
      setFeedbacks((prev) => prev.filter((item) => item.id !== deleteId));
    } catch (err) {
      console.error("Delete error:", err);
    } finally {
      setDeleteLoading(false);
      setDeleteId(null);
    }
  };

  const handleDownload = (fileUrl, fileName) => {
    if (!fileUrl) {
      toast.error("No file available for download");
      return;
    }

    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = fileName || "file";
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
    <div>
      <Container
        fluid
        className="p-4 shadow-sm"
        style={{ background: "#f5f7fa", borderRadius: "8px" }}
      >
        {feedbacks.length === 0 ? (
          <div className="text-center py-5">
            <h5>Not found</h5>
            <p className="text-muted">
              Users have not submitted any Collaboration yet.
            </p>
          </div>
        ) : (
          <>
            <div className="table-responsive mt-3" style={{ height: "400px" }}>
              <Table className="align-middle">
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>User Name</th>
                    <th>User Email</th>
                    <th>Category</th>
                    <th>Collaboration</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentFeedbacks.map((fb, index) => (
                    <tr key={fb.id}>
                      <td>{indexOfFirstItem + index + 1}</td>
                      <td>{fb.user_name || "N/A"}</td>
                      <td>{fb.user_email || "N/A"}</td>
                      <td>{fb.category || "N/A"}</td>
                      <td>
                        {fb.feedback.length > 15
                          ? fb.feedback.substring(0, 15) + "..."
                          : fb.feedback}
                      </td>
                      <td>
                        {new Date(fb.created_at).toLocaleDateString("en-US", {
                          month: "2-digit",
                          day: "2-digit",
                          year: "2-digit",
                        })}
                      </td>
                      <td>
                        <div className="d-flex flex-nowrap gap-2 overflow-auto">
                          <button
                            className="btn btn-sm text-white d-flex align-items-center justify-content-center"
                            style={{
                              backgroundColor: "#217ae6",
                              borderColor: "#217ae6",
                              padding: "4px 12px",
                              whiteSpace: "nowrap",
                            }}
                            onClick={() => openViewModal(fb)}
                          >
                            <i className="bi bi-eye"></i>
                          </button>

                          <button
                            className="btn btn-sm btn-warning text-white d-flex align-items-center justify-content-center"
                            style={{
                              padding: "4px 12px",
                              whiteSpace: "nowrap",
                            }}
                            onClick={() => openEditModal(fb)}
                          >
                            <i className="bi bi-pencil-square"></i>
                          </button>

                          <button
                            className="btn btn-sm btn-outline-secondary d-flex align-items-center justify-content-center"
                            style={{
                              backgroundColor: "#e62721",
                              borderColor: "#e62721",
                              padding: "4px 12px",
                              whiteSpace: "nowrap",
                            }}
                            onClick={() => openDeleteModal(fb.id)}
                            disabled={deleteLoading && deleteId === fb.id}
                          >
                            {deleteLoading && deleteId === fb.id ? (
                              <span className="spinner-border spinner-border-sm"></span>
                            ) : (
                              <i className="bi bi-trash text-light"></i>
                            )}
                          </button>

                          {fb.file_url ? (
                            <button
                              className="btn btn-sm btn-outline-secondary d-flex align-items-center justify-content-center"
                              style={{
                                padding: "4px 12px",
                                whiteSpace: "nowrap",
                              }}
                              title={
                                fb.file_url
                                  ? "Download file"
                                  : "No file available"
                              }
                              onClick={() =>
                                handleDownload(fb.file_url, fb.file_name)
                              }
                              disabled={!fb.file_url}
                            >
                              <i className="bi bi-download"></i>
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>

            <Pagination
              totalItems={feedbacks.length}
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
      </Container>

      <Modal
        show={editModal}
        onHide={() => !editLoading && setEditModal(false)}
        centered
      >
        <Modal.Header closeButton={!editLoading}>
          <Modal.Title>Edit Collaboration</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <textarea
            className="form-control"
            rows="5"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            disabled={editLoading}
            onClick={() => setEditModal(false)}
          >
            Cancel
          </Button>
          <Button variant="primary" disabled={editLoading} onClick={handleEdit}>
            {editLoading ? "Updating..." : "Save Changes"}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={viewModal}
        onHide={() => setViewModal(false)}
        centered
        size="md"
      >
        <Modal.Header closeButton>
          <Modal.Title className="fw-semibold">
            Collaboration Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedFeedback && (
            <>
              <p>
                <strong>Collaboration:</strong>
              </p>
              <p className="text-muted">{selectedFeedback.feedback}</p>
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
        show={!!deleteId}
        centered
        onHide={() => !deleteLoading && setDeleteId(null)}
      >
        <Modal.Header closeButton={!deleteLoading}>
          <Modal.Title>Delete Collaboration?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {deleteLoading ? (
            <div className="text-center py-2">
              <div className="spinner-border text-danger"></div>
              <p className="mt-2">Deleting...</p>
            </div>
          ) : (
            "Are you sure you want to permanently delete this Collaboration?"
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setDeleteId(null)}
            disabled={deleteLoading}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            disabled={deleteLoading}
          >
            {deleteLoading ? "Deleting..." : "Yes, Delete"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};
