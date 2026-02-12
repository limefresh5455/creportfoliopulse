import React, { useState } from "react";
import { Button, Card, Container, Row, Col } from "react-bootstrap";
import { AdminInformationCollaboration } from "../../Admin/InformationCollaboration/adminInformationCollaboration";
import { InformationCollaboration } from "../UserInfoCollab/informationCollaboration";

export const InformationCollaborationPage = () => {
  const [activeTab, setActiveTab] = useState("form");

  const headerTitle = "Information Collaboration";

  return (
    <>
      <div
        className="px-3 py-3 sticky-top"
        style={{ backgroundColor: "#212529", zIndex: 10 }}
      >
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2">
          <h5 className="text-white m-0 mx-4 text-center text-md-start mb-2 mb-md-0">{headerTitle}</h5>

          <div className="d-flex gap-2 flex-wrap justify-content-center  justify-content-md-end mx-4">
            <Button
              size="sm"
              variant={activeTab === "form" ? "light" : "outline-light"}
              onClick={() => setActiveTab("form")}
            >
              Information Collaboration
            </Button>

            <Button
              size="sm"
              variant={activeTab === "list" ? "light" : "outline-light"}
              onClick={() => setActiveTab("list")}
            >
              Collaboration List
            </Button>
          </div>
        </div>
      </div>

      <Container fluid className="mt-5">
        <Row>
          <Col xs={12}>
            <Card className="border-0 no-shadow-hover">
              {activeTab === "form" && <InformationCollaboration />}
              {activeTab === "list" && <AdminInformationCollaboration />}
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};
