import { AdminBuildingManager } from "../../../Component/AdminBuildingManager";
import {
  CreateBuildingSubmit,
  DeleteBuilding,
  ListBuildingSubmit,
  UpdateBuildingSubmit,
} from "../../../Networking/Admin/APIs/BuildingApi";

export const FireSafetyBuildingList = () => (
  <AdminBuildingManager
    category="FireSafety"
    heading="Fire Safety & Mechanical Buildings"
    fetchAction={ListBuildingSubmit}
    createAction={CreateBuildingSubmit}
    updateAction={UpdateBuildingSubmit}
    deleteAction={DeleteBuilding}
    navigateTo="/upload-fire-safety-building-mechanicals"
    navigateStateMapper={(b) => ({ office: { buildingId: b.id } })}
  />
);
