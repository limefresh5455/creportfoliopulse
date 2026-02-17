import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { useState, useEffect, useMemo } from "react";
import { EmailDraftingProvider } from "../Context/EmailDraftingContext";
import { EmailDraftingModal } from "../Component/EmailDraftingModal";
import { useEmailDrafting } from "../Context/EmailDraftingContext";

const GlobalEmailDraftingButton = () => {
  const { openEmailDraftingModal } = useEmailDrafting();
  return (
    <button
      onClick={openEmailDraftingModal}
      style={{
        position: "fixed",
        bottom: "85px",
        right: "20px",
        zIndex: 1050,
        width: "45px",
        height: "45px",
        borderRadius: "50%",
        backgroundColor: "#057405",
        color: "white",
        border: "none",
        boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "20px",
      }}
      title="Open Email Drafting"
    >
      <i className="bi bi-envelope-paper" />
    </button>
  );
};

export const DashboardLayout = () => {
  const [collapsed, setCollapsed] = useState(true);
  const location = useLocation();
  const [isChatPage, setIsChatPage] = useState(false);

  const emailDraftingButtonRoutes = useMemo(
    () => [
      "/tenant-information-chat",
      "/tenant-info-upload",
      "/tenent-info-user-building-list",
      "/tenant-info-building-list",

      "/building-chat",
      "/user-building-info-list",
      "/comparative-building-chat",
      "/comparative-user-building-list",
      "/comparative-building-upload",
      "/building-info-list",
      "/building-info-upload",

      "/comps-chat",
      "/comps-upload",

      "/tenant-market",
      "/tenants-market-upload",

      "/third-party-chat",
      "/third-party-upload",
    ],
    [],
  );

  const showEmailButton = useMemo(
    () =>
      emailDraftingButtonRoutes.some((path) =>
        location.pathname.startsWith(path),
      ),
    [location.pathname, emailDraftingButtonRoutes],
  );

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
      // "/email-drafting",
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
      "/tenant-info-building-list",
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
    <EmailDraftingProvider>
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

        {showEmailButton && <GlobalEmailDraftingButton />}
        <EmailDraftingModal />
      </div>
    </EmailDraftingProvider>
  );
};
