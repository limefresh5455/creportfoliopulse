import { BuildingList } from "../../../Component/BuildingList";
import { ListBuildingSubmit } from "../../../Networking/Admin/APIs/BuildingApi";

export const FireSafetyandBuildingList = () => {
  return (
    <BuildingList
      title="Fire Safety and Building Mechanicals"
      category="FireSafety"
      fetchAction={ListBuildingSubmit}
      selector={(state) => ({
        data: state.BuildingSlice.BuildingList,
        loading: state.BuildingSlice.loading,
      })}
      searchKey="address"
      navigateTo="/user-fire-safety-building-mechanicals"
      navigateStateMapper={(building) => ({
        office: { buildingId: building.id },
      })}
    />
  );
};
