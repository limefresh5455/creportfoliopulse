import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { SignUpSubmit } from "../../../Networking/Admin/APIs/LoginAPIs";
import RAGLoader from "../../../Component/Loader";
import side_photo from "../../../assets/side_photo.png";

export const SignUp = () => {

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [form, setForm] = useState({
    name: "",
    number: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validateForm = () => {
    const newErrors = {};
    const { name, number, email, password, confirmPassword } = form;
    if (!name.trim()) newErrors.name = "Name is required.";
    if (!/^\d{10}$/.test(number)) newErrors.number = "Phone number must be 10 digits.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = "Invalid email format.";
    if (password.length < 8) newErrors.password = "Password must be at least 8 characters.";
    if (confirmPassword !== password) newErrors.confirmPassword = "Passwords do not match.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    if (!validateForm()) return;
    setLoading(true);
    const payload = {
      name: form.name,
      number: Number(form.number),
      email: form.email,
      password: form.password,
      confirm_password: form.confirmPassword,
      role: "user",
    };

    try {
      const res = await dispatch(SignUpSubmit(payload)).unwrap();
      if (res?.message) {
        navigate("/verify-otp", { state: { email: form.email, screen: "SignUp" } });
      }
    } catch (err) {
      const msg = err?.response?.data?.msg || err?.message || "Signup failed.";
      setError(msg);
      console.error("Signup error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="container-fluid min-vh-100 d-flex justify-content-center align-items-center p-0"
      style={{
        backgroundImage: `url(${side_photo})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          zIndex: 0,
        }}
      ></div>

      <div
        className="card p-4 shadow-lg border-0 rounded-3"
        style={{
          width: "100%",
          maxWidth: "450px",
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(10px)",
          zIndex: 1,
        }}
      >
        <div className="text-center mb-4">
          <h2 className="fw-bold text-dark mb-2">Create Account</h2>
          <p className="text-muted">Join us to get started</p>
        </div>

        {error && <div className="alert alert-danger py-2">{error}</div>}

        <form onSubmit={handleSignup}>
          <div className="mb-3">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              name="name"
              className={`form-control ${errors.name ? "is-invalid" : ""}`}
              placeholder="Enter full name"
              value={form.name}
              onChange={handleChange}
              required
            />
            {errors.name && <div className="invalid-feedback">{errors.name}</div>}
          </div>

          <div className="mb-3">
            <label className="form-label">Phone Number</label>
            <input
              type="tel"
              name="number"
              className={`form-control ${errors.number ? "is-invalid" : ""}`}
              placeholder="Enter phone number"
              value={form.number}
              onChange={handleChange}
              required
              maxLength={10}
            />
            {errors.number && <div className="invalid-feedback">{errors.number}</div>}
          </div>

          <div className="mb-3">
            <label className="form-label">Email</label>
            <div className="input-group">
              <span className="input-group-text bg-light">
                <i className="bi bi-envelope text-muted"></i>
              </span>
              <input
                type="email"
                name="email"
                className={`form-control ${errors.email ? "is-invalid" : ""}`}
                placeholder="Enter email"
                value={form.email}
                onChange={handleChange}
                required
              />
              {errors.email && <div className="invalid-feedback">{errors.email}</div>}
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">Password</label>
            <div className="input-group">
              <span className="input-group-text bg-light">
                <i className="bi bi-lock text-muted"></i>
              </span>
              <input
                type="password"
                name="password"
                className={`form-control ${errors.password ? "is-invalid" : ""}`}
                placeholder="Enter password"
                value={form.password}
                onChange={handleChange}
                required
                minLength={8}
              />
              {errors.password && <div className="invalid-feedback">{errors.password}</div>}
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">Confirm Password</label>
            <div className="input-group">
              <span className="input-group-text bg-light">
                <i className="bi bi-lock-fill text-muted"></i>
              </span>
              <input
                type="password"
                name="confirmPassword"
                className={`form-control ${errors.confirmPassword ? "is-invalid" : ""}`}
                placeholder="Re-enter password"
                value={form.confirmPassword}
                onChange={handleChange}
                required
              />
              {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-dark w-100 mb-3 fw-bold"
            disabled={loading}
          >
            {loading ? <RAGLoader /> : "Sign Up"}
          </button>

          <div className="text-center mt-3">
            <p className="text-light-emphasis">
              Already have an account?{" "}
              <a
                href="#"
                className="text-primary fw-semibold text-decoration-none"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/");
                }}
              >
                Log In
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
