import React from "react";
import DocumentManager from "../../../Component/DocumentManager";
import { useLocation } from "react-router-dom";
export const ComparativeBuildingData = () => {
  const location = useLocation();

  const buildingId = location?.state?.office?.buildingId;
  return (
    <DocumentManager
      category="ComparativeBuilding"
      title="Comparative Building"
      description="Upload and manage documents for Comparative Building"
      building_Id={buildingId}
    />
  );
};
