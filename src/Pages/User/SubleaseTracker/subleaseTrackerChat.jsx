import { useLocation } from "react-router-dom";
import { ChatWindow } from "../../../Component/ChatWindow";

export const SubleaseTrackerChat = () => {
  const location = useLocation();
  const buildingId = location?.state?.office?.buildingId;
  return (
    <ChatWindow
      category="SubleaseTracker"
      heading="💬 Sublease Tracker"
      building_id={buildingId}
    />
  );
};
