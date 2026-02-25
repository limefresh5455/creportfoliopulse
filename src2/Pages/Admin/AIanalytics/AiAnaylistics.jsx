import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaChartLine, FaComments, FaSignInAlt, FaUsers } from "react-icons/fa";
import { useDispatch } from "react-redux";
import {
  getActivitySummaryApi,
  getAnalyticApi,
  getInslightApi,
  getRecentQuestionApi,
  getUsageTreadApi,
} from "../../../Networking/Admin/APIs/AiInslightsAPi";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import ReactMarkdown from "react-markdown";

export const Aianalytics = () => {
  const [activeTab, setActiveTab] = useState("AI Insights");
  const [days, setDays] = useState(7);
  const [dashboardData, setDashboardData] = useState(null);
  const [Inslight, setInslights] = useState([]);
  const [recentQuestions, setRecentQuestions] = useState(null);
  const [usageData, setUsageData] = useState(null);
  const [activitySummary, setActivitySummary] = useState(null);

  const dispatch = useDispatch();

  const fetchDashboard = async () => {
    try {
      const res = await dispatch(getAnalyticApi({ days })).unwrap();

      const formattedData = {
        chatSessions: res?.chat_sessions,
        activeUsers: res?.active_users,
        totalLogins: res?.total_logins,
        platformUsers: res?.platform_users,
      };

      setDashboardData(formattedData);
    } catch (error) {
      console.error("Failed to fetch dashboard:", error);
      setDashboardData(null);
    }
  };

  const AIInslights = async () => {
    try {
      const res = await dispatch(getInslightApi()).unwrap();

      setInslights(res);
    } catch (error) {
      console.error("Failed to fetch AI insights:", error);
    }
  };

  const fetchRecentQuestions = async () => {
    try {
      const res = await dispatch(getRecentQuestionApi()).unwrap();

      let parsedSummary = "";
      if (res?.recent_questions?.summary) {
        const rawSummary = res.recent_questions.summary
          .replace(/```json|```/g, "")
          .trim();

        try {
          if (rawSummary.startsWith("{") || rawSummary.startsWith("[")) {
            const parsed = JSON.parse(rawSummary);
            parsedSummary = parsed.summary || JSON.stringify(parsed);
          } else {
            parsedSummary = rawSummary
              .split("\n")
              .map((line) => line.replace(/^\*+\s*/, "").trim())
              .filter((line) => line.length > 0)
              .join(" ");
          }
        } catch (err) {
          console.error("Failed to parse summary, fallback to raw text:", err);
          parsedSummary = rawSummary;
        }
      }

      setRecentQuestions({
        summary: parsedSummary,
        questions: res?.recent_questions?.questions || [],
      });
    } catch (error) {
      console.error("Failed to fetch recent questions:", error);
    }
  };

  const fetchUsageTreads = async () => {
    try {
      const res = await dispatch(getUsageTreadApi({ days })).unwrap();

      let insights = {};
      if (res?.ai_insights?.trend_summary) {
        try {
          const raw = res.ai_insights.trend_summary
            .replace(/```json|```/g, "")
            .trim();
          insights = JSON.parse(raw);
        } catch (err) {
          console.error("Failed to parse trend summary:", err);
          insights = { trend_summary: res.ai_insights.trend_summary };
        }
      }

      setUsageData({
        daily: res.daily_login_activity || [],
        categories: res.activity_categories || {},
        insights,
      });
    } catch (error) {
      console.error("Failed to fetch usage trends:", error);
      setUsageData(null);
    }
  };

  const fetchActivitySummary = async () => {
    try {
      const res = await dispatch(getActivitySummaryApi({ days })).unwrap();

      const daily = Object.entries(res.daily_activity_summary || {}).map(
        ([date, values]) => ({
          date,
          ...values,
        })
      );

      setActivitySummary({
        daily,
        sessions: res.session_activity_trend || [],
      });
    } catch (error) {
      console.error("Failed to fetch activity summary:", error);
      setActivitySummary(null);
    }
  };

  useEffect(() => {
    fetchDashboard();
    AIInslights();
    fetchRecentQuestions();
    fetchActivitySummary();
  }, [days]);

  useEffect(() => {
    if (activeTab === "Usage Trends") {
      fetchUsageTreads();
    }
  }, [activeTab, days]);

  const All = () => {
    fetchDashboard();
    AIInslights();
    fetchRecentQuestions();
    if (activeTab === "Usage Trends") fetchUsageTreads();
  };

  return (
    <div className="container-fluid p-3 p-md-3">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3">
        <div className="mb-3 mb-md-0">
          <div className="text-center text-md-start">
            <h4 className="fw-bold">AI Analytics</h4>
            <p className="text-muted m-0">
              User behavior insights and system utilization analytics
            </p>
          </div>

        </div>
        <div className="d-flex flex-wrap align-items-center gap-2">
          <select
            className="form-select form-select-sm"
            style={{ minWidth: "140px" }}
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
          <button className="btn btn-outline-secondary btn-sm" onClick={All}>
            Refresh Insights
          </button>
        </div>
      </div>

      <div className="row mb-4 g-3">
        {[
          {
            icon: <FaComments size={28} className="text-primary" />,
            label: "Chat Sessions",
            value: dashboardData?.chatSessions,
          },
          {
            icon: <FaUsers size={28} className="text-info" />,
            label: "Active Users",
            value: dashboardData?.activeUsers,
          },
          {
            icon: <FaSignInAlt size={28} className="text-success" />,
            label: "Total Logins",
            value: dashboardData?.totalLogins,
          },
          {
            icon: <FaChartLine size={28} className="text-warning" />,
            label: "Platform Users",
            value: dashboardData?.platformUsers,
          },
        ].map((card, idx) => (
          <div className="col-12 col-sm-6 col-lg-3" key={idx}>
            <div className="card shadow-sm text-center p-3 h-100">
              <div className="d-flex align-items-center justify-content-around">
                {card.icon}
                <div>
                  <h5 className="mb-1">{card.value || 0}</h5>
                  <p className="text-muted m-0">{card.label}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <ul className="nav mb-3 custom-tabs flex-wrap justify-content-center">
        {["AI Insights", "Usage Trends", "Recent Questions", "Analytics"].map(
          (tab) => (
            <li className="nav-item flex-fill mx-1 mx-md-2" key={tab}>
              <button
                className={`nav-link w-100 text-center ${activeTab === tab ? "active" : ""
                  }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            </li>
          )
        )}
      </ul>

      <div className="card shadow-sm p-4">
        {activeTab === "AI Insights" && (
          <>
            <h6 className="fw-bold mb-3">AI-Generated Insights</h6>
            {Inslight.length > 0 ? (
              <div className="list-group">
                <div className="list-group">
                  {Inslight.map((insight, idx) => (
                    <div key={idx} className="list-group-item">
                      <ReactMarkdown>
                        {typeof insight === "string"
                          ? insight.replace(/"/g, "")
                          : JSON.stringify(insight.insight, null, 2).replace(
                            /"/g,
                            ""
                          )}
                      </ReactMarkdown>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center text-muted">
                <div
                  className="spinner-border text-secondary mb-2"
                  role="status"
                  style={{ width: "2rem", height: "2rem" }}
                >
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p>Generating AI insights...</p>
              </div>
            )}
          </>
        )}

        {activeTab === "Usage Trends" && (
          <div>
            <h6 className="fw-bold mb-3">Usage Trends</h6>

            {!usageData ? (
              <div className="text-center text-muted">
                <div
                  className="spinner-border text-secondary mb-2"
                  role="status"
                  style={{ width: "2rem", height: "2rem" }}
                >
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p>Loading usage trends...</p>
              </div>
            ) : (
              <>
                <div className="card mb-4 p-3 shadow-sm">
                  <h6 className="fw-bold">Daily Login Activity</h6>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={usageData.daily}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="logins"
                        stroke="#007bff"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {usageData.insights?.trend_summary && (
                  <div className="card p-3 shadow-sm">
                    <h6 className="fw-bold">AI Insights</h6>
                    <p className="text-muted">
                      {usageData.insights.trend_summary}
                    </p>
                    {usageData.insights.category_analysis && (
                      <p className="text-muted">
                        {usageData.insights.category_analysis}
                      </p>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === "Recent Questions" && (
          <div>
            <h6 className="fw-bold mb-3">Recent Questions</h6>
            {recentQuestions ? (
              <>
                {recentQuestions.summary && (
                  <div className="alert alert-info">
                    {recentQuestions.summary}
                  </div>
                )}
                {recentQuestions.questions.length > 0 ? (
                  <ul className="list-group">
                    {recentQuestions.questions.map((q, idx) => (
                      <li key={idx} className="list-group-item">
                        {q}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted">No questions found.</p>
                )}
              </>
            ) : (
              <div className="text-center text-muted">
                <div
                  className="spinner-border text-secondary mb-2"
                  role="status"
                  style={{ width: "2rem", height: "2rem" }}
                >
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p>Loading recent questions...</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "Analytics" && (
          <div>
            <h6 className="fw-bold mb-3">Analytics</h6>
            {!activitySummary ? (
              <div className="text-center text-muted">
                <div
                  className="spinner-border text-secondary mb-2"
                  role="status"
                  style={{ width: "2rem", height: "2rem" }}
                >
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p>Loading activity summary...</p>
              </div>
            ) : (
              <div className="row">
                <div className="col-md-6 mb-3">
                  <div className="card p-3 shadow-sm">
                    <h6 className="fw-bold">Daily Activity Summary</h6>
                    {activitySummary?.daily.length > 0 ? (
                      <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={activitySummary?.daily}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis allowDecimals={false} />
                          <Tooltip />
                          <Line
                            type="monotone"
                            dataKey="logins"
                            stroke="#007bff"
                            strokeWidth={2}
                          />
                          <Line
                            type="monotone"
                            dataKey="chat_sessions"
                            stroke="#28a745"
                            strokeWidth={2}
                          />
                          <Line
                            type="monotone"
                            dataKey="active_users"
                            stroke="#ffc107"
                            strokeWidth={2}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-muted text-center m-0">
                        No activity data found
                      </p>
                    )}
                  </div>
                </div>

                <div className="col-md-6 mb-3">
                  <div className="card p-3 shadow-sm">
                    <h6 className="fw-bold">Session Activity Trend</h6>
                    {activitySummary.sessions.length > 0 ? (
                      <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={activitySummary.sessions}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis allowDecimals={false} />
                          <Tooltip />
                          <Line
                            type="monotone"
                            dataKey="chat_sessions"
                            stroke="#17a2b8"
                            strokeWidth={2}
                          />
                          <Line
                            type="monotone"
                            dataKey="active_users"
                            stroke="#6f42c1"
                            strokeWidth={2}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-muted text-center m-0">
                        No session data found
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
