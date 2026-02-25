import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaUserShield } from "react-icons/fa";
import bgImage from "../../src/assets/side_photo.jpg";
import { useDispatch } from "react-redux";
import { getHealth } from "../Networking/User/APIs/Health/health";

export const Home = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [status, setStatus] = useState("");

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const res = await dispatch(getHealth()).unwrap();
        setStatus(res.status);
      } catch (error) {
        console.error("Health API error:", error);
      }
    };

    fetchHealth();
  }, [dispatch]);

  useEffect(() => {
    const token = sessionStorage.getItem("access_token");
    const role = sessionStorage.getItem("role");

    if (!token || !role) return;

    if (role === "user") {
      navigate("/dashboard", { replace: true });
    } else if (role === "admin") {
      navigate("/admin-dashboard", { replace: true });
    } else if (role === "superuser") {
      navigate("/admin-management");
    }
  }, [navigate]);

  return (
    <div
      className="d-flex justify-content-center align-items-center vh-100"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div
        className="card shadow p-4 text-center"
        style={{
          maxWidth: "400px",
          width: "100%",
          backgroundColor: "rgba(255, 255, 255, 0.4)",
          backdropFilter: "blur(10px)",
          borderRadius: "12px",
          border: "1px solid rgba(255, 255, 255, 0.3)",
        }}
      >
        <h2 className="mb-4 text-danger fw-bold">
          {!status == "ok" ? "website down!!" : ""}
        </h2>
        <h2 className="mb-4 text-dark fw-bold">
          Welcome to CRE Portfolio Pulse
        </h2>
        <div className="d-grid gap-3">
          <button
            className="btn btn-outline-dark btn-lg d-flex align-items-center justify-content-center gap-2"
            onClick={() => navigate("/")}
          >
            <FaUser /> Login
          </button>
        </div>
      </div>
    </div>
  );
};
