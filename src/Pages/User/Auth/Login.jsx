import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";

import {
  googleLoginService,
  LoginSubmit,
} from "../../../Networking/Admin/APIs/LoginAPIs";
import RAGLoader from "../../../Component/Loader";
import headerimage from "../../../assets/side_photo.jpg";
import side_photo from "../../../assets/side_photo.jpg";
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

    if (role === "user") navigate("/dashboard");
    else if (role === "admin") navigate("/admin-dashboard");
    else if (role === "superuser") navigate("/admin-management");
  }, []);

  const validateForm = () => {
    const errs = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errs.email = "Invalid email address";
    if (password.length < 8)
      errs.password = "Password must be at least 8 characters";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);

      const idToken = credentialResponse.credential;

      const res = await dispatch(googleLoginService(idToken)).unwrap();
      console.log(res.role, "res.role");

      if (res.role === "user") {
        navigate("/dashboard");
        sessionStorage.setItem("access_token", res.access_token);
        sessionStorage.setItem("role", res.role);
      } else if (res.role === "admin") {
        navigate("/admin-dashboard");
        sessionStorage.setItem("access_token", res.access_token);
        sessionStorage.setItem("role", res.role);
      } else if (res.role === "superuser") {
        navigate("/admin-management");
        sessionStorage.setItem("access_token", res.access_token);
        sessionStorage.setItem("role", res.role);
      }

      toast.success("login successfull");
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  const handleforget = () => {
    navigate("/forgot-password");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const res = await dispatch(
        LoginSubmit({
          email: email.trim(),
          password: password.trim(),
        }),
      ).unwrap();

      const { role, access_token } = res;
      console.log(res, "res");

      sessionStorage.setItem("role", role);
      sessionStorage.setItem("access_token", access_token);
      if (res.role === "user") {
        navigate("/dashboard", { state: { email } });
        sessionStorage.setItem("access_token", res.access_token);
        sessionStorage.setItem("role", res.role);
      } else if (res.role === "admin") {
        navigate("/admin-dashboard");
        sessionStorage.setItem("access_token", res.access_token);
        sessionStorage.setItem("role", res.role);
      } else if (res.role === "superuser") {
        navigate("/admin-management");
        sessionStorage.setItem("access_token", res.access_token);
        sessionStorage.setItem("role", res.role);
      }
      toast.success("login successful");
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container d-flex vh-100 position-relative">
      <div
        className="d-none d-md-flex col-md-6 bg-dark text-white justify-content-center align-items-center"
        style={{
          backgroundImage: `url(${side_photo})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          position: "relative",
        }}
      >
        <h1 className="display-5 fw-bold position-relative z-1">
          CRE Portfolio Pulse
        </h1>
      </div>

      <div className="login-right col-12 col-md-6 d-flex justify-content-center align-items-center bg-white">
        <div
          className="login-card shadow rounded p-4 w-100"
          style={{ maxWidth: "400px" }}
        >
          <div className="mb-4 text-center">
            <img
              src={headerimage}
              alt="Logo"
              style={{ height: 80, width: 100 }}
            />
            <h4 className="fw-bold mt-3">LOGIN</h4>
            <p className="text-muted small">Please enter your details</p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                type="email"
                className={`form-control ${errors.email ? "is-invalid" : ""}`}
                placeholder="Enter Email..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              {errors.email && (
                <div className="invalid-feedback">{errors.email}</div>
              )}
            </div>

            <div className="mb-3">
              <label className="form-label">Your Password</label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-lock"></i>
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  className={`form-control ${
                    errors.password ? "is-invalid" : ""
                  }`}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
                <span
                  className="input-group-text"
                  style={{ cursor: "pointer" }}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </span>
                {errors.password && (
                  <div className="invalid-feedback">{errors.password}</div>
                )}
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-dark w-100 mb-3"
              disabled={loading}
            >
              Sign in
            </button>
            <div className="mb-3">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => toast.error("Google Login Failed")}
                width="100%"
              />
            </div>

            <div
              className="text-end"
              style={{ cursor: "pointer" }}
              onClick={() => handleforget({ email })}
            >
              Forgot password?
            </div>
          </form>
        </div>
      </div>

      {loading && (
        <div
          className="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-white bg-opacity-75"
          style={{ zIndex: 9999 }}
        >
          <RAGLoader />
        </div>
      )}
    </div>
  );
};
