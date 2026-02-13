import React, { useEffect, useState } from "react";
import { Card, Button, Form, Spinner, Row, Col } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";

import { inviteUserApi } from "../../../Networking/Admin/APIs/UserManagement";
import { DeleteUser } from "../../../Networking/Admin/APIs/LoginAPIs";
import { toggleUserFeaturesApi } from "../../../Networking/Admin/APIs/forumApi";
import { getAdminlistApi } from "../../../Networking/SuperAdmin/AdminSuperApi";
import { getProfileByEmailApi } from "../../../Networking/User/APIs/Profile/ProfileApi";

export const FEATURE_CONFIG = {
  MAIN: {
    title: "Main",
    features: {
      portfolio_insights_enabled: {
        label: "Portfolio Voice",
        backendKey: "portfolio_insights_enabled",
      },
      email_drafting_enabled: {
        label: "Email Drafting",
        backendKey: "email_drafting_enabled",
      },
      gemini_chat_enabled: {
        label: "Gemini Chat",
        backendKey: "gemini_chat_enabled",
      },
      notes_enabled: { label: "Notes", backendKey: "notes_enabled" },
      forum_enabled: { label: "Portfolio Forum", backendKey: "forum_enabled" },
      ai_lease_abstract_enabled: {
        label: "AI Lease Abstract",
        backendKey: "ai_lease_abstract_enabled",
      },
      information_collaboration_enabled: {
        label: "Information Collaboration",
        backendKey: "information_collaboration_enabled",
      },
      det_enabled: { label: "DET", backendKey: "det_enabled" },
      dct_enabled: { label: "DCT", backendKey: "dct_enabled" },
      calculator_enabled: {
        label: "Calculator",
        backendKey: "calculator_enabled",
      },
      yardi_enabled: { label: "Yardi", backendKey: "yardi_enabled" },
      project_management_enabled: {
        label: "Project Management",
        backendKey: "project_management_enabled",
      },
    },
  },
  DATA_CATEGORY: {
    title: "Data Category",
    features: {
      third_party_enabled: {
        label: "Third Party",
        backendKey: "third_party_enabled",
      },
      employee_contact_enabled: {
        label: "Employee Contact",
        backendKey: "employee_contact_enabled",
      },
      building_info_enabled: {
        label: "Building Info",
        backendKey: "building_info_enabled",
      },
      comparative_building_data_enabled: {
        label: "Comparative Building Data",
        backendKey: "comparative_building_data_enabled",
      },
      tenant_information_enabled: {
        label: "Tenant Information",
        backendKey: "tenant_information_enabled",
      },
      tenants_in_the_market_enabled: {
        label: "Tenants In The Market",
        backendKey: "tenants_in_the_market_enabled",
      },
      comps_enabled: { label: "Comps", backendKey: "comps_enabled" },
      fire_safety_enabled: {
        label: "Fire Safety & Mechanicals",
        backendKey: "fire_safety_enabled",
      },
      sublease_tracker_enabled: {
        label: "Sublease Tracker",
        backendKey: "sublease_tracker_enabled",
      },
      renewal_tracker_enabled: {
        label: "Renewal Tracker",
        backendKey: "renewal_tracker_enabled",
      },
      leases_agreement_data_enabled: {
        label: "Lease Agreement Data",
        backendKey: "leases_agreement_data_enabled",
      },
      deal_tracker_enabled: {
        label: "Deal Tracker",
        backendKey: "deal_tracker_enabled",
      },
      tour_enabled: { label: "Tour", backendKey: "tour_enabled" },
    },
  },
};

const buildDefaultFeatures = () => {
  const defaults = {};
  Object.values(FEATURE_CONFIG).forEach((section) => {
    Object.keys(section.features).forEach((key) => {
      defaults[key] = false;
    });
  });
  return defaults;
};

const DEFAULT_FEATURES = buildDefaultFeatures();

const mapUserToFeatures = (user) => {
  const mapped = {};
  Object.values(FEATURE_CONFIG).forEach((section) => {
    Object.entries(section.features).forEach(([featureKey, config]) => {
      mapped[featureKey] = Boolean(user?.[config.backendKey]);
    });
  });
  return mapped;
};

export const UserManagement = () => {
  const dispatch = useDispatch();

  const [email, setEmail] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [manageLoading, setManageLoading] = useState(null);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const [showFeatureModal, setShowFeatureModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [featureLoading, setFeatureLoading] = useState(false);
  const [features, setFeatures] = useState(DEFAULT_FEATURES);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await dispatch(getAdminlistApi()).unwrap();
      setUsers(res || []);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleInviteUser = async () => {
    if (!emailRegex.test(email)) return toast.error("Enter valid email");

    setInviteLoading(true);
    try {
      await dispatch(inviteUserApi({ email })).unwrap();
      setEmail("");
      fetchUsers();
    } finally {
      setInviteLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(selectedEmail);
    try {
      await dispatch(DeleteUser(selectedEmail)).unwrap();
      toast.success("User deleted");
      fetchUsers();
    } catch {
      toast.error("Delete failed");
    } finally {
      setDeleteLoading(null);
      setShowConfirm(false);
    }
  };

  const openFeatureModal = async (user) => {
    try {
      setManageLoading(user.email);
      setFeatureLoading(true);
      setSelectedUser(user);
      const res = await dispatch(
        getProfileByEmailApi({ email: user.email }),
      ).unwrap();
      setFeatures(mapUserToFeatures(res));
      setShowFeatureModal(true);
    } catch {
      toast.error("Failed loading features");
    } finally {
      setFeatureLoading(false);
      setManageLoading(null);
    }
  };

  const handleSaveFeatures = async () => {
    try {
      setFeatureLoading(true);
      await dispatch(
        toggleUserFeaturesApi({ email: selectedUser.email, features }),
      ).unwrap();
      toast.success("Features updated");
      setShowFeatureModal(false);
      fetchUsers();
    } catch {
      toast.error("Update failed");
    } finally {
      setFeatureLoading(false);
    }
  };

  const total = Object.keys(features).length;
  const enabled = Object.values(features).filter(Boolean).length;

  return (
    <div className="container-fluid p-2 p-md-3">
      <h4 className="fw-bold fs-5 fs-md-4 mx-5 mx-md-0">User Management</h4>
      <p className="text-muted small mx-5 mx-md-0">
        Manage user access and features
      </p>

      <Card className="mb-3 mb-md-4 ">
        <Card.Body>
          <Row className="g-2 align-items-stretch">
            <Col xs={12} md={8}>
              <Form.Control
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Col>

            <Col xs={12} md={4}>
              <Button
                className="w-100"
                onClick={handleInviteUser}
                disabled={inviteLoading}
              >
                {inviteLoading ? <Spinner size="sm" /> : "Invite User"}
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card className="shadow-sm">
        <Card.Body className="p-2 p-md-3">
          <div className="table-responsive">
            <table className="table table-sm align-middle">
              <thead className="table-light">
                <tr>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Features</th>
                  <th>Delete</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-4">
                      <Spinner />
                    </td>
                  </tr>
                ) : users.length ? (
                  users.map((user) => (
                    <tr key={user.email}>
                      <td className="text-break">{user.email}</td>
                      <td>{user.status}</td>
                      <td>{new Date(user.created).toLocaleDateString()}</td>

                      <td>
                        <Button
                          size="sm"
                          variant="outline-primary"
                          className="w-100 w-md-auto"
                          onClick={() => openFeatureModal(user)}
                          disabled={manageLoading === user.email}
                        >
                          {manageLoading === user.email ? (
                            <>
                              <Spinner
                                as="span"
                                animation="border"
                                size="sm"
                                role="status"
                                aria-hidden="true"
                                className="me-1"
                              />
                              Loading...
                            </>
                          ) : (
                            "Manage"
                          )}
                        </Button>
                      </td>

                      <td>
                        <Button
                          size="sm"
                          variant="outline-danger"
                          className="w-100 w-md-auto"
                          onClick={() => {
                            setSelectedEmail(user.email);
                            setShowConfirm(true);
                          }}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center py-4">
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card.Body>
      </Card>

      {showFeatureModal && (
        <div
          className="modal fade show d-block"
          style={{ background: "#00000080" }}
        >
          <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title text-break">
                  Feature Access – {selectedUser.email}
                </h5>
                <button
                  className="btn-close"
                  onClick={() => setShowFeatureModal(false)}
                />
              </div>

              <div className="modal-body">
                <p className="small text-muted">
                  Total: {total} | Enabled: {enabled} | Disabled:{" "}
                  {total - enabled}
                </p>

                {Object.entries(FEATURE_CONFIG).map(([sectionKey, section]) => (
                  <div key={sectionKey} className="mb-4">
                    <h6 className="fw-bold border-bottom pb-2 mb-3">
                      {section.title}
                    </h6>

                    <Row>
                      {Object.entries(section.features).map(
                        ([key, feature]) => (
                          <Col xs={12} sm={6} lg={4} key={key} className="mb-3">
                            <div className="d-flex flex-wrap gap-2 justify-content-between align-items-center border rounded p-2">
                              <span className="small">{feature.label}</span>

                              <Form.Check
                                type="switch"
                                checked={features[key]}
                                onChange={(e) =>
                                  setFeatures((prev) => ({
                                    ...prev,
                                    [key]: e.target.checked,
                                  }))
                                }
                              />
                            </div>
                          </Col>
                        ),
                      )}
                    </Row>
                  </div>
                ))}
              </div>

              <div className="modal-footer">
                <Button
                  variant="secondary"
                  onClick={() => setShowFeatureModal(false)}
                >
                  Cancel
                </Button>

                <Button variant="primary" onClick={handleSaveFeatures}>
                  {featureLoading ? <Spinner size="sm" /> : "Save"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showConfirm && (
        <div
          className="modal fade show d-block"
          style={{ background: "#00000080" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Delete</h5>
                <button
                  className="btn-close"
                  onClick={() => setShowConfirm(false)}
                />
              </div>

              <div className="modal-body text-break">
                Delete user <strong>{selectedEmail}</strong>?
              </div>

              <div className="modal-footer">
                <Button
                  variant="secondary"
                  onClick={() => setShowConfirm(false)}
                >
                  Cancel
                </Button>

                <Button variant="danger" onClick={handleDelete}>
                  {deleteLoading ? <Spinner size="sm" /> : "Delete"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
