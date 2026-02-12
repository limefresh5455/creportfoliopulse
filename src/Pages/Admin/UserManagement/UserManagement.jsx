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
        label: "fire safety & Building Mechanicals",
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
        label: "Leases Agreement Data",
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
    Object.keys(section.features).forEach((featureKey) => {
      defaults[featureKey] = false;
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
    if (!emailRegex.test(email)) {
      toast.error("Enter a valid email");
      return;
    }

    setInviteLoading(true);
    try {
      await dispatch(inviteUserApi({ email })).unwrap();

      setEmail("");
      fetchUsers();
    } catch {
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
      setSelectedEmail(null);
    }
  };

  const openFeatureModal = async (user) => {
    try {
      setFeatureLoading(true);
      setSelectedUser(user);

      const res = await dispatch(
        getProfileByEmailApi({ email: user.email }),
      ).unwrap();
      setFeatures(mapUserToFeatures(res));
      setShowFeatureModal(true);
    } catch {
      toast.error("Failed to load features");
    } finally {
      setFeatureLoading(false);
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

  const allFeatureKeys = Object.keys(features);
  const totalFeatures = allFeatureKeys.length;
  const enabledCount = allFeatureKeys.filter((key) => features[key]).length;

  return (
    <div className="container-fluid p-3">
      <h4 className="fw-bold">User Management</h4>
      <p className="text-muted">Manage user access and features</p>

      <Card className="mb-4">
        <Card.Body>
          <Row className="g-2">
            <Col md={8}>
              <Form.Control
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Col>
            <Col md={4}>
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

      <Card>
        <Card.Body>
          <table className="table align-middle">
            <thead>
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
                  <td colSpan={5} className="text-center">
                    Loading...
                  </td>
                </tr>
              ) : users.length ? (
                users.map((user) => (
                  <tr key={user.email}>
                    <td>{user.email}</td>
                    <td>{user.status}</td>
                    <td>{new Date(user.created).toLocaleDateString()}</td>
                    <td>
                      <Button
                        size="sm"
                        variant="outline-primary"
                        onClick={() => openFeatureModal(user)}
                        disabled={featureLoading}
                      >
                        Manage
                      </Button>
                    </td>
                    <td>
                      <Button
                        size="sm"
                        variant="outline-danger"
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
                  <td colSpan={5} className="text-center">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card.Body>
      </Card>

      {showFeatureModal && (
        <div
          className="modal fade show d-block"
          style={{ background: "#00000080" }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  Feature Access – {selectedUser.email}
                </h5>
                <button
                  className="btn-close"
                  onClick={() => setShowFeatureModal(false)}
                />
              </div>

              <div className="modal-body">
                <p>
                  Total: {totalFeatures} | Enabled: {enabledCount} | Disabled:{" "}
                  {totalFeatures - enabledCount}
                </p>

                {Object.entries(FEATURE_CONFIG).map(([sectionKey, section]) => (
                  <div key={sectionKey} className="mb-4">
                    <h6 className="fw-bold border-bottom pb-2 mb-3">
                      {section.title}
                    </h6>
                    <Row>
                      {Object.entries(section.features).map(
                        ([featureKey, feature]) => (
                          <Col md={6} key={featureKey} className="mb-3">
                            <div className="d-flex justify-content-between align-items-center border rounded p-2">
                              <span>{feature.label}</span>
                              <Form.Check
                                type="switch"
                                checked={features[featureKey]}
                                onChange={(e) =>
                                  setFeatures((prev) => ({
                                    ...prev,
                                    [featureKey]: e.target.checked,
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
                <Button
                  variant="primary"
                  onClick={handleSaveFeatures}
                  disabled={featureLoading}
                >
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
              <div className="modal-body">
                Delete user <strong>{selectedEmail}</strong>?
              </div>
              <div className="modal-footer">
                <Button
                  variant="secondary"
                  onClick={() => setShowConfirm(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  onClick={handleDelete}
                  disabled={deleteLoading}
                >
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
