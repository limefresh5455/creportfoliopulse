import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { getsystemtracingApi } from "../../../Networking/Admin/APIs/dashboardApi";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export const RagSystem = () => {
  const dispatch = useDispatch();
  const [data, setData] = useState(null);

  useEffect(() => {
    dispatch(getsystemtracingApi())
      .unwrap()
      .then((res) => setData(res))
      .catch((err) => console.error("Error fetching data:", err));
  }, [dispatch]);

  const avgResponseTime = data?.avg_response_time_ms || 0;
  const avgConfidence = data?.avg_confidence || 0;
  const positiveFeedback = data?.positive_feedback_percent || 0;
  const totalQueries = data?.total_queries || 0;

  const chartData = {
    labels: [
      "Avg Response Time (ms)",
      "Avg Confidence (%)",
      "Positive Feedback (%)",
      "Total Queries",
    ],
    datasets: [
      {
        label: "Metrics",
        data: [avgResponseTime, avgConfidence, positiveFeedback, totalQueries],
        backgroundColor: ["#0d6efd", "#198754", "#0dcaf0", "#6f42c1"],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: "RAG System Metrics Overview",
        font: { size: 16 },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="container-fuild p-3">
      <div className="mb-3 mb-md-0">
        <div className="text-center text-md-start">
          <h4 className="fw-bold">RAG System Tracing</h4>
          <p className="text-muted mb-0">
            Monitor query performance, confidence scores, and user feedback
          </p>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body text-center">
              <i className="bi bi-clock text-primary fs-4 mb-2"></i>
              <h6 className="fw-bold">Avg Response Time</h6>
              <p className="mb-0 fw-semibold">{avgResponseTime} ms</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body text-center">
              <i className="bi bi-bullseye text-success fs-4 mb-2"></i>
              <h6 className="fw-bold">Avg Confidence</h6>
              <p className="mb-0 fw-semibold">{avgConfidence} %</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body text-center">
              <i className="bi bi-graph-up text-info fs-4 mb-2"></i>
              <h6 className="fw-bold">Positive Feedback</h6>
              <p className="mb-0 fw-semibold">{positiveFeedback} %</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body text-center">
              <i className="bi bi-activity text-primary fs-4 mb-2"></i>
              <h6 className="fw-bold">Total Queries</h6>
              <p className="mb-0 fw-semibold">{totalQueries}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm border-0 mb-5">
        <div className="card-body">
          <h6 className="fw-bold mb-3">
            <i className="bi bi-file-text me-2"></i> Recent Query Traces
          </h6>
          {data ? (
            <Bar data={chartData} options={chartOptions} />
          ) : (
            <div className="text-center text-muted py-4">
              <i className="bi bi-activity fs-3 mb-2 d-block"></i>
              <p className="mb-0">
                No query traces available <br />
                <small>
                  Traces will appear here once users start making queries
                </small>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
