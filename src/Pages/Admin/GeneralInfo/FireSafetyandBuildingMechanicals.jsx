import DocumentManager from "../../../Component/DocumentManager";
import { useLocation } from "react-router-dom";

export const FireSafetyandBuildingMechanicals = () => {
  const location = useLocation();
  const buildingId = location.state?.office?.buildingId;
  const category = "FireSafety";

  return (
    <DocumentManager
      category={category}
      title="Fire Safety and Building Mechanicals"
      description={`Upload and manage documents for ${category}`}
      building_Id={buildingId}
    />
  );
};
