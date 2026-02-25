import React, { useState } from "react";
import { Form, Button, Card, Row, Col } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { toursCreateSubmit } from "../../../../Networking/User/APIs/Tours/toursApi";

export const Tours = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    date: "",
    building: "",
    floor_suite: "",
    tenant: "",
    broker: "",
    notes: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.date || !formData.building) {
      toast.error("Please fill in required fields (Date & Building)");
      return;
    }

    setLoading(true);

    try {
      await dispatch(toursCreateSubmit(formData)).unwrap();
      toast.success("Tour created successfully");

      setFormData({
        date: "",
        building: "",
        floor_suite: "",
        tenant: "",
        broker: "",
        notes: "",
      });
    } catch (err) {
      toast.error("Failed to Add tour");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card className="p-3 shadow-sm border-0">
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Date *</Form.Label>
                <Form.Control
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Building *</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter building name"
                  name="building"
                  value={formData.building}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Floor / Suite</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="e.g., 5th Floor, Suite 510"
                  name="floor_suite"
                  value={formData.floor_suite}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Tenant</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter tenant name"
                  name="tenant"
                  value={formData.tenant}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Broker</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter broker name"
                  name="broker"
                  value={formData.broker}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>

            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Label>Notes</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  placeholder="Additional notes about the tour"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>

          <div className="d-flex gap-2 mt-3 ">
            <Button type="submit" variant="success" disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </Button>
          </div>
        </Form>
      </Card>
    </>
  );
};
