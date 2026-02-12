import { AdminBuildingManager } from "../../../Component/AdminBuildingManager";
import {
  DeleteBuilding,
  ListBuildingSubmit,
  CreateBuildingSubmit,
  UpdateBuildingSubmit,
} from "../../../Networking/Admin/APIs/BuildingApi";

export const ComparativeBuildingList = () => (
  <AdminBuildingManager
    category="ComparativeBuilding"
    heading="Comparative Building List"
    fetchAction={ListBuildingSubmit}
    createAction={CreateBuildingSubmit}
    updateAction={UpdateBuildingSubmit}
    deleteAction={DeleteBuilding}
    navigateTo="/comparative-building-chat"
    navigateStateMapper={(b) => ({ office: { buildingId: b.id } })}
  />
);
