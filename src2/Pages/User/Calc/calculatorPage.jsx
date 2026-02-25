import React, { useState } from "react";
import { Button, Card, Container, Row, Col } from "react-bootstrap";
import { LeaseFinanceCalculator } from "./calculator";
import { CommissionCalculator } from "./calcComission";
import { TICalculator } from "./tiCalculator";

export const CalulatorPage = () => {
  const [activeTab, setActiveTab] = useState("finance");

  const getHeaderTitle = () => {
    switch (activeTab) {
      case "finance":
        return "Lease Finance Calculator";
      case "commission":
        return "Commission Calculator";
      case "ti":
        return "TI Calculator";
      default:
        return "Calculator";
    }
  };

  return (
    <>
    
      <div
        className="px-3 py-3 sticky-top"
        style={{ backgroundColor: "#212529", zIndex: 10 }}
      >
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2">
          <h5 className="text-white m-0 mx-4 text-center text-md-start">
            {getHeaderTitle()}
          </h5>

          <div className="d-flex gap-2 flex-wrap justify-content-center justify-content-md-end mx-4">
            <Button
              size="sm"
              variant={activeTab === "finance" ? "light" : "outline-light"}
              onClick={() => setActiveTab("finance")}
            >
              NET Effective Rent
            </Button>

            <Button
              size="sm"
              variant={activeTab === "commission" ? "light" : "outline-light"}
              onClick={() => setActiveTab("commission")}
            >
              Commission Calculator
            </Button>

            <Button
              size="sm"
              variant={activeTab === "ti" ? "light" : "outline-light"}
              onClick={() => setActiveTab("ti")}
            >
              TI Calculator
            </Button>
          </div>
        </div>
      </div>

     
      <Container fluid className="mt-3">
        <Row>
          <Col xs={12}>
            <Card className="no-shadow-hover border-0">
              {activeTab === "finance" && <LeaseFinanceCalculator />}
              {activeTab === "commission" && <CommissionCalculator />}
              {activeTab === "ti" && <TICalculator />}
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};
