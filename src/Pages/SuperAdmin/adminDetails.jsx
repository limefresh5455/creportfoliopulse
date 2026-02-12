import React, { useEffect, useState } from "react";
import { Card } from "react-bootstrap";
import { useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  fetchAdminAnalyticsApi,
  fetchAdminStatsApi,
} from "../../Networking/SuperAdmin/AdminSuperApi";

export const AdminDetails = () => {
  const { state } = useLocation();
  const dispatch = useDispatch();
  const admin = state?.admin;

  const [stats, setStats] = useState(null);
  console.log(stats, "stats");

  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (admin?.user_id) {
      fetchAdminData();
    }
  }, [admin]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);

      const [statsData, analyticsData] = await Promise.all([
        dispatch(fetchAdminStatsApi(admin.user_id)).unwrap(),
        dispatch(
          fetchAdminAnalyticsApi({
            user_id: admin.user_id,
            days: 7,
          }),
        ).unwrap(),
      ]);
      console.log("fgdsgfhk");
      console.log(statsData, analyticsData, "analyticsData");

      setStats(statsData);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error("Failed to load admin data", error);
    } finally {
      setLoading(false);
    }
  };

  if (!admin) {
    return <p className="text-danger">No admin selected</p>;
  }

  const MetricCard = ({ title, value, icon, color }) => (
    <div className="col-6 col-sm-4 col-md-3 col-lg-2">
      <div className="card border-0 shadow-sm rounded-4 h-100">
        <div className="card-body d-flex flex-column align-items-center justify-content-center text-center gap-2">
          <div
            className={`bg-${color} bg-opacity-10 text-${color} rounded-circle d-flex align-items-center justify-content-center`}
            style={{ width: 42, height: 42 }}
          >
            <i className={`bi ${icon} fs-5`} />
          </div>

          <small className="text-muted">{title}</small>

          <div className="fw-bold fs-6">{value ?? "-"}</div>
        </div>
      </div>
    </div>
  );

  const MetricCardSkeleton = ({ color = "primary" }) => (
    <div className="col-6 col-sm-4 col-md-3 col-lg-2">
      <div className="card border-0 shadow-sm rounded-4 h-100">
        <div className="card-body d-flex flex-column align-items-center justify-content-center text-center gap-2">
          <div
            className={`bg-${color} bg-opacity-10 rounded-circle placeholder`}
            style={{ width: 42, height: 42 }}
          />

          <div className="placeholder-glow" style={{ width: "60%" }}>
            <span
              className="placeholder col-12 rounded"
              style={{ height: 10 }}
            />
          </div>

          <div className="placeholder-glow" style={{ width: "40%" }}>
            <span
              className="placeholder col-12 rounded"
              style={{ height: 18 }}
            />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container-fluid p-3">
      <h4 className="fw-bold">Admin Details</h4>
      <p className="text-muted">Detailed overview & analytics</p>

      <Card className="mb-4 shadow-sm border-0 rounded-4">
        <Card.Body>
          <div className="d-flex align-items-center gap-3">
            <div
              className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center fw-bold"
              style={{ width: 56, height: 56, fontSize: 20 }}
            >
              {(admin.display || admin.name || "A").charAt(0).toUpperCase()}
            </div>

            <div className="flex-grow-1">
              <div className="d-flex align-items-center gap-2">
                <h5 className="mb-0">{admin.display || admin.name}</h5>
                <span
                  className={`badge rounded-pill ${
                    admin.status === "Verified"
                      ? "bg-success-subtle text-success"
                      : "bg-secondary-subtle text-secondary"
                  }`}
                >
                  {admin.status}
                </span>
              </div>

              <div className="text-muted small mt-1">{admin.email}</div>
            </div>
          </div>

          <hr className="my-3" />

          <div className="d-flex flex-wrap gap-4 text-muted small">
            <div className="d-flex align-items-center gap-2">
              <i className="bi bi-calendar-event" />
              <span>
                Created on{" "}
                <strong className="text-dark">
                  {new Date(admin.created).toLocaleDateString()}
                </strong>
              </span>
            </div>
          </div>
        </Card.Body>
      </Card>

      {loading ? (
        <div className="col-md-12">
          <h5 className="mb-3">Platform Stats</h5>
          <div className="row g-3 mb-4">
            {[1, 2, 3, 4].map((i) => (
              <MetricCardSkeleton key={i} color="primary" />
            ))}
            <h5 className="mb-3">Last 7 Days Analytics</h5>
            {[1, 2, 3, 4].map((i) => (
              <MetricCardSkeleton key={i} color="primary" />
            ))}
          </div>
        </div>
      ) : (
        <div className="col-md-12">
          <h5 className="mb-3">Platform Stats</h5>
          <div className="row g-3 mb-4">
            <MetricCard
              title="Chat Sessions"
              value={analytics?.chat_sessions}
              icon="bi-chat-dots"
              color="primary"
            />
            <MetricCard
              title="Active Users"
              value={analytics?.active_users}
              icon="bi-people"
              color="success"
            />
            <MetricCard
              title="Total Logins"
              value={analytics?.total_logins}
              icon="bi-box-arrow-in-right"
              color="warning"
            />
            <MetricCard
              title="Platform Users"
              value={analytics?.platform_users}
              icon="bi-diagram-3"
              color="dark"
            />
          </div>

          <h5 className="mb-3">Last 7 Days Analytics</h5>
          <div className="row g-3">
            <MetricCard
              title="Documents"
              value={stats?.total_documents}
              icon="bi-file-earmark-text"
              color="info"
            />
            <MetricCard
              title="Buildings"
              value={stats?.buildings}
              icon="bi-building"
              color="secondary"
            />
            <MetricCard
              title="Recent Uploads"
              value={stats?.recent_uploads}
              icon="bi-cloud-upload"
              color="primary"
            />
            <MetricCard
              title="AI Queries"
              value={stats?.AI_queries}
              icon="bi-cpu"
              color="danger"
            />
          </div>
        </div>
      )}
    </div>
  );
};
