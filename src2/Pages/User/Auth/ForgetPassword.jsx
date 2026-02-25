import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { Forget_passwordSubmit } from "../../../Networking/User/APIs/Auth/VerifyOtp";
import { useNavigate } from "react-router-dom";

export const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.warning("Please enter your email address.");
      return;
    }

    setLoading(true);
    try {
      const data = {
        email,
      };
      const res = await dispatch(Forget_passwordSubmit(data));

      if (res?.error?.message === "Rejected") {
        return;
      }

      navigate("/verify-otp", { state: { email } });
      toast.success(
        response.data.message || "Password reset link sent to your email."
      );
      setEmail("");
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div
        className="card p-4 shadow"
        style={{ maxWidth: "400px", width: "100%" }}
      >
        <h4 className="text-center mb-3">Forgot Password</h4>
        <p className="text-muted text-center mb-4">
          Enter your registered email address
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Email address</label>
            <input
              type="email"
              className="form-control"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="btn btn-dark w-100 mb-3"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
      </div>
    </div>
  );
};
