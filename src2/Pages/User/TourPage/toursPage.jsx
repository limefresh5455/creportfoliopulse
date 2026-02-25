import React, { useState } from "react";
import { Button, Card } from "react-bootstrap";
import { ToursDetails } from "./ToursDetails/toursDetails";
import { Tours } from "./Tours/tours";

export const ToursPage = () => {
  const [activeTab, setActiveTab] = useState("form");

  const headerTitle = activeTab === "form" ? "Add Tour" : "Tours List";

  return (
    <>
      <div
        className="d-flex justify-content-between align-items-center px-3 py-3 sticky-top"
        style={{
          backgroundColor: "#212529",
          zIndex: 10,
        }}
      >
        <h5 className="text-white m-0 ms-4">{headerTitle}</h5>

        <div className="d-flex gap-2">
          <Button
            variant={activeTab === "form" ? "light" : "outline-light"}
            onClick={() => setActiveTab("form")}
          >
            Add Tour
          </Button>

          <Button
            variant={activeTab === "list" ? "light" : "outline-light"}
            onClick={() => setActiveTab("list")}
          >
            View Tours
          </Button>
        </div>
      </div>

      <Card className="p-3 shadow-sm border-0 mt-3">
        {activeTab === "form" && <Tours />}
        {activeTab === "list" && <ToursDetails />}
      </Card>
    </>
  );
};
