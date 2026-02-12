import { useLocation } from "react-router-dom";
import { ChatWindow } from "../../../Component/ChatWindow";

export const TenantInformation = () => {
  const location = useLocation();
  const buildingId = location?.state?.office?.buildingId;
  const address = location?.state?.address?.address;

  return (
    <ChatWindow
      category="TenantInformation"
      heading="💬 Tenant Information"
      building_id={buildingId}
      address={address}
    />
  );
};
