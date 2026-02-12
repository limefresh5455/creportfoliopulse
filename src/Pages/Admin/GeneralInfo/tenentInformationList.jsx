import { AdminBuildingManager } from "../../../Component/AdminBuildingManager";
import {
  CreateBuildingSubmit,
  DeleteBuilding,
  ListBuildingSubmit,
  UpdateBuildingSubmit,
} from "../../../Networking/Admin/APIs/BuildingApi";

export const TenentInfoBuildingList = () => (
  <AdminBuildingManager
    category="TenantInformation"
    heading="Tenant Information Building List"
    fetchAction={ListBuildingSubmit}
    createAction={CreateBuildingSubmit}
    updateAction={UpdateBuildingSubmit}
    deleteAction={DeleteBuilding}
    navigateTo="/tenant-info-upload"
    navigateStateMapper={(b) => ({ office: { buildingId: b.id } })}
  />
);
