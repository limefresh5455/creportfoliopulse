import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import RAGLoader from "../../../Component/Loader";
import {
  DeleteDocSubmit,
  UploadDocSubmit,
} from "../../../Networking/Admin/APIs/UploadDocApi";
import { GeneralInfoSubmit } from "../../../Networking/Admin/APIs/GeneralinfoApi";

export const PortfolioVoice = () => {
  const dispatch = useDispatch();
  const [documents, setDocuments] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState(null);


  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);

      const res = await dispatch(
        GeneralInfoSubmit({
          category: "portfolio",
        })
      ).unwrap();

      setDocuments(res);
    } catch (error) {
      console.error("Failed to fetch documents:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (!selectedFiles.length) {
      toast.warning("No files selected.");
      return;
    }

    const MAX_FILE_SIZE_MB = 30;
    const oversizedFiles = selectedFiles.filter(
      (file) => file.size > MAX_FILE_SIZE_MB * 1024 * 1024
    );

    if (oversizedFiles.length > 0) {
      toast.error(
        "Some files exceed the 30MB size limit. Please upload smaller files."
      );
      return;
    }

    const ALLOWED_TYPES = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/csv",
    ];

    const invalidFiles = selectedFiles.filter(
      (file) => !ALLOWED_TYPES.includes(file.type)
    );
    if (invalidFiles.length > 0) {
      toast.error("Some files are not supported document types.");
      return;
    }

    try {
      setIsUploading(true);
      await dispatch(
        UploadDocSubmit({
          files: selectedFiles,
          category: "portfolio",
        })
      ).unwrap();
      await fetchDocuments();
    } catch (error) {
      console.error(error);
    } finally {
      setIsUploading(false);
      e.target.value = null;
    }
  };

  const confirmDeleteDoc = async () => {
    if (!selectedFileId) return;

    try {
      setIsDeleting((prev) => ({ ...prev, [selectedFileId]: true }));

      await dispatch(
        DeleteDocSubmit({ file_id: selectedFileId })
      ).unwrap();

      await fetchDocuments();
    } catch (error) {
      console.error("Failed to delete document:", error);

    } finally {
      setIsDeleting((prev) => ({ ...prev, [selectedFileId]: false }));
      setShowConfirm(false);
      setSelectedFileId(null);
    }
  };



  const filteredDocs = documents.filter(
    (doc) =>
      doc.category === "portfolio" &&
      doc.original_file_name.toLowerCase().includes(search.toLowerCase())
  );

  const sortedDocs = [...filteredDocs].sort((a, b) => {
    if (!sortBy) return 0;

    if (sortBy === "date") {
      const dateA = new Date(a.uploaded_at).getTime();
      const dateB = new Date(b.uploaded_at).getTime();
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    }

    if (sortBy === "size") {
      const sizeA = a.size?.toLowerCase().includes("kb")
        ? parseFloat(a.size) / 1024
        : parseFloat(a.size) || 0;
      const sizeB = b.size?.toLowerCase().includes("kb")
        ? parseFloat(b.size) / 1024
        : parseFloat(b.size) || 0;
      return sortOrder === "asc" ? sizeA - sizeB : sizeB - sizeA;
    }

    return 0;
  });

  const totalSizeMB = documents.reduce((sum, doc) => {
    const sizeNum = parseFloat(doc.size) || 0;
    return (
      sum + (doc.size?.toLowerCase().includes("kb") ? sizeNum / 1024 : sizeNum)
    );
  }, 0);

  return (
    <div className="container-fuild p-3 ">
      <div className="d-flex flex-column flex-md-row justify-content-center justify-content-md-between align-items-center align-items-md-center mb-3 gap-3">
        <div className="mb-4 text-center text-md-start">
          <h4 className="fw-bold">Portfolio Voice</h4>
          <p className="text-muted mb-0">
            Upload and manage documents for data retrieval
          </p>
        </div>
        <div>
          <label className="btn btn-primary d-flex align-items-center mb-0">
            <i className="bi bi-upload me-2"></i>
            {isUploading ? "Uploading..." : "Upload Files"}
            <input
              type="file"
              accept=".pdf,.docx,.csv,.xlsx"
              multiple
              hidden
              onChange={handleFileChange}
              disabled={isUploading}
            />
          </label>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-3 gap-2">
            <h5 className="fw-bold mb-2 mb-md-0">
              <i className="bi bi-file-earmark-text me-2"></i> Document Library
            </h5>
            <div className="d-flex flex-wrap align-items-center gap-2">
              <span className="badge bg-dark">
                {documents.length} Documents
              </span>
              <span className="badge bg-light text-dark">
                {totalSizeMB.toFixed(2)} MB Total
              </span>
            </div>
          </div>

          <div className="d-flex flex-column flex-md-row gap-2 mb-3 w-100">
            <div className="flex-grow-1">
              <input
                type="text"
                className="form-control"
                placeholder="Search documents..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="d-flex gap-2 flex-wrap mt-2 mt-md-0">
              <button
                className="btn btn-outline-secondary"
                onClick={() => {
                  setSortBy("size");
                  setSortOrder(
                    sortBy === "size" && sortOrder === "asc" ? "desc" : "asc"
                  );
                }}
              >
                Sort by Size{" "}
                {sortBy === "size" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
              </button>
            </div>
          </div>

          {loading ? (
            <div className="d-flex justify-content-center py-5">
              <RAGLoader />
            </div>
          ) : sortedDocs.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Size</th>
                    <th>Uploaded</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedDocs.map((doc) => (
                    <tr key={doc.file_id}>
                      <td>
                        <a>{doc.original_file_name}</a>
                      </td>
                      <td>
                        {parseFloat(doc.size)
                          ? (doc.size.toLowerCase().includes("kb")
                            ? parseFloat(doc.size) / 1024
                            : parseFloat(doc.size)
                          ).toFixed(2)
                          : doc.size}{" "}
                        MB
                      </td>
                      <td>{new Date(doc.uploaded_at).toLocaleDateString()}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => {
                            setSelectedFileId(doc.file_id);
                            setShowConfirm(true);
                          }}
                        >
                          Delete
                        </button>

                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center text-muted py-4">
              No documents uploaded yet.
            </div>
          )}
        </div>
      </div>
      {showConfirm && (
        <div className="modal fade show d-block" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Delete</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowConfirm(false)}
                ></button>
              </div>

              <div className="modal-body">
                <p className="mb-0">
                  Are you sure you want to delete this document?

                </p>
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowConfirm(false)}
                >
                  Cancel
                </button>

                <button
                  className="btn btn-danger"
                  onClick={confirmDeleteDoc}
                  disabled={isDeleting[selectedFileId]}
                >
                  {isDeleting[selectedFileId] ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};