import { useLocation } from "react-router-dom";
import { ChatWindow } from "../../../Component/ChatWindow";

export const DCTChat = () => {
  const location = useLocation();

  const category = location?.state?.category;

  return <ChatWindow category={category} heading="💬 DCT Chat" />;
};
