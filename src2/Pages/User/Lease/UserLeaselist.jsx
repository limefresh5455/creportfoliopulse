import React from "react";
import { Card, Button, Container, Row, Col } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

export const UserLeaseList = () => {
  const location = useLocation();

  const navigate = useNavigate();
  const initialBuildings = location.state?.office;

  const handleLease = (initialBuildings, type) => {
    navigate("/user-lease-loi-chat", { state: { Building_id: initialBuildings, type } });
  };

  return (
    <>
      <div
        className="text-center agreement_header bg-dark animate__animated animate__fadeInDown"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          marginBottom: "30px",
          borderBottom: "1px solid #dee2e6",
        }}
      >
        <h5 className="heading_lease text-center text-light mb-0 px-3">
          Select Section to Chat with Lease Agreement or Letter of Intent
        </h5>
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
                  onClick={() =>
                    handleLease(initialBuildings?.buildingId, "Lease")
                  }
                >
                  Chat with Lease Agreement
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
                  onClick={() =>
                    handleLease(initialBuildings?.buildingId, "LOI")
                  }
                >
                  Chat with Letter of Intent
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};
