import React, { useEffect, useState } from "react";
import {
  getProfileDetail,
  ProfileUpdateApi,
} from "../../../Networking/User/APIs/Profile/ProfileApi";
import { useDispatch, useSelector } from "react-redux";
import { FaEdit, FaSave, FaTimes } from "react-icons/fa";
import RAGLoader from "../../../Component/Loader";

export const UserProfile = () => {
  const { userdata } = useSelector((state) => state.ProfileSlice);
  console.log(userdata, "userdata");

  const dispatch = useDispatch();

  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [bgPhotoFile, setBgPhotoFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchProfile = async () => {
      setLoadingProfile(true);
      try {
        await dispatch(getProfileDetail());
      } catch (error) {
        console.error("Failed to load profile:", error);
      } finally {
        setLoadingProfile(false);
      }
    };
    fetchProfile();
  }, [dispatch]);

  useEffect(() => {
    if (userdata) {
      setName(userdata.name || "");
      setNumber(userdata.number || "");
    }
  }, [userdata]);

  const cancelEditing = () => {
    setName(userdata.name || "");
    setNumber(userdata.number || "");
    setPhotoFile(null);
    setBgPhotoFile(null);
    setIsEditing(false);
  };

  const validate = () => {
    let tempErrors = {};

    if (!name.trim()) {
      tempErrors.name = "Name is required";
    } else if (name.trim().length < 3) {
      tempErrors.name = "Name must be at least 3 characters";
    } else if (name.trim().length > 20) {
      tempErrors.name = "Name must not exceed 20 characters";
    }

    if (!number.trim()) {
      tempErrors.number = "Phone number is required";
    } else if (!/^\d+$/.test(number)) {
      tempErrors.number = "Phone number must contain only digits";
    } else if (number.length < 10 || number.length > 15) {
      tempErrors.number = "Phone number must be 10–15 digits";
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("number", number);
    if (photoFile) formData.append("photo", photoFile);
    if (bgPhotoFile) formData.append("bg_photo", bgPhotoFile);

    try {
      await dispatch(ProfileUpdateApi(formData));
      dispatch(getProfileDetail());
      setIsEditing(false);
      setPhotoFile(null);
      setBgPhotoFile(null);
      setErrors({});
    } catch (error) {
      console.error("Update failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        className="hero-section text-center bg-dark py-3 mb-4 animate__animated animate__fadeInDown"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 3,
          borderBottom: "1px solid #dee2e6",
        }}
      >
        <h2 className="fw-bold text-light">👤 Profile</h2>
        <p className="text-light mb-0">Here's a summary of your profile.</p>
      </div>

      <div className="container-fuild p-3">
        {loadingProfile ? (
          <div className="text-center ">
            <RAGLoader />
            <p className="mt-2 text-muted">Loading profile...</p>
          </div>
        ) : (
          <div className="card shadow-sm overflow-hidden">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <h4> 👤 Profile Info</h4>
                {!isEditing ? (
                  <button
                    className="btn btn-outline-dark"
                    onClick={() => setIsEditing(true)}
                  >
                    <FaEdit className="me-1" /> Edit
                  </button>
                ) : (
                  <button
                    className="btn btn-outline-secondary"
                    onClick={cancelEditing}
                  >
                    <FaTimes className="me-1" />
                  </button>
                )}
              </div>

              <form onSubmit={handleProfileUpdate}>
                <div className="mb-2">
                  {!isEditing ? (
                    <>
                      <label className="form-label fw-bold">Full Name</label>
                      <br />
                      <label>{name}</label>
                    </>
                  ) : (
                    <>
                      <label className="form-label">Name</label>
                      <input
                        value={name}
                        onChange={(e) => {
                          const value = e.target.value;

                          if (value.length > 20) {
                            setErrors({
                              ...errors,
                              name: "Name cannot exceed 20 characters",
                            });
                            return;
                          }

                          setName(value);
                          setErrors({ ...errors, name: "" });
                        }}
                        className={`form-control ${errors.name ? "is-invalid" : ""}`}
                      />
                      {errors.name && (
                        <div className="invalid-feedback">{errors.name}</div>
                      )}
                    </>
                  )}
                </div>

                <div className="mb-3">
                  {!isEditing ? (
                    <>
                      <label className="form-label fw-bold">Phone Number</label>
                      <br />
                      <label>{number}</label>
                    </>
                  ) : (
                    <>
                      <label className="form-label">Phone Number</label>
                      <input
                        value={number}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "");
                          setNumber(value);
                          setErrors({ ...errors, number: "" });
                        }}
                        className={`form-control ${errors.number ? "is-invalid" : ""}`}
                        maxLength={15}
                      />
                      {errors.number && (
                        <div className="invalid-feedback">{errors.number}</div>
                      )}
                    </>
                  )}
                </div>

                {isEditing && (
                  <div className="d-flex justify-content-end gap-2">
                    <button
                      type="button"
                      className="btn btn-outline-danger"
                      onClick={cancelEditing}
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-warning"
                      disabled={loading}
                    >
                      {loading ? (
                        "Saving..."
                      ) : (
                        <>
                          <FaSave className="me-1" /> Save Changes
                        </>
                      )}
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
