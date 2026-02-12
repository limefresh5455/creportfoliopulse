import React from "react";
import { Card, Button, Container, Row, Col } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

export const LeaseList = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const initialBuildings = location?.state?.office;
  const id = initialBuildings?.buildingId;

  const handleLease = (Building_id) => {
    navigate("/admin-lease-loi-upload", {
      state: {
        office: { Building_id, type: "Lease" },
      },
    });
  };

  const handleLOI = (Building_id) => {
    navigate("/admin-lease-loi-upload", {
      state: {
        office: { Building_id, type: "LOI" },
      },
    });
  };

  return (
    <>
      <div
        className="text-center bg-white py-3 mb-4 shadow-sm"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          borderBottom: "1px solid #dee2e6",
        }}
      >
        <h4 className="fw-bold px-3 mt-4">
          Select Section to Upload Lease Agreement or Letter of Intent
        </h4>
      </div>

      <div className="px-3 mb-4 d-flex justify-content-center justify-content-md-start">
        <div
          className="bg-dark text-white py-2 d-flex align-items-center justify-content-center gap-2"
          onClick={() => navigate(-1)}
          style={{
            cursor: "pointer",
            width: "110px",
            borderRadius: 10,
          }}
        >
          <FaArrowLeft size={16} />
          <span>Back</span>
        </div>
      </div>

      <Container className="pb-5">
        <Row className="justify-content-center g-4">
          <Col xs={12} sm={10} md={6} lg={5}>
            <Card className="shadow-lg border-0 h-100">
              <Card.Body className="d-flex flex-column justify-content-center align-items-center text-center p-4">
                <Card.Title className="fs-4 mb-3">Lease Agreement</Card.Title>
                <Card.Text className="fs-6 mb-4">
                  Upload documents related to <strong>Lease Agreement</strong>{" "}
                  here.
                </Card.Text>
                <Button
                  variant="dark"
                  size="lg"
                  className="w-100"
                  onClick={() => handleLease(id)}
                >
                  Upload Lease Agreement
                </Button>
              </Card.Body>
            </Card>
          </Col>

          <Col xs={12} sm={10} md={6} lg={5}>
            <Card className="shadow-lg border-0 h-100">
              <Card.Body className="d-flex flex-column justify-content-center align-items-center text-center p-4">
                <Card.Title className="fs-4 mb-3">Letter of Intent</Card.Title>
                <Card.Text className="fs-6 mb-4">
                  Upload documents related to <strong>Letter of Intent</strong>{" "}
                  here.
                </Card.Text>
                <Button
                  variant="dark"
                  size="lg"
                  className="w-100"
                  onClick={() => handleLOI(id)}
                >
                  Upload Letter of Intent
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};
