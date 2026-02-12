import React from "react";
import DocumentManager from "../../../Component/DocumentManager";
import { useLocation } from "react-router-dom";
export const TenantInformationUpload = () => {
  const location = useLocation();

  const buildingId = location?.state?.office?.buildingId;
  return (
    <DocumentManager
      category="TenantInformation"
      title="Tenant Information"
      description="Upload and manage documents for Tenant Information"
      building_Id={buildingId}
    />
  );
};
