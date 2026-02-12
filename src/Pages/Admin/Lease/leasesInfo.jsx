import React from "react";
import { useLocation } from "react-router-dom";
import DocumentManager from "../../../Component/DocumentManager";

export const LeaseInfomation = () => {
  const location = useLocation();
  const initialBuildings = location.state?.office;

  return (
      <DocumentManager
        category={initialBuildings.type}
        title={initialBuildings.type == "LOI" ? "Letter of Intent Documents" : "Lease Agreement"}
        description={initialBuildings.type == "LOI" ? "Upload and manage Letter of Intent-related documents" : "Upload and manage Lease Agreement-related documents"}
        building_Id={initialBuildings.Building_id}
      />
  );
};
