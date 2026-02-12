import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { googleLoginService, LoginSubmit } from "../../../Networking/Admin/APIs/LoginAPIs";
import { useDispatch } from "react-redux";
import RAGLoader from "../../../Component/Loader";
import side_photo from "../../../assets/side_photo.jpg";
import { toast } from "react-toastify";
import { Eye, EyeOff } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";

export const AdminLogin = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem("access_token");
    const role = sessionStorage.getItem("role");

    if (!token || !role) return;
console.log(role,"role");

    if (role === "superuser") {
      navigate("/admin-management");
    } else if (role === "admin") {
      navigate("/admin-dashboard");
    } else if (role === "user") {
      navigate("/cre-news");
    }
  }, []);

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (password.length < 6) {
      newErrors.password = "Password must be at least 8 characters.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleforget = () => {
    navigate("/forgot-password");
  };

  const handleGoogleAdminLogin = async (credentialResponse) => {
  try {
    setLoading(true);

    const idToken = credentialResponse.credential; 

    const res = await dispatch(
      googleLoginService(idToken)
    ).unwrap();

    const { role, access_token } = res;

    
    if (!["admin", "superuser"].includes(role)) {
      toast.error("You are not authorized to access admin panel");
      return;
    }

    sessionStorage.setItem("access_token", access_token);
    sessionStorage.setItem("role", role);

    toast.success("Admin Google login successful");

    if (role === "admin") navigate("/admin-dashboard");
    else navigate("/admin-management");

  } catch (err) {
    toast.error(err || "Google login failed");
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
        LoginSubmit({email: email.trim(),
      password: password.trim(), role: "admin" })
      ).unwrap();

      const { role, access_token } = res;

      if (!["admin", "superuser"].includes(role)) {
        toast.error("You are not authorized to access this panel");
        return;
      }

      sessionStorage.setItem("access_token", access_token);
      sessionStorage.setItem("role", role);

      toast.success(`${role} login successful`);

      if (role === "admin") {
        navigate("/admin-dashboard");
      } else if (role === "superuser") {
        navigate("/admin-management");
      }
    } catch (err) {
      console.error("Login error:", err);
      toast.error("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid min-vh-100 d-flex p-0 position-relative">
      <div
        className="d-none d-md-flex col-md-6 bg-dark text-white justify-content-center align-items-center"
        style={{
          backgroundImage: `url(${side_photo})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <h1 className="display-5  fw-bold">CRE Portfolio Pulse</h1>
      </div>

      <div className="col-12 col-md-6 d-flex justify-content-center align-items-center bg-white">
        <div className="w-100 px-4" style={{ maxWidth: "400px" }}>
          <h2 className="fw-bold mb-1">LOGIN</h2>
          <p className="text-muted mb-4">
            Enter your credentials and get ready to explore!
          </p>

          {errors.general && (
            <div className="alert alert-danger py-2">{errors.general}</div>
          )}

          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <label className="form-label">Your Email</label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-envelope"></i>
                </span>
                <input
                  type="email"
                  className={`form-control ${errors.email ? "is-invalid" : ""}`}
                  placeholder="Your Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
                {errors.email && (
                  <div className="invalid-feedback">{errors.email}</div>
                )}
              </div>
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
              className="btn btn-primary w-100 mb-3"
              disabled={loading}
            >
              Log in
            </button>
            <div className="mb-3">
  <GoogleLogin
    onSuccess={handleGoogleAdminLogin}
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
