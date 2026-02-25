import { useLocation } from "react-router-dom";
import DocumentManager from "../../../Component/DocumentManager";

export const Loi = () => {
  const location = useLocation();
  const { buildingId } = location.state || {};

  return (
    <DocumentManager
      category={"LOI"}
      title="Letter of Intent Documents"
      description={"Upload and manage Letter of Intent-related documents"}
      building_Id={buildingId}
    />
  );
};
