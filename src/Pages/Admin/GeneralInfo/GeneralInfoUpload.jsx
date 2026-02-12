import React, { useRef, useState } from "react";
import PropTypes from "prop-types";
import RAGLoader from "../../../Component/Loader";

const UploadSection = ({
  label,
  category,
  files,
  loadingField,
  handleFileChange,
  handleEdit,
  handleDelete,
  handleEditChange,
}) => {
  const fileInputRef = useRef(null);

  return (
    <div className="col-12 col-sm-6 col-md-3">
      <label className="form-label fw-semibold">{label}</label>
      <input
        type="file"
        accept="application/pdf"
        className="form-control mb-2"
        onChange={(e) => handleFileChange(e, category)}
        disabled={loadingField === category}
      />
      {loadingField === category && (
        <div className="text-center">
          <RAGLoader />
        </div>
      )}
      <div
        style={{ maxHeight: "200px", overflowY: "auto", border: "1px solid #ddd", borderRadius: "4px" }}
        className="hide-scrollbar"
      >
        <ul className="list-group list-group-flush">
          {files?.map((file, idx) => (
            <li
              key={idx}
              className="list-group-item py-1 d-flex justify-content-between align-items-center flex-wrap"
              title={file.name}
            >
              <span className="text-truncate" style={{ maxWidth: "70%" }}>
                <i className="bi bi-file-earmark-pdf text-danger me-2"></i>
                {file.name}
              </span>
              <span className="mt-1 mt-md-0">
                <i
                  className="bi bi-pencil-square text-primary me-2"
                  style={{ cursor: "pointer" }}
                  onClick={() => handleEdit(file, category, fileInputRef)}
                />
                <i
                  className="bi bi-trash text-danger"
                  style={{ cursor: "pointer" }}
                  onClick={() => handleDelete(file, category)}
                />
              </span>
            </li>
          ))}
        </ul>
      </div>

      <input
        type="file"
        accept="application/pdf"
        style={{ display: "none" }}
        ref={fileInputRef}
        onChange={(e) => handleEditChange(e, category)}
      />
    </div>
  );
};

UploadSection.propTypes = {
  label: PropTypes.string.isRequired,
  category: PropTypes.string.isRequired,
  files: PropTypes.array.isRequired,
  loadingField: PropTypes.string,
  handleFileChange: PropTypes.func.isRequired,
  handleEdit: PropTypes.func.isRequired,
  handleDelete: PropTypes.func.isRequired,
  handleEditChange: PropTypes.func.isRequired,
};

export default UploadSection;
