import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";

import {
  googleLoginService,
  LoginSubmit,
} from "../../../Networking/Admin/APIs/LoginAPIs";
import RAGLoader from "../../../Component/Loader";
import { Eye, EyeOff } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";

export const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const token = sessionStorage.getItem("access_token");
    const role = sessionStorage.getItem("role");
    if (!token || !role) return;

    const routes = {
      user: "/dashboard",
      admin: "/admin-dashboard",
      superuser: "/admin-management",
    };
    if (routes[role]) navigate(routes[role]);
  }, [navigate]);

  const validateForm = () => {
    const errs = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errs.email = "Invalid email address";
    if (password.length < 8)
      errs.password = "Password must be at least 8 characters";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAuthResponse = (res) => {
    sessionStorage.setItem("access_token", res.access_token);
    sessionStorage.setItem("role", res.role);

    if (res.role === "user") navigate("/dashboard", { state: { email } });
    else if (res.role === "admin") navigate("/admin-dashboard");
    else if (res.role === "superuser") navigate("/admin-management");

    toast.success("Login successful");
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      const res = await dispatch(
        googleLoginService(credentialResponse.credential),
      ).unwrap();
      handleAuthResponse(res);
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const res = await dispatch(
        LoginSubmit({ email: email.trim(), password: password.trim() }),
      ).unwrap();
      handleAuthResponse(res);
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center min-vh-100 w-100"
      style={{
        background: "linear-gradient(135deg, #2c5f8d 0%, #4a7ba7 100%)",
        padding: "20px 0",
      }}
    >
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="text-center mb-4">
              <h3
                className="fw-medium text-white"
                style={{
                  fontSize: "clamp(1.25rem, 5vw, 1.75rem)",
                  letterSpacing: "0.5px",
                  lineHeight: "1.3",
                }}
              >
                Bespoke AIR | Portfolio Pulse Secure Portal
              </h3>
            </div>

            <div
              className="card shadow-lg border-0"
              style={{ borderRadius: "12px", overflow: "hidden" }}
            >
              <div className="card-body p-3 p-md-4">
                <form onSubmit={handleLogin}>
                  <div className="mb-4">
                    <label className="form-label text-muted mb-2 small">
                      Username
                    </label>
                    <input
                      type="email"
                      className={`form-control form-control-lg ${errors.email ? "is-invalid" : ""}`}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                      style={{ borderRadius: "12px", fontSize: "1rem" }}
                    />
                    {errors.email && (
                      <div className="invalid-feedback">{errors.email}</div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label className="form-label text-muted mb-2 small">
                      Password
                    </label>
                    <div className="position-relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        className={`form-control form-control-lg ${errors.password ? "is-invalid" : ""}`}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={loading}
                        style={{
                          borderRadius: "12px",
                          paddingRight: "45px",
                          fontSize: "1rem",
                        }}
                      />
                      <span
                        className="position-absolute end-0 top-50 translate-middle-y me-3"
                        style={{ cursor: "pointer", color: "#6b7280" }}
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </span>
                    </div>
                    {errors.password && (
                      <div className="invalid-feedback d-block small mt-1">
                        {errors.password}
                      </div>
                    )}
                  </div>

                  <div className="text-end mb-2">
                    <button
                      type="button"
                      onClick={() => navigate("/forgot-password")}
                      className="btn btn-link p-0 text-decoration-none shadow-none"
                      style={{ color: "#0066cc", fontSize: "0.85rem" }}
                    >
                      Forgot Password?
                    </button>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary btn-lg w-100 fw-semibold mb-4"
                    disabled={loading}
                    style={{
                      backgroundColor: "#0066cc",
                      borderRadius: "25px",
                      padding: "5px",
                      border: "none",
                    }}
                  >
                    {loading ? "Signing in..." : "Sign In"}
                  </button>

                  <div className="text-center mb-2">
                    <hr className="text-muted opacity-25" />
                    <span
                      className="bg-white px-2 text-muted small position-relative"
                      style={{ top: "-25px" }}
                    >
                      Or sign in with
                    </span>
                  </div>

                  <div className="d-flex justify-content-center w-100 overflow-hidden">
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={() => toast.error("Google Login Failed")}
                      useOneTap
                      shape="pill"
                      theme="outline"
                      width="100%"
                    />
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {loading && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-white bg-opacity-75"
          style={{ zIndex: 9999 }}
        >
          <RAGLoader />
        </div>
      )}
    </div>
  );
};
