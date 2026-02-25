import React, { useEffect, useState } from "react";
import { Card, Button, Form, Spinner } from "react-bootstrap";
import { useDispatch } from "react-redux";

import { DeleteUser } from "../../../Networking/Admin/APIs/LoginAPIs";
import { toast } from "react-toastify";
import {
  getAdminlistApi,
  inviteAdminApi,
} from "../../../Networking/SuperAdmin/AdminSuperApi";
import { useNavigate } from "react-router-dom";

export const AdminManagement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [admin, setadmin] = useState([]);
  const [company_name, setcompany_name] = useState("");
  const [admin_name, setadmin_name] = useState("");
  const [loading, setLoading] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [deletingUser, setDeletingUser] = useState({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState(null);

  useEffect(() => {
    fetchadmin();
  }, []);

  const fetchadmin = async () => {
    setLoading(true);
    try {
      const res = await dispatch(getAdminlistApi()).unwrap();
      setadmin(res || []);
    } catch (err) {
      console.error("Failed to fetch admin:", err);
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!selectedEmail) return;

    try {
      setDeletingUser((prev) => ({ ...prev, [selectedEmail]: true }));

      const data = await dispatch(DeleteUser(selectedEmail)).unwrap();
      toast.success(data.message || "User deleted successfully");

      fetchadmin();
      setShowConfirm(false);
      setSelectedEmail(null);
    } catch (error) {
      console.error("Failed to delete user:", error);
    } finally {
      setDeletingUser((prev) => ({ ...prev, [selectedEmail]: false }));
    }
  };

  const handleInviteAdmin = async () => {
    const newErrors = {};

    const noLeadingSpace = /^\S.*$/;

    if (!admin_name) newErrors.admin_name = "Admin Name is required";
    else if (!noLeadingSpace.test(admin_name))
      newErrors.admin_name = "Enter a valid Admin Name";
    else if (admin_name.length < 3)
      newErrors.admin_name = "Admin Name must be at least 3 characters";

    if (!company_name) newErrors.company_name = "Company Name is required";
    else if (!noLeadingSpace.test(company_name))
      newErrors.company_name = "Enter a valid Company Name";
    else if (company_name.length < 3)
      newErrors.company_name = "Company Name must be at least 3 characters";

    if (!email) {
      newErrors.email = "Email is required";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        newErrors.email = "Enter a valid email address";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setInviteLoading(true);
    try {
      await dispatch(
        inviteAdminApi({ email, company_name, admin_name }),
      ).unwrap();
      setEmail("");
      setcompany_name("");
      setadmin_name("");
      fetchadmin();
    } catch (err) {
      console.error("Invite failed:", err);
    } finally {
      setInviteLoading(false);
    }
  };

  return (
    <div className="container-fluid p-3">
      <h4 className="fw-bold">Admin Management</h4>
      <p className="text-muted">
        Control Admin access to Portfolio Pulse documents and features
      </p>

      <Card className="mb-4 border-0 shadow-sm">
        <Card.Body>
          <p className="mb-0">
            <strong>🔒 Security Model:</strong> Only Super Administrators can
            create Super Administrators accounts. Admins receive secure
            credentials via email.
          </p>
        </Card.Body>
      </Card>

      <Card className="mb-4 border-0 shadow-sm">
        <Card.Body>
          <h5 className="mb-3">
            <i className="bi bi-person-plus me-2"></i> Add New Admin
          </h5>

          <Form>
            <div className="row g-3">
              <div className="col-md-6">
                <Form.Control
                  type="text"
                  placeholder="Enter Admin Name..."
                  value={admin_name}
                  onChange={(e) => setadmin_name(e.target.value)}
                  disabled={inviteLoading}
                  isInvalid={!!errors.admin_name}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.admin_name}
                </Form.Control.Feedback>
              </div>

              <div className="col-md-6">
                <Form.Control
                  type="text"
                  placeholder="Enter Company Name..."
                  value={company_name}
                  onChange={(e) => setcompany_name(e.target.value)}
                  disabled={inviteLoading}
                  isInvalid={!!errors.company_name}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.company_name}
                </Form.Control.Feedback>
              </div>
            </div>

            <div className="row g-3 mt-2">
              <div className="col-md-9">
                <Form.Control
                  type="email"
                  placeholder="Enter Admin Email..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={inviteLoading}
                  isInvalid={!!errors.email}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.email}
                </Form.Control.Feedback>
              </div>

              <div className="col-md-3 d-grid">
                <Button
                  variant="primary"
                  onClick={handleInviteAdmin}
                  disabled={inviteLoading}
                >
                  {inviteLoading ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                      />{" "}
                      Sending...
                    </>
                  ) : (
                    "Invite Admin"
                  )}
                </Button>
              </div>
            </div>
          </Form>

          <small className="text-muted d-block mt-2">
            Admin will receive secure login credentials via email.
          </small>
        </Card.Body>
      </Card>

      <Card className="border-0 shadow-sm">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap">
            <h5 className="mb-0">Active Admins</h5>
            <span className="badge bg-dark mt-2 mt-sm-0">
              {admin.length} Total Admin
            </span>
          </div>

          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Display Name</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="text-center text-muted">
                      Loading...
                    </td>
                  </tr>
                ) : admin.length > 0 ? (
                  admin.map((user, index) => (
                    <tr key={index}>
                      <td>{user.email}</td>
                      <td>
                        <span
                          className={`badge ${
                            user.status === "Verified"
                              ? "bg-success"
                              : "bg-secondary"
                          }`}
                        >
                          {user.status}
                        </span>
                      </td>
                      <td>{user.display || user.name}</td>
                      <td>{new Date(user.created).toLocaleDateString()}</td>
                      <td>
                        <div className="d-flex gap-2">
                          <Button
                            size="sm"
                            variant="outline-primary"
                            onClick={() =>
                              navigate("/super-admin/admin-details", {
                                state: { admin: user },
                              })
                            }
                          >
                            View
                          </Button>

                          {user.actions?.includes("delete") && (
                            <Button
                              size="sm"
                              variant="outline-danger"
                              onClick={() => {
                                setSelectedEmail(user.email);
                                setShowConfirm(true);
                              }}
                              disabled={deletingUser[user.email]}
                            >
                              {deletingUser[user.email]
                                ? "Deleting..."
                                : "Delete"}
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center text-muted">
                      No admin found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card.Body>
      </Card>
      {showConfirm && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ background: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Delete</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowConfirm(false)}
                  disabled={deletingUser[selectedEmail]}
                />
              </div>

              <div className="modal-body">
                <p>
                  Are you sure you want to delete user:
                  <strong className="ms-1">{selectedEmail}</strong>?
                </p>
              </div>

              <div className="modal-footer">
                <Button
                  variant="secondary"
                  onClick={() => setShowConfirm(false)}
                  disabled={deletingUser[selectedEmail]}
                >
                  Cancel
                </Button>

                <Button
                  variant="danger"
                  onClick={confirmDelete}
                  disabled={deletingUser[selectedEmail]}
                >
                  {deletingUser[selectedEmail] ? (
                    <Spinner animation="border" size="sm" />
                  ) : (
                    "Delete"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
