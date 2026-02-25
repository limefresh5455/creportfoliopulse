import React, { useState } from "react";
import { useDispatch } from "react-redux";
import PropTypes from "prop-types";
import RAGLoader from "../../../Component/Loader";
import { UploadBuildinginfoSubmit } from "../../../Networking/Admin/APIs/BuildingInfo";

const BuildingPdfUploader = ({ onSubmit }) => {
  const dispatch = useDispatch();

  const [buildingName, setBuildingName] = useState("");
  const [buildingPdf, setBuildingPdf] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setBuildingPdf(file);
    } else {
      alert("Only PDF files are allowed.");
      e.target.value = null;
      setBuildingPdf(null);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!buildingName.trim()) {
      alert("Please enter the building name.");
      return;
    }

    if (!buildingPdf) {
      alert("Please upload a PDF file.");
      return;
    }

    const formData = new FormData();
    formData.append("building_name", buildingName);
    formData.append("building_info_pdf", buildingPdf);

    setLoading(true);
    try {
      await dispatch(UploadBuildinginfoSubmit(formData));
      alert("Submitted successfully!");
      setBuildingName("");
      setBuildingPdf(null);
      document.getElementById("building-pdf").value = null;
    } catch (error) {
      console.error("Submission failed:", error);
      alert("Failed to submit. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5 position-relative">
      <h2 className="mb-4">🕒 Pending Building Info</h2>
      <div className="text-center mb-5">

        <h2 className="fw-bold text-dark">📄 Upload Building Info</h2>
        <p className="text-muted">Provide the building name and upload its general information as a PDF.</p>
      </div>

      <div className="col-md-12 mx-auto">
        <form onSubmit={handleFormSubmit}>
          <div className="card shadow-sm mb-4 border-0">
            <div className="card-body">
              <div className="mb-3">
                <label htmlFor="building-name" className="form-label fw-semibold">Building Name</label>
                <div className="input-group">
                  <span className="input-group-text"><i className="bi bi-building"></i></span>
                  <input
                    type="text"
                    id="building-name"
                    className="form-control"
                    placeholder="e.g. Green Tower"
                    value={buildingName}
                    onChange={(e) => setBuildingName(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="mb-3">
                <label htmlFor="building-pdf" className="form-label fw-semibold">Upload PDF File</label>
                <div className="input-group">
                  <span className="input-group-text"><i className="bi bi-file-earmark-pdf"></i></span>
                  <input
                    type="file"
                    id="building-pdf"
                    className="form-control"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    disabled={loading}
                  />
                </div>
                {buildingPdf && (
                  <div className="mt-2 text-success">
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="text-end">
            <button
              type="submit"
              className="btn btn-success"
              disabled={loading || !buildingName || !buildingPdf}
            >
              <i className="bi bi-send-fill"></i> Submit
            </button>
          </div>
        </form>
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

BuildingPdfUploader.propTypes = {
  onSubmit: PropTypes.func.isRequired,
};

export default BuildingPdfUploader;
