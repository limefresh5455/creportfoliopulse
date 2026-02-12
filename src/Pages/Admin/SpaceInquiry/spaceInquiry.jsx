import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  IngestionConfigsSubmit,
  getIngestionConfigsSubmit,
  getSpaceInquryList,
  UpdateIngestionConfigsSubmit,
  getSpaceInquryview,
  DeleteIngestionConfigs,
} from "../../../Networking/Admin/APIs/SpaceInquiryApi";
import {
  Modal,
  Form,
  Button,
  Spinner,
  Card,
  Row,
  Col,
  Badge,
} from "react-bootstrap";
import { toast } from "react-toastify";
import RAGLoader from "../../../Component/Loader";

export const SpaceInquiry = () => {
  const dispatch = useDispatch();

  const [showAdd, setShowAdd] = useState(false);
  const [showView, setShowView] = useState(false);
  const [showInquiryView, setShowInquiryView] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [loadingInquiryDetail, setLoadingInquiryDetail] = useState(false);

  const [isSubmitted, setIsSubmitted] = useState(false);

  const [configDetails, setConfigDetails] = useState(null);
  const [loadingConfig, setLoadingConfig] = useState(false);

  const [inquiries, setInquiries] = useState([]);
  const [loadingInquiries, setLoadingInquiries] = useState(false);

  const [button, setButton] = useState(false);

  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});

  const [loadingInquiryId, setLoadingInquiryId] = useState(null);
  const [loadingDelete, setLoadingDelete] = useState(false);

  const [form, setForm] = useState({
    imap_host: "",
    imap_port: "",
    imap_username: "",
    imap_password: "",

    building_addresses_list: [""],
    trusted_sender_domains: [""],
    is_active: true,
  });

  const resetConfigStates = () => {
    setForm({
      imap_host: "",
      imap_port: "",
      imap_username: "",
      imap_password: "",
      smtp_host: "",
      smtp_port: "",
      smtp_username: "",
      smtp_password: "",
      building_addresses_list: [""],
      trusted_sender_domains: [""],
      is_active: true,
    });

    setEditData({});
    setConfigDetails(null);
    setButton(false);
  };

  useEffect(() => {
    const fetchInquiryList = async () => {
      try {
        setLoadingInquiries(true);
        const res = await dispatch(getSpaceInquryList()).unwrap();
        setInquiries(res || []);
      } catch (err) {
        console.error("Fetch Inquiry Error:", err);
        toast.error("Failed to fetch inquiries");
      } finally {
        setLoadingInquiries(false);
      }
    };
    fetchInquiryList();
  }, [dispatch, isSubmitted]);

  const fetchConfig = async () => {
    try {
      setLoadingConfig(true);
      const res = await dispatch(getIngestionConfigsSubmit()).unwrap();

      if (res && Object.keys(res).length > 0) {
        setButton(true);
        setConfigDetails(res);
      } else {
        setButton(false);
        setConfigDetails(null);
      }
    } catch (err) {
      console.error("Error fetching ingestion configs:", err);
      setButton(false);
      setConfigDetails(null);
    } finally {
      setLoadingConfig(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, [dispatch]);

  const handleViewInquiry = async (inquiryId) => {
    try {
      setLoadingInquiryId(inquiryId);
      setLoadingInquiryDetail(true);

      const res = await dispatch(getSpaceInquryview(inquiryId)).unwrap();

      setSelectedInquiry(res);
      setShowInquiryView(true);
    } catch (err) {
      console.error("Error fetching inquiry detail:", err);
      toast.error("Failed to load inquiry details");
    } finally {
      setLoadingInquiryDetail(false);
      setLoadingInquiryId(null);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setForm((p) => ({ ...p, [name]: checked }));
    } else {
      setForm((p) => ({ ...p, [name]: value }));
    }
  };

  const handleArrayChange = (index, value, key) => {
    const updated = [...form[key]];
    updated[index] = value;
    setForm({ ...form, [key]: updated });
  };

  const addArrayField = (key) => {
    setForm({ ...form, [key]: [...form[key], ""] });
  };

  const removeArrayField = (key, index) => {
    const updated = [...form[key]];
    if (updated.length === 1) return;
    updated.splice(index, 1);
    setForm({ ...form, [key]: updated });
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        imap_host: form.imap_host,
        imap_port: Number(form.imap_port || 0),
        imap_username: form.imap_username,
        imap_password: form.imap_password,
        building_addresses_list: (form.building_addresses_list || []).filter(
          (x) => x.trim() !== "",
        ),
        trusted_sender_domains: (form.trusted_sender_domains || []).filter(
          (x) => x.trim() !== "",
        ),
        is_active: Boolean(form.is_active),
      };

      setLoadingConfig(true);
      await dispatch(IngestionConfigsSubmit(payload)).unwrap();
      toast.success("Configuration saved");
      setIsSubmitted((s) => !s);
      setShowAdd(false);
      await fetchConfig();
    } catch (err) {
      console.error("Submit config error:", err);
    } finally {
      setLoadingConfig(false);
    }
  };

  const handleViewConfigs = async () => {
    try {
      setLoadingConfig(true);
      const res = await dispatch(getIngestionConfigsSubmit()).unwrap();
      setConfigDetails(res);
      setEditData({
        imap_host: res?.imap_host ?? "",
        imap_port:
          res?.imap_port !== undefined && res?.imap_port !== null
            ? res.imap_port
            : "",
        imap_username: res?.imap_username ?? "",
        imap_password: res?.imap_password ?? "",
        building_addresses_list:
          Array.isArray(res?.building_addresses_list) &&
          res.building_addresses_list.length > 0
            ? res.building_addresses_list
            : [""],
        trusted_sender_domains:
          Array.isArray(res?.trusted_sender_domains) &&
          res.trusted_sender_domains.length > 0
            ? res.trusted_sender_domains
            : [""],
        is_active: typeof res?.is_active === "boolean" ? res.is_active : true,
      });
      setShowView(true);
      setEditMode(false);
    } catch (err) {
      console.error("Fetch config error:", err);
      toast.error("Failed to load configuration");
    } finally {
      setLoadingConfig(false);
    }
  };

  const handleConfigDelete = async () => {
    try {
      setLoadingDelete(true);
      await dispatch(DeleteIngestionConfigs()).unwrap();
      resetConfigStates();
      fetchConfig();
      setShowView(false);
      toast.success("Config deleted successfully");
    } catch (err) {
      console.error(err);
      toast.error("Delete failed");
    } finally {
      setLoadingDelete(false);
    }
  };

  const editArrayChange = (key, index, value) => {
    const updated = [...(editData[key] || [])];
    updated[index] = value;
    setEditData({ ...editData, [key]: updated });
  };

  const addEditArrayField = (key) => {
    setEditData({
      ...editData,
      [key]: [...(editData[key] || []), ""],
    });
  };

  const removeEditArrayField = (key, index) => {
    const updated = [...(editData[key] || [])];
    if (updated.length === 1) return;
    updated.splice(index, 1);
    setEditData({ ...editData, [key]: updated });
  };

  const handleSaveChanges = async () => {
    try {
      const payload = {
        ...editData,
        imap_port:
          editData.imap_port !== "" && editData.imap_port !== null
            ? Number(editData.imap_port)
            : 0,

        building_addresses_list: (
          editData.building_addresses_list || []
        ).filter((x) => x?.toString().trim() !== ""),
        trusted_sender_domains: (editData.trusted_sender_domains || []).filter(
          (x) => x?.toString().trim() !== "",
        ),
        is_active: Boolean(editData.is_active),
      };

      setLoadingConfig(true);
      await dispatch(UpdateIngestionConfigsSubmit(payload)).unwrap();
      toast.success("Configuration updated");
      await fetchConfig();
      setShowView(false);
      setEditMode(false);
    } catch (err) {
      console.error("Update error:", err);
      toast.error("Failed to update configuration");
    } finally {
      setLoadingConfig(false);
    }
  };

  return (
    <>
      <div className="container-fluid mt-4">
        <div className="card shadow-sm border-0">
          <div className="card-header bg-success text-white d-flex justify-content-between align-items-center">
            <h5 className="mb-0">📨 Space Inquiry List</h5>

            <div className="d-flex gap-2 align-items-center">
              <button
                className="btn btn-light text-primary fw-semibold px-4 py-2 shadow-sm"
                onClick={() => {
                  if (button) handleViewConfigs();
                  else setShowAdd(true);
                }}
                disabled={loadingConfig}
                style={{ borderRadius: "8px" }}
              >
                {loadingConfig ? (
                  <Spinner animation="border" size="sm" />
                ) : button ? (
                  "View Config"
                ) : (
                  "Add Config"
                )}
              </button>
            </div>
          </div>

          <div className="card-body">
            {loadingInquiries ? (
              <div
                className="d-flex justify-content-center align-items-center"
                style={{ height: "70vh" }}
              >
                <RAGLoader />
              </div>
            ) : inquiries.length === 0 ? (
              <div
                className="d-flex justify-content-center align-items-center"
                style={{ height: "70vh" }}
              >
                <p className="text-muted">No inquiries found.</p>
              </div>
            ) : (
              <Row>
                {inquiries.map((item) => (
                  <Col md={6} lg={4} className="mb-4" key={item.id}>
                    <Card className="h-100 shadow-sm border-0">
                      <Card.Body>
                        <h6 className="fw-bold mb-2">{item.sender_name}</h6>
                        <p className="text-muted small mb-2">
                          <i className="bi bi-envelope me-1"></i>
                          {item.sender_email}
                        </p>

                        {item.sender_phone && (
                          <p className="text-muted small mb-2">
                            <i className="bi bi-telephone me-1"></i>
                            {item.sender_phone}
                          </p>
                        )}

                        {item.broker_company && (
                          <p className="text-muted small mb-2">
                            <i className="bi bi-building me-1"></i>
                            {item.broker_company}
                          </p>
                        )}

                        <div className="mb-3">
                          <small className="text-muted">Building:</small>
                          <p className="mb-0 text-truncate">
                            {item.building_address}
                          </p>
                        </div>

                        <div className="mb-3">
                          <small className="text-muted">Inquiry:</small>
                          <p className="mb-0 text-truncate">
                            {item.inquiry_text}
                          </p>
                        </div>

                        <div className="text-muted small mb-3">
                          <i className="bi bi-clock me-1"></i>
                          {item.email_date
                            ? new Date(item.email_date).toLocaleString("en-US")
                            : "Date not available"}
                        </div>

                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="w-100 d-flex align-items-center justify-content-center"
                          onClick={() => handleViewInquiry(item.id)}
                          disabled={loadingInquiryId === item.id}
                        >
                          {loadingInquiryId === item.id ? (
                            <>
                              <span
                                className="spinner-border spinner-border-sm me-2"
                                role="status"
                              ></span>
                              Loading...
                            </>
                          ) : (
                            <>
                              <i className="bi bi-eye me-1"></i> View Details
                            </>
                          )}
                        </Button>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            )}
          </div>
        </div>
      </div>

      <Modal show={showAdd} onHide={() => setShowAdd(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>New Space Inquiry Configuration</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form>
            <h5 className="mb-3">IMAP Settings</h5>

            <div className="row">
              <div className="col-md-6 mb-3">
                <Form.Label>IMAP Host</Form.Label>
                <Form.Control
                  name="imap_host"
                  value={form.imap_host}
                  onChange={handleChange}
                  placeholder="imap.gmail.com"
                />
              </div>

              <div className="col-md-3 mb-3">
                <Form.Label>IMAP Port</Form.Label>
                <Form.Control
                  name="imap_port"
                  type="number"
                  value={form.imap_port}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-6 mb-3">
                <Form.Label>IMAP Username</Form.Label>
                <Form.Control
                  name="imap_username"
                  value={form.imap_username}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-6 mb-3">
                <Form.Label>IMAP Password</Form.Label>
                <Form.Control
                  name="imap_password"
                  type="password"
                  value={form.imap_password}
                  onChange={handleChange}
                />
              </div>
            </div>

            <hr />

            <h5>Building Addresses</h5>
            {form.building_addresses_list.map((item, index) => (
              <div className="d-flex mb-2" key={index}>
                <Form.Control
                  value={item}
                  placeholder="Enter building address"
                  onChange={(e) =>
                    handleArrayChange(
                      index,
                      e.target.value,
                      "building_addresses_list",
                    )
                  }
                />
                <Button
                  variant="danger"
                  className="ms-2"
                  onClick={() =>
                    removeArrayField("building_addresses_list", index)
                  }
                  disabled={form.building_addresses_list.length === 1}
                >
                  X
                </Button>
              </div>
            ))}
            <Button
              variant="outline-primary"
              size="sm"
              onClick={() => addArrayField("building_addresses_list")}
            >
              + Add Address
            </Button>

            <hr />

            <h5>Trusted Sender Domains</h5>
            {form.trusted_sender_domains.map((item, index) => (
              <div className="d-flex mb-2" key={index}>
                <Form.Control
                  value={item}
                  placeholder="e.g. jll.com"
                  onChange={(e) =>
                    handleArrayChange(
                      index,
                      e.target.value,
                      "trusted_sender_domains",
                    )
                  }
                />
                <Button
                  variant="danger"
                  className="ms-2"
                  onClick={() =>
                    removeArrayField("trusted_sender_domains", index)
                  }
                  disabled={form.trusted_sender_domains.length === 1}
                >
                  X
                </Button>
              </div>
            ))}
            <Button
              variant="outline-primary"
              size="sm"
              onClick={() => addArrayField("trusted_sender_domains")}
            >
              + Add Domain
            </Button>

            <hr />

            <Form.Check
              type="switch"
              label="Is Active?"
              name="is_active"
              checked={form.is_active}
              onChange={handleChange}
            />
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAdd(false)}>
            Cancel
          </Button>
          <Button
            variant="success"
            onClick={handleSubmit}
            disabled={loadingConfig}
          >
            {loadingConfig ? (
              <Spinner animation="border" size="sm" />
            ) : (
              "Save Configuration"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={showView}
        onHide={() => setShowView(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {editMode
              ? "Update Inquiry Configuration"
              : "Inquiry Configuration Details"}
          </Modal.Title>

          {!editMode && (
            <Button
              variant="warning"
              size="sm"
              className="ms-3"
              onClick={() => setEditMode(true)}
            >
              Edit
            </Button>
          )}
          <Button
            variant="danger"
            size="sm"
            className="ms-3 d-flex align-items-center gap-2"
            onClick={handleConfigDelete}
            disabled={loadingDelete}
          >
            {loadingDelete ? (
              <>
                <Spinner animation="border" size="sm" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </Button>
        </Modal.Header>

        <Modal.Body>
          {loadingConfig ? (
            <div className="text-center py-4">
              <Spinner animation="border" />
            </div>
          ) : !configDetails ? (
            <p className="text-center text-muted">No configuration found</p>
          ) : (
            <>
              {editMode ? (
                <>
                  <Form>
                    <h5 className="fw-bold mb-3"> Update IMAP Settings</h5>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <Form.Label>IMAP Host</Form.Label>
                        <Form.Control
                          value={editData.imap_host}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              imap_host: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="col-md-3 mb-3">
                        <Form.Label>IMAP Port</Form.Label>
                        <Form.Control
                          type="number"
                          value={editData.imap_port}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              imap_port: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="col-md-6 mb-3">
                        <Form.Label>IMAP Username</Form.Label>
                        <Form.Control
                          value={editData.imap_username}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              imap_username: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="col-md-6 mb-3">
                        <Form.Label>IMAP Password</Form.Label>
                        <Form.Control
                          type="password"
                          value={editData.imap_password}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              imap_password: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>

                    <hr />

                    <h5 className="fw-bold mb-3">Building Addresses</h5>
                    {(editData.building_addresses_list || []).map(
                      (addr, index) => (
                        <div className="d-flex mb-2" key={index}>
                          <Form.Control
                            value={addr}
                            onChange={(e) =>
                              editArrayChange(
                                "building_addresses_list",
                                index,
                                e.target.value,
                              )
                            }
                          />
                          <Button
                            variant="danger"
                            className="ms-2"
                            onClick={() =>
                              removeEditArrayField(
                                "building_addresses_list",
                                index,
                              )
                            }
                          >
                            X
                          </Button>
                        </div>
                      ),
                    )}

                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() =>
                        addEditArrayField("building_addresses_list")
                      }
                    >
                      + Add Address
                    </Button>

                    <hr />

                    <h5 className="fw-bold mb-3">Trusted Sender Domains</h5>
                    {(editData.trusted_sender_domains || []).map((d, index) => (
                      <div className="d-flex mb-2" key={index}>
                        <Form.Control
                          value={d}
                          onChange={(e) =>
                            editArrayChange(
                              "trusted_sender_domains",
                              index,
                              e.target.value,
                            )
                          }
                        />
                        <Button
                          variant="danger"
                          className="ms-2"
                          onClick={() =>
                            removeEditArrayField(
                              "trusted_sender_domains",
                              index,
                            )
                          }
                        >
                          X
                        </Button>
                      </div>
                    ))}

                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() =>
                        addEditArrayField("trusted_sender_domains")
                      }
                    >
                      + Add Domain
                    </Button>

                    <hr />

                    <Form.Check
                      type="switch"
                      label="Is Active?"
                      checked={Boolean(editData.is_active)}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          is_active: e.target.checked,
                        })
                      }
                    />
                  </Form>
                </>
              ) : (
                <div className="container-fluid">
                  <div className="mb-4">
                    <h5 className="fw-bold mb-3"> IMAP Configuration</h5>
                    <div className="card shadow-sm border-0">
                      <div className="card-body">
                        <table className="table table-borderless mb-0">
                          <tbody>
                            <tr>
                              <th>IMAP Host:</th>
                              <td>{configDetails.imap_host}</td>
                            </tr>
                            <tr>
                              <th>IMAP Port:</th>
                              <td>{configDetails.imap_port}</td>
                            </tr>
                            <tr>
                              <th>IMAP Username:</th>
                              <td>{configDetails.imap_username}</td>
                            </tr>
                            <tr>
                              <th>IMAP Password:</th>
                              <td>******</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h5 className="fw-bold mb-3"> Status</h5>
                    <span
                      className={`badge px-3 py-2 ${
                        configDetails.is_active ? "bg-success" : "bg-danger"
                      }`}
                    >
                      {configDetails.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <div className="mb-4">
                    <h5 className="fw-bold mb-3">Building Addresses</h5>
                    <ul className="list-group">
                      {(configDetails.building_addresses_list || []).map(
                        (a, i) => (
                          <li className="list-group-item" key={i}>
                            {a}
                          </li>
                        ),
                      )}
                    </ul>
                  </div>

                  <div>
                    <h5 className="fw-bold mb-3">Trusted Sender Domains</h5>
                    {(configDetails.trusted_sender_domains || []).map(
                      (d, i) => (
                        <span className="badge bg-primary p-2 me-2" key={i}>
                          {d}
                        </span>
                      ),
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </Modal.Body>

        {editMode && (
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setEditMode(false)}>
              Cancel
            </Button>

            <Button
              variant="success"
              onClick={handleSaveChanges}
              disabled={loadingConfig}
            >
              {loadingConfig ? (
                <Spinner animation="border" size="sm" />
              ) : (
                "Save Changes"
              )}
            </Button>
          </Modal.Footer>
        )}
      </Modal>

      <Modal
        show={showInquiryView}
        onHide={() => setShowInquiryView(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton className="bg-light">
          <Modal.Title className="fw-bold">
            <i className="bi bi-info-circle me-2"></i>
            Inquiry Details
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {loadingInquiryDetail ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3 text-muted">Loading inquiry details...</p>
            </div>
          ) : selectedInquiry ? (
            <div className="container-fluid">
              <div className="row">
                <div className="col-md-6 mb-4">
                  <div className="card border-0 shadow-sm h-100">
                    <div
                      className="card-header text-white"
                      style={{ backgroundColor: "#212529" }}
                    >
                      <h6 className="mb-0">
                        <i className="bi bi-person me-2"></i>Sender Information
                      </h6>
                    </div>
                    <div className="card-body">
                      <table className="table table-borderless">
                        <tbody>
                          <tr>
                            <th width="40%">ID:</th>
                            <td>
                              <Badge bg="secondary">{selectedInquiry.id}</Badge>
                            </td>
                          </tr>
                          <tr>
                            <th>Name:</th>
                            <td className="fw-semibold">
                              {selectedInquiry.sender_name || "N/A"}
                            </td>
                          </tr>
                          <tr>
                            <th>Email:</th>
                            <td>
                              <a
                                href={`mailto:${selectedInquiry.sender_email}`}
                              >
                                {selectedInquiry.sender_email || "N/A"}
                              </a>
                            </td>
                          </tr>
                          <tr>
                            <th>Phone:</th>
                            <td>{selectedInquiry.sender_phone || "N/A"}</td>
                          </tr>
                          <tr>
                            <th>Broker Company:</th>
                            <td>{selectedInquiry.broker_company || "N/A"}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <div className="col-md-6 mb-4">
                  <div className="card border-0 shadow-sm h-100">
                    <div
                      className="card-header  text-white"
                      style={{ backgroundColor: "#212529" }}
                    >
                      <h6 className="mb-0">
                        <i className="bi bi-building me-2"></i>Property Details
                      </h6>
                    </div>
                    <div className="card-body">
                      <table className="table table-borderless">
                        <tbody>
                          <tr>
                            <th width="40%">Building Address:</th>
                            <td className="fw-semibold">
                              {selectedInquiry.building_address || "N/A"}
                            </td>
                          </tr>
                          <tr>
                            <th>Email Date:</th>
                            <td>
                              {selectedInquiry.email_date
                                ? new Date(
                                    selectedInquiry.email_date,
                                  ).toLocaleString("en-US")
                                : "N/A"}
                            </td>
                          </tr>
                          <tr>
                            <th>Status:</th>
                            <td>
                              <Badge
                                bg={
                                  selectedInquiry.status === "processed"
                                    ? "success"
                                    : selectedInquiry.status === "pending"
                                      ? "warning"
                                      : "info"
                                }
                              >
                                {selectedInquiry.status || "new"}
                              </Badge>
                            </td>
                          </tr>
                          <tr>
                            <th>Created At:</th>
                            <td>
                              {selectedInquiry.created_at
                                ? new Date(
                                    selectedInquiry.created_at,
                                  ).toLocaleString("en-US")
                                : "N/A"}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <div className="col-12 mb-4">
                  <div className="card border-0 shadow-sm">
                    <div
                      className="card-header  text-white"
                      style={{ backgroundColor: "#212529" }}
                    >
                      <h6 className="mb-0">
                        <i className="bi bi-chat-text me-2"></i>Inquiry Message
                      </h6>
                    </div>
                    <div className="card-body">
                      <div className="bg-light p-3 rounded">
                        <p className="mb-0" style={{ whiteSpace: "pre-wrap" }}>
                          {selectedInquiry.inquiry_text ||
                            "No inquiry text provided"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {(selectedInquiry.additional_notes ||
                  selectedInquiry.attachments) && (
                  <div className="col-12">
                    <div className="card border-0 shadow-sm">
                      <div className="card-header bg-warning text-dark">
                        <h6 className="mb-0">
                          <i className="bi bi-paperclip me-2"></i>Additional
                          Information
                        </h6>
                      </div>
                      <div className="card-body">
                        {selectedInquiry.additional_notes && (
                          <div className="mb-3">
                            <h6>Additional Notes:</h6>
                            <p className="mb-0">
                              {selectedInquiry.additional_notes}
                            </p>
                          </div>
                        )}
                        {selectedInquiry.attachments && (
                          <div>
                            <h6>Attachments:</h6>
                            <p className="mb-0">
                              {selectedInquiry.attachments}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-5">
              <p className="text-muted">No inquiry details found.</p>
            </div>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
};
