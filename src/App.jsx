import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./Networking/Admin/Store/Store";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { DashboardLayout } from "./Component/Layout";
import { ListBuilding } from "./Pages/Admin/Building/Buildlist";
import { LeaseInfomation } from "./Pages/Admin/Lease/leasesInfo";
import { LeaseList } from "./Pages/Admin/Lease/Leaselist";
import ProtectedRoute from "./Route/ProtectedRoute";
import { useEffect } from "react";
import { AdminLogin } from "../src/Pages/Admin/Auth/AdminLogin";
import { VerifyOtp } from "../src/Pages/User/Auth/VerifyOTP";
import { Dashboard } from "../src/Pages/User/Dashboard/Dashboard";
import { Login } from "../src/Pages/User/Auth/Login";
import { UserBuildinglist } from "./Pages/User/Building/UserBuildinglist";
import { UserLeaseList } from "./Pages/User/Lease/UserLeaselist";
import { UserProfile } from "./Pages/User/Profile/UserProfile";
import { UserChat } from "./Pages/User/Chat/ChatUser";
import { PortfolioChat } from "./Pages/User/PortfolioChat/portfolioChat";
import { ForgotPassword } from "./Pages/User/Auth/ForgetPassword";
import { ResetPassword } from "./Pages/User/Auth/ResetPassword";
import { Approved_Denied_list } from "./Pages/Admin/Approved_Denied_list";
import { Home } from "./Pages/Home";
import { BrokerChat } from "./Pages/User/Broker/Broker";
import { ColleagueChat } from "./Pages/User/Colleague/Colleague";
import { BuildingChat } from "./Pages/User/BuildingChat/BuildingChat";
import { MarketChat } from "./Pages/User/Market/Market";
import { AdminDashboard } from "./Pages/Admin/DashBoard/AdminDashboard";
import { UserManagement } from "./Pages/Admin/UserManagement/UserManagement";
import { RagSystem } from "./Pages/Admin/RagSystem/RagSystem";
import { Thirdparty } from "./Pages/Admin/GeneralInfo/Thirdparty";
import { EmployContact } from "./Pages/Admin/GeneralInfo/EmployContact";
import { CompsUpload } from "./Pages/Admin/GeneralInfo/MarketIntelligence";
import { BuildingInfo } from "./Pages/Admin/GeneralInfo/BuildingInfo";
import { Aianalytics } from "./Pages/Admin/AIanalytics/AiAnaylistics";
import { SessionList } from "./Pages/User/Session/sessionList";
import { LeaseAbstractUpload } from "./Pages/Admin/LeaseAbstract/LeaseAbstractUpload";
import { AdminManagement } from "./Pages/SuperAdmin/AdminManagement/AdminManagement";
import { ComparativeBuildingData } from "./Pages/Admin/ComparativeBuilding/comparetiveBuilding";
import { ComparativeBuildingChat } from "./Pages/User/ComparativeBuilding/comparativeBuilding";
import { TenantMarket } from "./Pages/User/TenantMarket/tenantMarket";
import { TenantMarketUpload } from "./Pages/Admin/GeneralInfo/TenantMarket";
import { TenantInformation } from "./Pages/User/TenantInformation/tenantInformationChat";
import { TenantInformationUpload } from "./Pages/Admin/GeneralInfo/TenantInformation";
import { LeaseDraftingUpload } from "./Pages/Admin/LeaseDrafting/leaseDrafting";
import { EmailDrafting } from "./Pages/User/EmailDrafting/emailDrafting";
import { GeminiChat } from "./Pages/User/GeminiChat/geminiChat";
import { ToursDetails } from "./Pages/User/TourPage/ToursDetails/toursDetails";
import { ToursPage } from "./Pages/User/TourPage/toursPage";
import { PortfolioForum } from "./Pages/User/Forum/forum";
import { CreateThread } from "./Pages/User/Forum/createThread";
import { ComparativeBuildingList } from "./Pages/Admin/ComparativeBuilding/comparativeBuildinglist";
import { BuildingInfoList } from "./Pages/Admin/GeneralInfo/BuildingInfoList";
import { ComparativeUserBuildinglist } from "./Pages/User/ComparativeBuilding/comparativeUserBuildinglist";
import { UserBuildingInfolist } from "./Pages/User/BuildingChat/userBuildingInfoList";
import { TenentInfoUserBuildinglist } from "./Pages/User/TenantInformation/tenentInformationList";
import { TenentInfoBuildingList } from "./Pages/Admin/GeneralInfo/tenentInformationList";
import { Benchmark } from "./Pages/User/DistilledExpenseTracker/benchmark";
import { DistilledExpenseTrackerPage } from "./Pages/Admin/DistilledExpenseTracker/distilledExpenseTrackerpage";
import { SubleaseTrackerList } from "./Pages/Admin/SubleaseTracker/subleaseTrackerList";
import { SubleaseTracker } from "./Pages/Admin/SubleaseTracker/subleaseTracker";
import { Notes } from "./Pages/User/Notes/notes";
import { SpaceInquiry } from "./Pages/Admin/SpaceInquiry/spaceInquiry";
import DealList from "./Pages/User/DealTracker/dealList";
import DealDetailView from "./Pages/User/DealTracker/dealDetailView";
import DealForm from "./Pages/User/DealTracker/dealForm";
import { RenewalTrackerList } from "./Pages/User/RenewalTracker/renewalTrackerList";
import { RenewalTracker } from "./Pages/User/RenewalTracker/renewalTracker";
import { CalulatorPage } from "./Pages/User/Calc/calculatorPage";
import { AdminInformationCollaboration } from "./Pages/Admin/InformationCollaboration/adminInformationCollaboration";
import { SelectBuildingCategory } from "./Pages/Admin/Building/selectBuildingCategory";
import { CreNews } from "./Pages/User/CreNews/creNews";
import { InformationCollaborationPage } from "./Pages/User/UserInformationCollaboration/informationCollaborationpages";
import { DestilledCompTracker } from "./Pages/Admin/DistilledCompTracker/distilledCompTracker";
import { DistilledCompTrackerPage } from "./Pages/User/DistilledCompTracker/distilledCompTrackerPage";
import { DCTChat } from "./Pages/User/DistilledCompTracker/distilledCompChat";
import { Yardi } from "./Pages/User/Yardi/yardi";
import { PortfolioVoice } from "./Pages/Admin/PortfolioVoice/PortfolioVoice";
import { Loi } from "./Pages/User/Chat/loiUpload";
// import { WebSocketProvider } from "./Context/WebSocketContext";
import { ChatLayout } from "./Component/ChatSystem/chatSystemLayout";
import { ChatList } from "./Component/ChatSystem/chatSystemList";
import { UserListScreen } from "./Component/ChatSystem/userListScreen";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { NoAccess } from "./Component/notAccess";
import { WorkLetter } from "./Pages/User/ProjectManagement/workLetter";
import { ProjectList } from "./Pages/User/ProjectManagement/projectList";
import { FireSafetyandBuildingMechanicals } from "./Pages/Admin/GeneralInfo/FireSafetyandBuildingMechanicals";
import { FireSafetyandBuildingMechanicalsChat } from "./Pages/User/FireSafetyandBuildingMechanicals/firesafetybuildingmechanicalschat";
import { AdminDetails } from "./Pages/SuperAdmin/adminDetails";
import { FireSafetyandBuildingList } from "./Pages/User/FireSafetyandBuildingMechanicals/fireSafetyBuildingList";
import { FireSafetyBuildingList } from "./Pages/Admin/FireSafetyandBuildingMechenical/fireSafety&BuildingMechenicalList";
import { WebSocketProvider } from "./Context/WebSocketContext";
import { CreateGroupScreen } from "./Component/ChatSystem/GroupChat/CreateGroupScreen";
import { RoleBasedRedirect } from "./Route/roleBasedRedirect";

function App() {
  useEffect(() => {
    const expiry = sessionStorage.getItem("tokenExpiry");

    if (expiry && Date.now() > parseInt(expiry)) {
      toast.warning("Your session has expired.");
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("auth");
      sessionStorage.removeItem("tokenExpiry");
      window.location.href = "/";
    }
  }, []);

  return (
    <Provider store={store}>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        <WebSocketProvider>
          <Router>
            <Routes>
              {/* <Route path="/" element={<Home />} /> */}
              <Route path="/" element={<Login />} />
              <Route path="/verify-otp" element={<VerifyOtp />} />
              <Route path="/admin-login" element={<AdminLogin />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route
                element={
                  <ProtectedRoute allowedRoles={["superuser"]}>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/admin-management" element={<AdminManagement />} />
                <Route
                  path="/super-admin/admin-details"
                  element={<AdminDetails />}
                />
              </Route>
              <Route
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/admin-dashboard" element={<AdminDashboard />} />

                <Route path="/user-management" element={<UserManagement />} />
                <Route path="/aianalytics" element={<Aianalytics />} />
                <Route path="/rag-system" element={<RagSystem />} />
                <Route path="/portfolio-voice" element={<PortfolioVoice />} />

                <Route
                  path="/lease-drafting-upload"
                  element={<LeaseDraftingUpload />}
                />

                <Route path="/third-party-upload" element={<Thirdparty />} />
                <Route
                  path="/employee-contact-upload"
                  element={<EmployContact />}
                />
                <Route path="/comps-upload" element={<CompsUpload />} />
                <Route
                  path="/tenants-market-upload"
                  element={<TenantMarketUpload />}
                />
                <Route
                  path="/building-info-upload"
                  element={<BuildingInfo />}
                />
                <Route
                  path="/building-info-list"
                  element={<BuildingInfoList />}
                />
                <Route
                  path="/admin-fire-safety-building-mechanicals-list"
                  element={<FireSafetyBuildingList />}
                />
                <Route
                  path="/upload-fire-safety-building-mechanicals"
                  element={<FireSafetyandBuildingMechanicals />}
                />

                <Route
                  path="/tenant-info-upload"
                  element={<TenantInformationUpload />}
                />
                <Route
                  path="/tenent-info-building-list"
                  element={<TenentInfoBuildingList />}
                />
                <Route path="/admin-tours" element={<ToursDetails />} />
                <Route
                  path="/admin-lease-loi-building-list"
                  element={<ListBuilding />}
                />
                <Route
                  path="/Select_Building_Category"
                  element={<SelectBuildingCategory />}
                />

                <Route path="/admin-select-lease-loi" element={<LeaseList />} />

                <Route
                  path="/admin-lease-loi-upload"
                  element={<LeaseInfomation />}
                />

                <Route
                  path="/Approved_Denied_list"
                  element={<Approved_Denied_list />}
                />

                <Route
                  path="/comparative-building-upload"
                  element={<ComparativeBuildingData />}
                />

                <Route
                  path="/comparative-building-list"
                  element={<ComparativeBuildingList />}
                />

                <Route
                  path="/admin-information-collaboration"
                  element={<AdminInformationCollaboration />}
                />

                <Route
                  path="/distilled-expense-tracker"
                  element={<DistilledExpenseTrackerPage />}
                />
                <Route
                  path="/admin-distilled-comp-tracker"
                  element={<DestilledCompTracker />}
                />

                <Route
                  path="/sublease-tracker-form"
                  element={<SubleaseTracker />}
                />
                <Route
                  path="/sublease-tracker-list"
                  element={<SubleaseTrackerList />}
                />
                <Route
                  path="/renewal-tracker-form"
                  element={<RenewalTracker />}
                />

                <Route
                  path="/admin-renewal-tracker-list"
                  element={<RenewalTrackerList />}
                />

                <Route
                  path="/admin-portfolio-forum"
                  element={<PortfolioForum />}
                />
                <Route path="/create-forum" element={<CreateThread />} />

                <Route path="/space-inquiry" element={<SpaceInquiry />} />
              </Route>
              <Route
                element={
                  <ProtectedRoute allowedRoles={["admin", "user", "superuser"]}>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/no-access" element={<NoAccess />} />
                <Route path="*" element={<RoleBasedRedirect />} />
              </Route>
              <Route
                element={
                  <ProtectedRoute allowedRoles={["user"]}>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/dashboard" element={<Dashboard />} />

                <Route path="/portfolio-chat" element={<PortfolioChat />} />

                <Route path="/cre-news" element={<CreNews />} />

                <Route path="/documents/LOI" element={<Loi />} />

                <Route path="/chat/:conversationId" element={<ChatLayout />} />
                <Route path="/chat/users" element={<UserListScreen />} />
                <Route
                  path="/chat/new/:receiverId/:name"
                  element={<ChatLayout />}
                />
                <Route
                  path="/chat/create-group"
                  element={<CreateGroupScreen />}
                />

                <Route path="/email-drafting" element={<EmailDrafting />} />

                <Route path="/gemini-chat" element={<GeminiChat />} />

                <Route path="/notes" element={<Notes />} />

                <Route path="/portfolio-forum" element={<PortfolioForum />} />

                <Route
                  path="/ai-lease-abstract-upload"
                  element={<LeaseAbstractUpload />}
                />

                <Route
                  path="/information-collaboration"
                  element={<InformationCollaborationPage />}
                />

                <Route path="/benchmark" element={<Benchmark />} />

                <Route
                  path="/distilled-comp-tracker"
                  element={<DistilledCompTrackerPage />}
                />
                <Route path="/dct-chat" element={<DCTChat />} />

                <Route path="/calculator" element={<CalulatorPage />} />

                <Route path="/yardi" element={<Yardi />} />

                <Route path="/messages" element={<ChatList />} />
                <Route path="/project-management" element={<ListBuilding />} />
                <Route path="/projects" element={<ProjectList />} />
                <Route path="/work-letter" element={<WorkLetter />} />

                <Route path="/third-party-chat" element={<BrokerChat />} />

                <Route path="/employee-info-chat" element={<ColleagueChat />} />

                <Route
                  path="/user-building-info-list"
                  element={<UserBuildingInfolist />}
                />
                <Route path="/building-chat" element={<BuildingChat />} />

                <Route
                  path="/comparative-user-building-list"
                  element={<ComparativeUserBuildinglist />}
                />
                <Route
                  path="/comparative-building-chat"
                  element={<ComparativeBuildingChat />}
                />

                <Route
                  path="/tenent-info-user-building-list"
                  element={<TenentInfoUserBuildinglist />}
                />
                <Route
                  path="/tenant-information-chat"
                  element={<TenantInformation />}
                />

                <Route path="/tenant-market" element={<TenantMarket />} />

                <Route path="/comps-chat" element={<MarketChat />} />

                <Route
                  path="/user-fire-safety-building-mechanicals"
                  element={<FireSafetyandBuildingMechanicalsChat />}
                />
                <Route
                  path="/user-fire-safety-building-mechanicals-list"
                  element={<FireSafetyandBuildingList />}
                />
                <Route
                  path="/user-fire-safety-building-mechanicals"
                  element={<FireSafetyandBuildingMechanicalsChat />}
                />

                <Route
                  path="/user-sublease-tracker-list"
                  element={<SubleaseTrackerList />}
                />
                <Route
                  path="/user-sublease-tracker"
                  element={<SubleaseTracker />}
                />

                <Route
                  path="/user-renewal-tracker-list"
                  element={<RenewalTrackerList />}
                />
                <Route
                  path="/user-renewal-tracker-form"
                  element={<RenewalTracker />}
                />

                <Route
                  path="/user-lease-loi-building-list"
                  element={<UserBuildinglist />}
                />
                <Route
                  path="/user-select-lease-loi"
                  element={<UserLeaseList />}
                />
                <Route path="/user-lease-loi-chat" element={<UserChat />} />

                <Route path="/tours" element={<ToursPage />} />

                <Route path="/deal-list" element={<DealList />} />
                <Route path="/deals/new" element={<DealForm />} />
                <Route path="/deals/:dealId" element={<DealDetailView />} />

                <Route path="/user-profile" element={<UserProfile />} />

                <Route path="/history" element={<SessionList />} />
              </Route>
            </Routes>
            <ToastContainer />
          </Router>
        </WebSocketProvider>
      </GoogleOAuthProvider>
    </Provider>
  );
}

export default App;
