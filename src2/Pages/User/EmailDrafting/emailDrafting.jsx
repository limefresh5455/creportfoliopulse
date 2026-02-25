import React, { useState, useEffect } from "react";
import { Form, Button, Card, Modal, Dropdown, Row, Col } from "react-bootstrap";
import { useDispatch } from "react-redux";
import {
  Deletetemplate,
  emailDraftingList,
  newEmailTemplateAPI,
  templateUpdateApi,
} from "../../../Networking/User/APIs/EmailDrafting/emailDraftingApi";
import RAGLoader from "../../../Component/Loader";
import { toast } from "react-toastify";

const DRAFT_STORAGE_KEY = "emailDrafting_currentDraft";

export const EmailDrafting = () => {
  const dispatch = useDispatch();

  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [detail, setDetail] = useState("");
  const [isEditable, setIsEditable] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [newInfoContent, setNewInfoContent] = useState("");
  const [newInfoTitle, setNewInfoTitle] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editId, setEditId] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const templateResponse = await dispatch(emailDraftingList()).unwrap();
      const data = templateResponse?.data || templateResponse || [];
      setTemplates(data);
    } catch (error) {
      console.error("Error fetching templates:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (savedDraft) {
      setDetail(savedDraft);
      setIsEditable(true);
    }
  }, []);

  useEffect(() => {
    if (detail && isEditable) {
      localStorage.setItem(DRAFT_STORAGE_KEY, detail);
    }
  }, [detail, isEditable]);

  useEffect(() => { }, [selectedTemplateId]);

  const openIn = (service) => {
    if (!detail.trim()) {
      toast.warning("Draft is empty!");
      return;
    }

    const selectedTemplate = templates.find(
      (t) => String(t.id) === String(selectedTemplateId)
    );
    const subject = selectedTemplate?.title || "Email Draft";
    const encodedBody = encodeURIComponent(detail);

    let url = "";

    if (service === "gmail") {
      url = `https://mail.google.com/mail/?view=cm&fs=1&su=${encodeURIComponent(
        subject
      )}&body=${encodedBody}`;
    } else if (service === "outlook") {
      url = `https://outlook.office.com/mail/deeplink/compose?subject=${encodeURIComponent(
        subject
      )}&body=${encodedBody}`;
    }

    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  const openEditModal = (template_id) => {
    const selected = templates.find((t) => t.id === template_id);
    if (selected) {
      setEditId(template_id);
      setEditTitle(selected?.title || "");
      setEditContent(selected?.content || "");
      setShowEditModal(true);
    }
  };

  const handleUpdateTemplate = async () => {
    if (!editTitle.trim() || !editContent.trim()) {
      toast.warning("Title and content are required");
      return;
    }

    setLoading(true);
    try {
      await dispatch(
        templateUpdateApi({
          template_id: editId,
          title: editTitle,
          content: editContent,
        })
      ).unwrap();
      toast.success("Template updated successfully!");
      await fetchData();
      setShowEditModal(false);
    } catch (error) {
      toast.error("Failed to update template");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTemplate = async (template_id) => {
    if (deleteLoading) return;

    setDeleteLoading(true);
    try {
      await dispatch(Deletetemplate({ template_id })).unwrap();
      toast.success("Template deleted successfully!");
      await fetchData();

      if (String(selectedTemplateId) === String(template_id)) {
        setSelectedTemplateId("");
        setDetail("");
        setIsEditable(false);
        localStorage.removeItem(DRAFT_STORAGE_KEY);
      }
    } catch (error) {
      toast.error("Failed to delete template");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDraftEmail = () => {
    if (!selectedTemplateId) {
      toast.error("Please select a template first!");
      return;
    }

    const selectedTemplate = templates.find(
      (t) => String(t.id) === String(selectedTemplateId)
    );

    if (!selectedTemplate) return;

    if (detail.trim() && isEditable) {
      const confirm = window.confirm(
        "You have an unsaved draft. Loading a new template will replace it. Continue?"
      );
      if (!confirm) return;
    }

    setDetail(selectedTemplate.content || "");
    setIsEditable(true);
    localStorage.setItem(DRAFT_STORAGE_KEY, selectedTemplate.content || "");
    toast.success("Template loaded! You can now edit and send.");
  };

  const handleAddInfoModal = () => {
    setNewInfoTitle("");
    setNewInfoContent("");
    setShowInfoModal(true);
  };

  const handleSubmitInfo = async () => {
    if (!newInfoTitle.trim() || !newInfoContent.trim()) {
      toast.warning("Please enter both title and content.");
      return;
    }

    setLoading(true);
    try {
      await dispatch(
        newEmailTemplateAPI({
          title: newInfoTitle,
          content: newInfoContent,
        })
      ).unwrap();
      toast.success("Template added successfully!");
      await fetchData();
      setShowInfoModal(false);
    } catch (error) {
      toast.error("Failed to add template");
    } finally {
      setLoading(false);
    }
  };

  const handleClearDraft = () => {
    if (detail.trim()) {
      const confirm = window.confirm(
        "Are you sure you want to clear the draft?"
      );
      if (confirm) {
        setDetail("");
        setIsEditable(false);
        localStorage.removeItem(DRAFT_STORAGE_KEY);
        toast.info("Draft cleared");
      }
    }
  };

  return (
    <>
      <div className="header-bg d-flex justify-content-start px-3 align-items-center sticky-header">
        <h5 className="mb-0 text-light mx-4">Email Drafting</h5>
      </div>

      <Card
        className="p-3 mt-3 p-md-4 shadow-sm mx-auto"
        style={{ maxWidth: 900 }}
      >
        {loading && (
          <div className="text-center loader-items">
            <RAGLoader />
          </div>
        )}
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Select Email Template</Form.Label>
            <Row className="g-2 align-items-center">
              <Col sm={10}>
                <Dropdown
                  className="w-100"
                  show={showDropdown}
                  onToggle={(isOpen) => setShowDropdown(isOpen)}
                >
                  <Dropdown.Toggle
                    className="w-100 text-start text-truncate"
                    variant="light"
                  >
                    {selectedTemplateId
                      ? templates.find((t) => t.id === selectedTemplateId)?.title ||
                      "-- Select Template --"
                      : "-- Select Email Template --"}
                  </Dropdown.Toggle>

                  <Dropdown.Menu className="w-100 mt-1 p-0">
                    {templates.length === 0 ? (
                      <div className="px-3 py-2 text-muted">No templates found</div>
                    ) : (
                      templates.map((template) => (
                        <div
                          key={template.id}
                          className="d-flex justify-content-between align-items-center px-3 py-2 dropdown-item"
                          style={{ cursor: "pointer" }}
                          onClick={() => {
                            setSelectedTemplateId(template.id);
                            setShowDropdown(false); 
                          }}
                        >
                          <span className="text-truncate" style={{ maxWidth: "65%" }}>
                            {template.title}
                          </span>

                          <div className="d-flex gap-2">
                            <i
                              className="bi bi-pencil-square text-primary"
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditModal(template.id);
                              }}
                            />
                            <i
                              className={`bi bi-trash text-danger ${deleteLoading ? "opacity-50" : ""
                                }`}
                              style={{
                                cursor: deleteLoading ? "not-allowed" : "pointer",
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteTemplate(template.id);
                              }}
                            />
                          </div>
                        </div>
                      ))
                    )}
                  </Dropdown.Menu>
                </Dropdown>
              </Col>

              <Col sm={2}>
                <Button
                  variant="outline-success"
                  className="w-100 mt-2 mt-sm-0"
                  onClick={handleAddInfoModal}
                  title="Add New Template"
                >
                  <i className="bi bi-plus-lg" />
                </Button>
              </Col>
            </Row>
          </Form.Group>

          <Form.Group className="my-3">
            <Row className="align-items-center justify-content-between mb-3">
              <Col xs={12} md="auto">
                <h5 className="mb-0">Email Draft</h5>
                {isEditable && (
                  <small className="text-success">
                    <i className="bi bi-check-circle-fill me-1" />
                    Draft is being auto-saved
                  </small>
                )}
              </Col>

              <Col
                xs={12}
                md="auto"
                className="d-flex flex-wrap gap-2 mt-2 mt-md-0"
              >
                <Button
                  variant="success"
                  size="sm"
                  onClick={handleDraftEmail}
                  disabled={!selectedTemplateId || loading}
                >
                  <i className="bi bi-envelope-paper me-1" />
                  Load Template
                </Button>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => openIn("gmail")}
                  disabled={!detail.trim()}
                >
                  <i className="bi bi-google me-1" />
                  Gmail
                </Button>

                <Button
                  variant="info"
                  size="sm"
                  onClick={() => openIn("outlook")}
                  disabled={!detail.trim()}
                >
                  <i className="bi bi-microsoft me-1" />
                  Outlook / M365
                </Button>

                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={handleClearDraft}
                  disabled={!detail.trim()}
                >
                  Clear
                </Button>
              </Col>
            </Row>

            <Form.Control
              as="textarea"
              rows={10}
              value={detail}
              placeholder="Your email draft will appear here..."
              readOnly={!isEditable}
              onChange={(e) => setDetail(e.target.value)}
              className="font-monospace"
              style={{ resize: "vertical" }}
            />
          </Form.Group>
        </Form>

        <Modal
          show={showInfoModal}
          onHide={() => setShowInfoModal(false)}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>Add New Email Template</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Template Title</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g., Rent Reminder"
                value={newInfoTitle}
                onChange={(e) => setNewInfoTitle(e.target.value)}
              />
              <div className="d-flex flex-wrap gap-2 mt-3">
                {[
                  "Rent Reminder",
                  "Lease Renewal Notice",
                  "Payment Acknowledgement",
                  "Maintenance Update",
                  "Late Fee Notice",
                  "Welcome New Tenant",
                  "Vacate Notice",
                ].map((suggestion) => (
                  <Button
                    key={suggestion}
                    size="sm"
                    variant={
                      newInfoTitle === suggestion
                        ? "success"
                        : "outline-secondary"
                    }
                    onClick={() => setNewInfoTitle(suggestion)}
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </Form.Group>

            <Form.Group>
              <Form.Label>Template Content</Form.Label>
              <Form.Control
                as="textarea"
                rows={6}
                placeholder="Write the email body template here..."
                value={newInfoContent}
                onChange={(e) => setNewInfoContent(e.target.value)}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowInfoModal(false)}>
              Cancel
            </Button>
            <Button
              variant="success"
              onClick={handleSubmitInfo}
              disabled={loading}
            >
              {loading ? "Adding..." : "Add Template"}
            </Button>
          </Modal.Footer>
        </Modal>

        <Modal
          show={showEditModal}
          onHide={() => setShowEditModal(false)}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>Edit Email Template</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Template Title</Form.Label>
              <Form.Control
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Template Content</Form.Label>
              <Form.Control
                as="textarea"
                rows={6}
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleUpdateTemplate}
              disabled={loading}
            >
              {loading ? "Updating..." : "Update Template"}
            </Button>
          </Modal.Footer>
        </Modal>
      </Card>
    </>
  );
};
