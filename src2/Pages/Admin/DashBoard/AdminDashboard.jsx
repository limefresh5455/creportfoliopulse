import { FileText, Building2, Upload, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { getdashboardApi } from "../../../Networking/Admin/APIs/dashboardApi";
import { useNavigate } from "react-router-dom";

export const AdminDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await dispatch(getdashboardApi()).unwrap();
        setDashboardData(res);
      } catch (error) {
        console.error("Error fetching dashboard:", error);
      }
    };

    fetchDashboard();
  }, [dispatch]);

  const handleAIAnalytics = () => navigate("/aianalytics");
  const handleBuilding = () => navigate("/admin-lease-loi-building-list");

  return (
    <div className="container-fuild p-3">
      <div className="mb-4 text-center text-md-start">
        <h4 className="fw-bold">Dashboard Overview</h4>
        <p className="text-muted">
          Manage your real estate portfolio data and AI system
        </p>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-lg-3">
          <div
            className="card border-0 shadow-sm rounded-4 h-100"
            style={{
              background: "linear-gradient(to right, #f3f6ff, #f8faff)",
            }}
          >
            <div className="card-body d-flex align-items-center">
              <div
                className="rounded-3 bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center me-3"
                style={{ width: "42px", height: "42px" }}
              >
                <FileText size={20} />
              </div>
              <div>
                <h6 className="text-muted mb-1">Total Documents</h6>
                <h5 className="fw-bold mb-0">
                  {dashboardData?.total_documents ?? 0}
                </h5>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div
            className="card border-0 shadow-sm rounded-4 h-100"
            style={{
              background: "linear-gradient(to right, #f3fff6, #f8fffb)",
            }}
          >
            <div className="card-body d-flex align-items-center">
              <div
                className="rounded-3 bg-success bg-opacity-10 text-success d-flex align-items-center justify-content-center me-3"
                style={{ width: "42px", height: "42px" }}
              >
                <Building2 size={20} />
              </div>
              <div>
                <h6 className="text-muted mb-1">Buildings</h6>
                <h5 className="fw-bold mb-0">
                  {dashboardData?.buildings ?? 0}
                </h5>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div
            className="card border-0 shadow-sm rounded-4 h-100"
            style={{
              background: "linear-gradient(to right, #f3f6ff, #f8faff)",
            }}
          >
            <div className="card-body d-flex align-items-center">
              <div
                className="rounded-3 bg-info bg-opacity-10 text-info d-flex align-items-center justify-content-center me-3"
                style={{ width: "42px", height: "42px" }}
              >
                <Upload size={20} />
              </div>
              <div>
                <h6 className="text-muted mb-1">Recent Uploads</h6>
                <h5 className="fw-bold mb-0">
                  {dashboardData?.recent_uploads ?? 0}
                </h5>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div
            className="card border-0 shadow-sm rounded-4 h-100"
            style={{
              background: "linear-gradient(to right, #f3fff6, #f8fffb)",
            }}
          >
            <div className="card-body d-flex align-items-center">
              <div
                className="rounded-3 bg-success bg-opacity-10 text-success d-flex align-items-center justify-content-center me-3"
                style={{ width: "42px", height: "42px" }}
              >
                <TrendingUp size={20} />
              </div>
              <div>
                <h6 className="text-muted mb-1">AI Queries</h6>
                <h5 className="fw-bold mb-0">
                  {dashboardData?.AI_queries ?? 0}
                </h5>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-12 col-lg-6">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <h5 className="fw-semibold mb-3">Recent Activity</h5>
              <p className="text-muted mb-0">
                No recent activity <br />
                <small>Activity will appear here once data is uploaded</small>
              </p>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-6">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <h5 className="fw-semibold mb-3">Quick Actions</h5>
              <div className="row g-3">
                <div className="col-12 col-sm-6">
                  
                  <button
                    className="btn btn-outline-dark w-100 py-3"
                    onClick={handleAIAnalytics}
                  >
                    <TrendingUp size={20} className="me-2" />
                    AI Analytics
                  </button>
                </div>
                <div className="col-12 col-sm-6">
                  <button
                    className="btn btn-outline-success w-100 py-3"
                    onClick={handleBuilding}
                  >
                    <Building2 size={20} className="me-2" />
                    Add Building
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
