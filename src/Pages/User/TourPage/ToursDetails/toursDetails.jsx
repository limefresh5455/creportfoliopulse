import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Container, Modal, Button, Table } from "react-bootstrap";
import {
  DeleteToursSubmit,
  GeToursList,
  UpdateToursSubmit,
} from "../../../../Networking/User/APIs/Tours/toursApi";
import { toast } from "react-toastify";
import RAGLoader from "../../../../Component/Loader";

export const ToursDetails = () => {
  const dispatch = useDispatch();

  const [toursList, setToursList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editModal, setEditModal] = useState(false);
  const [editTourId, setEditTourId] = useState(null);
  const [editForm, setEditForm] = useState({
    date: "",
    building: "",
    floor_suite: "",
    tenant: "",
    broker: "",
    notes: "",
  });
  const [updateLoading, setUpdateLoading] = useState(false);

  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const [viewModal, setViewModal] = useState(false);
  const [selectedTour, setSelectedTour] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await dispatch(GeToursList()).unwrap();
        setToursList(result || []);
      } catch (error) {
        console.error("Error loading tours:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [dispatch]);

  const openViewModal = (tour) => {
    setSelectedTour(tour);
    setViewModal(true);
  };

  const openDeleteModal = (id) => {
    setDeleteId(id);
  };

  const handleEdit = (tour) => {
    setEditTourId(tour.id);
    setEditForm({
      date: tour.date || "",
      building: tour.building || "",
      floor_suite: tour.floor_suite || "",
      tenant: tour.tenant || "",
      broker: tour.broker || "",
      notes: tour.notes || "",
    });
    setEditModal(true);
  };

  const handleUpdate = async () => {
    setUpdateLoading(true);

    try {
      const payload = {
        ...editForm,
      };

      await dispatch(UpdateToursSubmit({ id: editTourId, payload })).unwrap();

      setToursList((prev) =>
        prev.map((item) =>
          item.id === editTourId ? { ...item, ...payload } : item,
        ),
      );

      toast.success("Tour updated successfully");
      setEditModal(false);
    } catch (err) {
      console.log(err);
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);

    try {
      await dispatch(DeleteToursSubmit(deleteId)).unwrap();
      setToursList((prev) => prev.filter((item) => item.id !== deleteId));
      toast.success("Tour deleted successfully");
    } catch (err) {
      toast.error("Error deleting tour");
    } finally {
      setDeleteLoading(false);
      setDeleteId(null);
    }
  };

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
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
        style={{
          background: "#f5f7fa",
          borderRadius: "8px",
          minHeight: "100vh",
        }}
      >
        {toursList.length === 0 ? (
          <div className="text-center py-5">
            <h5>No tours found</h5>
            <p className="text-muted">No tour activity available.</p>
          </div>
        ) : (
          <div className="table-responsive mt-3">
            <Table className="align-middle">
              <thead className="table-light">
                <tr>
                  <th>Building</th>
                  <th>User Email</th>
                  <th>Date</th>
                  <th>Floor</th>
                  <th>Tenant</th>
                  <th>Broker</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {[...toursList].reverse().map((tour) => (
                  <tr key={tour.id}>
                    <td>{tour.building || "N/A"}</td>
                    <td>{tour.user_email || "N/A"}</td>
                    <td>{tour.date?.split("T")[0] || "N/A"}</td>
                    <td>{tour.floor_suite || "N/A"}</td>
                    <td>{tour.tenant || "N/A"}</td>
                    <td>{tour.broker || "N/A"}</td>

                    <td>
                      <div className="d-flex align-items-center flex-nowrap gap-2 overflow-auto">
                        <button
                          className="btn btn-sm text-white flex-shrink-0"
                          style={{
                            backgroundColor: "#217ae6",
                            borderColor: "#217ae6",
                            padding: "4px 12px",
                            whiteSpace: "nowrap",
                          }}
                          onClick={() => openViewModal(tour)}
                        >
                          Notes
                        </button>

                        <button
                          className="btn btn-sm btn-outline-primary flex-shrink-0"
                          onClick={() => handleEdit(tour)}
                        >
                          <i className="bi bi-pencil"></i>
                        </button>

                        <button
                          className="btn btn-sm btn-outline-secondary flex-shrink-0"
                          onClick={() => openDeleteModal(tour.id)}
                          disabled={deleteLoading && deleteId === tour.id}
                        >
                          {deleteLoading && deleteId === tour.id ? (
                            <span className="spinner-border spinner-border-sm"></span>
                          ) : (
                            <i className="bi bi-trash"></i>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </Container>

      <Modal
        show={viewModal}
        onHide={() => setViewModal(false)}
        centered
        size="md"
      >
        <Modal.Header closeButton>
          <Modal.Title className="fw-semibold">Tour Notes</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {selectedTour && (
            <>
              <p>
                <strong>Building:</strong> {selectedTour.building}
              </p>
              <p>
                <strong>Date:</strong> {selectedTour?.date?.split("T")[0]}
              </p>

              <hr />

              <p>
                <strong>Notes:</strong>
              </p>
              <p className="text-muted">
                {selectedTour.notes || "No notes available"}
              </p>
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
          <Modal.Title>Delete Tour?</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {deleteLoading ? (
            <div className="text-center py-2">
              <div className="spinner-border text-danger"></div>
              <p className="mt-2">Deleting...</p>
            </div>
          ) : (
            "Are you sure you want to permanently delete this tour?"
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
      <Modal show={editModal} onHide={() => setEditModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Tour</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <div className="mb-2">
            <label>Date</label>
            <input
              type="datetime-local"
              className="form-control"
              value={editForm.date?.slice(0, 16)}
              onChange={(e) =>
                setEditForm({ ...editForm, date: e.target.value })
              }
            />
          </div>

          <div className="mb-2">
            <label>Building</label>
            <input
              className="form-control"
              value={editForm.building}
              disabled={updateLoading}
              onChange={(e) =>
                setEditForm({ ...editForm, building: e.target.value })
              }
            />
          </div>

          <div className="mb-2">
            <label>Floor Suite</label>
            <input
              className="form-control"
              value={editForm.floor_suite}
              disabled={updateLoading}
              onChange={(e) =>
                setEditForm({ ...editForm, floor_suite: e.target.value })
              }
            />
          </div>

          <div className="mb-2">
            <label>Tenant</label>
            <input
              className="form-control"
              value={editForm.tenant}
              disabled={updateLoading}
              onChange={(e) =>
                setEditForm({ ...editForm, tenant: e.target.value })
              }
            />
          </div>

          <div className="mb-2">
            <label>Broker</label>
            <input
              className="form-control"
              value={editForm.broker}
              disabled={updateLoading}
              onChange={(e) =>
                setEditForm({ ...editForm, broker: e.target.value })
              }
            />
          </div>

          <div>
            <label>Notes</label>
            <textarea
              className="form-control"
              rows="3"
              value={editForm.notes}
              disabled={updateLoading}
              onChange={(e) =>
                setEditForm({ ...editForm, notes: e.target.value })
              }
            />
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={handleUpdate}
            disabled={updateLoading}
          >
            {updateLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Updating...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};
