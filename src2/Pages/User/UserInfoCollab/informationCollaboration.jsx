import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Spinner, Form, Button, Card } from "react-bootstrap";
import { toast } from "react-toastify";
import "bootstrap-icons/font/bootstrap-icons.css";
import { FeedbackSubmit } from "../../../Networking/User/APIs/Feedback/feedbackApi";

export const InformationCollaboration = () => {
  const dispatch = useDispatch();

  const [feedback, setFeedback] = useState("");
  const [category, setCategory] = useState("");
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/png",
      "image/jpeg",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Only PDF, DOC, DOCX, PNG, JPG allowed");
      return;
    }

    setDocument(file);
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  if (!feedback.trim()) return toast.error("Please enter some information.");
  if (!category) return toast.error("Please select a category.");

  const formData = new FormData();
  formData.append("feedback", feedback);
  formData.append("category", category);
  if (document) formData.append("file", document); 

  try {
    setLoading(true);
    const resultAction = await dispatch(FeedbackSubmit(formData));

    if (FeedbackSubmit.fulfilled.match(resultAction)) {
      toast.success("Feedback submitted successfully!");
      setFeedback("");
      setCategory("");
      setDocument(null);
    } else {
      toast.error(resultAction.payload || "Something went wrong!");
    }
  } catch (error) {
    console.error(error);
    toast.error("Something went wrong!");
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="container-fuild d-flex flex-column align-items-center">
      <Card
        className="p-4 shadow-lg border-0 rounded-4 mb-5"
        style={{ width: "100%", maxWidth: 500, background: "#f8f9fa" }}
      >
        <Form onSubmit={handleSubmit}>
        
          <Form.Group className="mb-4">
            <Form.Label className="fw-semibold">Select Category</Form.Label>
            <Form.Select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{ borderRadius: "12px" }}
            >
              <option value="">-- Select category --</option>
              <option value="ContactInfo">Contact Info</option>
              <option value="ThirdParty">Third Party</option>
              <option value="Colleague">Employee</option>
              <option value="Comps">Comps</option>
              <option value="Gemini">Gemini</option>
              <option value="BuildingInfo">Building Info</option>
              <option value="ComparativeBuilding">
                Comparative Building Info
              </option>
              <option value="LOI">LOI</option>
              <option value="Lease">Lease Agreement</option>
              <option value="portfolio">Portfolio</option>
              <option value="SubleaseTracker">Sublease Tracker</option>
              <option value="TenantMarket">Tenant Market</option>
            </Form.Select>
          </Form.Group>

          
          <Form.Group className="mb-4">
            <Form.Label className="fw-semibold">Share Information</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              placeholder="Share here..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              style={{ resize: "none", borderRadius: "12px" }}
            />
          </Form.Group>

        
          <Form.Group className="mb-4">
            <Form.Label className="fw-semibold">
              Upload Document (Optional)
            </Form.Label>
            <Form.Control
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
            />
            {document && (
              <small className="text-muted">
                Selected: {document.name}
              </small>
            )}
          </Form.Group>

          <div className="text-center">
            <Button
              type="submit"
              className="px-5 py-2 fw-semibold"
              style={{
                borderRadius: "25px",
                background: "#007bff",
                border: "none",
                fontSize: "16px",
              }}
              disabled={loading}
            >
              {loading ? <Spinner size="sm" animation="border" /> : "Submit"}
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};
