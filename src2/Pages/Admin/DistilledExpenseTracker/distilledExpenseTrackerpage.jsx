import React, { useState } from "react";
import { Button, Card, Container, Row, Col } from "react-bootstrap";
import { DistilledExpenseTracker } from "./distilledExpenseTracker";
import { DistilledExpenseTrackerlist } from "./distilledExpenseTrackerlist";

export const DistilledExpenseTrackerPage = () => {
  const [activeTab, setActiveTab] = useState("form");

  const headerTitle =
    activeTab === "form" ? "Add Submission" : "Submissions List";

  return (
    <>
      <div
        className="px-3 py-3 sticky-top"
        style={{ backgroundColor: "#212529", zIndex: 10 }}
      >
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2">
          <h5 className="text-white m-0 text-center text-md-start mb-2 mb-md-0">{headerTitle}</h5>
          <div className="d-flex flex-wrap gap-2">
            <Button
              variant={activeTab === "form" ? "light" : "outline-light"}
              onClick={() => setActiveTab("form")}
              className="flex-grow-1 flex-md-grow-0"
            >
              Add Submission
            </Button>
            <Button
              variant={activeTab === "list" ? "light" : "outline-light"}
              onClick={() => setActiveTab("list")}
              className="flex-grow-1 flex-md-grow-0"
            >
              View Submissions
            </Button>
          </div>
        </div>
        </div>
        

      <Row className="justify-content-center ">
        <Col md={12}>
          <Card className="shadow-sm border-0">
            {activeTab === "form" && <DistilledExpenseTracker />}
            {activeTab === "list" && <DistilledExpenseTrackerlist />}
          </Card>
        </Col>
      </Row>
    </>
  );
};
