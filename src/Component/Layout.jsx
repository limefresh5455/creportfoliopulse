import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { useState, useEffect } from "react";

export const DashboardLayout = () => {
  const [collapsed, setCollapsed] = useState(true);
  const location = useLocation();
  const [isChatPage, setIsChatPage] = useState(false);

  useEffect(() => {
    const chatRoutes = [
      "/user-lease-loi-chat",
      "/portfolio-chat",
      "/third-party-chat",
      "/employee-info-chat",
      "/building-chat",
      "/comps-chat",
      "/user-fire-safety-building-mechanicals",
      "/user-fire-safety-building-mechanicals-list",
      "/upload-fire-safety-building-mechanicals",
      "/admin-fire-safety-building-mechanicals-list",
      "/comparative-building-chat",
      "/tenant-information-chat",
      "/tenant-info-upload",
      "/tenant-market",
      "/documents/LOI",
      "/gemini-chat",
      "/portfolio-forum",
      "/dashboard",
      "/email-drafting",
      "/notes",
      "/ai-lease-abstract-upload",
      "/information-collaboration",
      "/benchmark",
      "/distilled-comp-tracker",
      "/user-sublease-tracker-list",
      "/calculator",
      "/user-building-info-list",
      "/deals/",
      "/comparative-user-building-list",
      "/comparative-building-upload",
      "/tenent-info-user-building-list",
      "/sublease-tracker-form",
      "/user-sublease-tracker",
      "/user-renewal-tracker-list",
      "/renewal-tracker-form",
      "/user-renewal-tracker-form",
      "/user-lease-loi-building-list",
      "/tours",
      "/deal-list",
      "/user-profile",
      "/history",
      "/chat/",
      "/deals/new",
      "/user-select-lease-loi",
      "/cre-news",
      "/messages",
      "/yardi",
      "/project-management",
      "/projects",
      "/work-letter",
      //Admin Routes
      "/admin-dashboard",
      "/user-management",
      "/aianalytics",
      "/rag-system",
      "/portfolio-voice",
      "/admin-portfolio-forum",
      "/lease-drafting-upload",
      "/admin-information-collaboration",
      "/distilled-expense-tracker",
      "/admin-distilled-comp-tracker",
      "/space-inquiry",
      "/third-party-upload",
      "/employee-contact-upload",
      "/comps-upload",
      "/fire-safety-building-mechanicals",
      "/comparative-building-list",
      "/tenent-info-building-list",
      "/tenants-market-upload",
      "/building-info-list",
      "/Select_Building_Category",
      "/sublease-tracker-list",
      "/admin-renewal-tracker-list",
      "/admin-tours",
      "/admin-lease-loi-building-list",
      "/admin-select-lease-loi",
      "/admin-lease-loi-upload",
      "/building-info-upload",
    ];

    const isChat = chatRoutes.some((path) =>
      location.pathname.startsWith(path),
    );
    setIsChatPage(isChat);
  }, [location]);

  return (
    <div
      className={`main-wrapper ${collapsed ? "" : "open"} ${
        isChatPage ? "chat-active" : ""
      }`}
      style={{ height: "100dvh" }}
    >
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      <div
        className={`flex-grow-1 content-wrapper ${
          isChatPage ? "chat-body" : ""
        }`}
      >
        <Outlet />
      </div>
    </div>
  );
};
