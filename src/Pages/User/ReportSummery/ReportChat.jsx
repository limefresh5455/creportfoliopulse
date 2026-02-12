import { useLocation } from "react-router-dom";
import { ChatWindow } from "../../../Component/ChatWindow";

export const ReportChat = () => {
  const location = useLocation();

  const data = location?.state;

  return (
    <ChatWindow
      category="report_generation"
      fileId={data.fileId}
      heading="💬 Summerizar Chat"
    />
  );
};
