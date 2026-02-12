import { BuildingList } from "../../../Component/BuildingList";
import { ListBuildingSubmit } from "../../../Networking/Admin/APIs/BuildingApi";

export const TenentInfoUserBuildinglist = () => {
  return (
    <BuildingList
      title="Tenant Information List"
      category="TenantInformation"
      fetchAction={ListBuildingSubmit}
      selector={(state) => ({
        data: state.BuildingSlice.BuildingList,
        loading: state.BuildingSlice.loading,
      })}
      searchKey="address"
      navigateTo="/tenant-information-chat"
      navigateStateMapper={(building) => ({
        office: { buildingId: building.id },
        address: { address: building.address },
      })}
    />
  );
};
