import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { VerifyOtpSubmit } from "../../../Networking/User/APIs/Auth/VerifyOtp";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";

export const VerifyOtp = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const dispatch = useDispatch();
  const inputRefs = useRef([]);
  const location = useLocation();
  const navigate = useNavigate();

  const data = location.state;

  const handleChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;
    const updatedOtp = [...otp];
    updatedOtp[index] = value;
    setOtp(updatedOtp);
    setError("");

    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleVerify = async () => {
    const fullOtp = otp.join("");
    if (fullOtp.length !== 6) {
      alert("Please enter a valid 6-digit OTP.");
      return;
    }

    const payload = { email: data.email, otp: fullOtp };
    try {
      setLoading(true);
      const result = await dispatch(VerifyOtpSubmit(payload)).unwrap();
      {
        data.screen == "SignUp"
          ? toast.success(result.message || "OTP verified successfully!") &&
            navigate("/")
          : toast.success(result.message || "OTP verified successfully!") &&
            navigate("/reset-password", { state: { email: data.email } });
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5 d-flex flex-column align-items-center">
      <h2 className="mb-4">🔐 Verify OTP</h2>
      <p className="text-muted mb-4">We've sent a code to {data.email}</p>
      {error && (
        <div
          className="alert alert-danger mb-4 w-100 text-center"
          style={{ maxWidth: "400px" }}
        >
          {error}
        </div>
      )}
      <div className="d-flex gap-2 mb-4">
        {otp.map((digit, index) => (
          <input
            key={index}
            type="text"
            inputMode="numeric"
            maxLength="1"
            className="form-control text-center"
            style={{ width: "50px", height: "50px", fontSize: "24px" }}
            value={digit}
            onChange={(e) => handleChange(e.target.value, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            ref={(el) => (inputRefs.current[index] = el)}
            disabled={loading}
          />
        ))}
      </div>

      <button
        onClick={handleVerify}
        className="btn btn-dark w-25 mb-3"
        disabled={loading || otp.some((digit) => digit === "")}
      >
        {loading ? (
          <>
            <span
              className="spinner-border spinner-border-sm me-2"
              role="status"
              aria-hidden="true"
            ></span>
            Verifying...
          </>
        ) : (
          "Verify OTP"
        )}
      </button>

      <div className="mt-3">
        {data.screen == "SignUp" ? (
          <button
            className="btn btn-link text-decoration-none"
            onClick={() => navigate("/")}
          >
            Back to Login
          </button>
        ) : null}
      </div>
    </div>
  );
};
