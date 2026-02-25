import { BuildingList } from "../../../Component/BuildingList";
import { ListBuildingSubmit } from "../../../Networking/Admin/APIs/BuildingApi";

export const ComparativeUserBuildinglist = () => {
  return (
    <BuildingList
      title="Comparative Building List"
      fetchAction={ListBuildingSubmit}
      category="ComparativeBuilding"
      selector={(state) => ({
        data: state.BuildingSlice.BuildingList,
        loading: state.BuildingSlice.loading,
      })}
      searchKey="address"
      navigateTo="/comparative-building-chat"
      navigateStateMapper={(building) => ({
        office: { buildingId: building.id },
      })}
    />
  );
};
