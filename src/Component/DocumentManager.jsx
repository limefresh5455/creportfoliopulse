import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  GeneralInfoSubmit,
  UploadGeneralDocSubmit,
  UploadfloorStack,
  FloorPlanStackListSubmit,
  FloorPlanStackDeleteSubmit,
} from "../Networking/Admin/APIs/GeneralinfoApi";
import { DeleteDocSubmit } from "../Networking/Admin/APIs/UploadDocApi";
import { toast } from "react-toastify";
import RAGLoader from "./Loader";
import { BackButton } from "./backButton";
import Pagination from "./pagination";

const DocumentManager = ({ category, title, description, building_Id }) => {
  const dispatch = useDispatch();

  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);
  const [tag, setTag] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const indexOfLastDoc = currentPage * itemsPerPage;
  const indexOfFirstDoc = indexOfLastDoc - itemsPerPage;
  const currentDocs = docs.slice(indexOfFirstDoc, indexOfLastDoc);

  const isFloorPlanCategory = ["floor_plan", "building_stack", "LOI"].includes(category);
  const fetchData = async () => {
    setListLoading(true);

    let placeholder = "";

    if (category === "floor_plan") {
      placeholder = "Enter tag for Floor Plan";
    } else if (category === "LOI") {
      placeholder = "Enter tag by Suite Number";
    }

    try {
      const res = await dispatch(
        isFloorPlanCategory
          ? FloorPlanStackListSubmit({ buildingId: building_Id, category })
          : GeneralInfoSubmit({ buildingId: building_Id, category })
      ).unwrap();

      if (Array.isArray(res)) {
        setDocs(
          res.map((f) => ({
            file_id: f.file_id,
            name: f.original_file_name,
            tag: f.tag || "",
          }))
        );
      }
    } catch (err) {
      console.error(`Error fetching ${category} docs:`, err);
    } finally {
      setListLoading(false);
    }
  };


  useEffect(() => {
    fetchData();
  }, [dispatch, category]);


  const uploadFile = async (file) => {
    const isFloorPlanOrStack =
      category === "floor_plan" || category === "building_stack" || category === "LOI";


    const allowedTypes = isFloorPlanOrStack
      ? ["application/pdf", "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]
      : ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "text/csv"];

    if (!allowedTypes.includes(file.type)) {
      toast.error(
        isFloorPlanOrStack
          ? "Only PDF and image files (JPG, PNG, GIF, WEBP) are allowed for this category"
          : "Only PDF, DOCX, XLSX, and CSV files are allowed"
      );
      return;
    }

    if (file.size > 30 * 1024 * 1024) {
      toast.error("File size must be under 30MB");
      return;
    }

    setLoading(true);
    try {
      if (isFloorPlanOrStack) {
        await dispatch(
          UploadfloorStack({
            file,
            category,
            building_Id,
            tag: category === "floor_plan" || category === "LOI" ? tag : undefined,
          })
        ).unwrap();
      } else {
        await dispatch(
          UploadGeneralDocSubmit({ file, category, building_Id })
        ).unwrap();
      }
      setTag("")
      toast.success("File uploaded successfully");
      await fetchData();
      if (category === "floor_plan") setTag("");
    } catch (err) {
      console.error("Upload failed:", err);

    } finally {
      setLoading(false);
    }
  };


  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) await uploadFile(file);
    e.target.value = null;
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) await uploadFile(file);
  };


  const openDeleteModal = (file) => {
    setFileToDelete(file);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!fileToDelete) return;

    setDeleteLoading(true);

    try {
      await dispatch(
        isFloorPlanCategory
          ? FloorPlanStackDeleteSubmit({ file_id: fileToDelete.file_id })
          : DeleteDocSubmit({ file_id: fileToDelete.file_id, category })
      ).unwrap();

      await fetchData();
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Failed to delete document");
    } finally {
      setDeleteLoading(false);
      setShowDeleteModal(false);
      setFileToDelete(null);
    }
  };


  return (
    <div className="container-fluid px-2 px-md-4">

      <div className="d-flex align-items-start align-items-md-center gap-2 pt-5 pt-md-3 pb-3">
        <BackButton className="flex-shrink-0" />
        <div className="flex-grow-1 min-w-0">
          <h5 className="fw-bold mb-0">{title}</h5>
          <p className="text-muted mb-0 description small">{description}</p>
        </div>
      </div>


      {
        (category === "floor_plan" || category === "LOI") && (
          <div className="mb-3">
            <label htmlFor="tag" className="form-label">
              Tag
            </label>

            <input
              type="text"
              id="tag"
              className="form-control"
              placeholder={
                category === "floor_plan" ? "Enter tag for Floor Plan" : "Enter tag by Suite Number"
              }
              value={tag}
              onChange={(e) => setTag(e.target.value)}
            />
          </div>
        )
      }



      <div
        className={`border border-2 rounded-3 p-3 text-center w-100 ${isDragging ? "border-primary bg-light" : "border-dashed bg-light"
          }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <i className="bi bi-upload fs-1 text-primary"></i>
        <h6 className="fw-semibold mt-3">Upload Documents</h6>
        <p className="text-muted mb-3">
          Drag and drop files here, or click to select files
        </p>

        <label className="btn btn-outline-primary">
          <i className="bi bi-file-earmark-arrow-up me-1"></i> Choose Files
          <input
            type="file"
            accept={
              category === "floor_plan" || category === "building_stack" || category === "LOI"
                ? ".pdf,.jpg,.jpeg,.png,.gif,.webp"
                : ".pdf,.csv,.docx,.xlsx"
            }
            onChange={handleFileChange}
            hidden
          />
        </label>

        <p className="small text-muted mt-2 text-wrap">
          Supports{" "}
          {category === "floor_plan" || category === "building_stack" || category === "LOI"
            ? "PDF and image files (JPG, PNG, GIF, WEBP)"
            : "PDF, DOCX, CSV, XLSX"}{" "}
          up to 30MB
        </p>

        {loading && <RAGLoader />}
      </div>


      <div className="card shadow-sm mt-4">
        <div className="card-header fw-semibold">Uploaded Documents</div>

        {listLoading ? (
          <div className="p-1 text-center">
            <p className="text-muted mt-2">Loading files...</p>
          </div>
        ) : (
          <ul className="list-group list-group-flush">
            {docs.length === 0 && (
              <li className="list-group-item text-muted text-center">
                No documents uploaded yet.
              </li>
            )}

            {currentDocs.map((file) => (
              <li
                key={file.file_id}
                className="list-group-item d-flex justify-content-between align-items-center flex-wrap"
              >
                <div
                  className="d-flex align-items-center text-truncate me-2"
                  style={{ maxWidth: "70%" }}
                >
                  <i className="bi bi-file-earmark-text text-primary me-2"></i>
                  <span className="text-truncate">{file.name}</span>
                  {file.tag && (
                    <span className="badge bg-secondary ms-2">{file.tag}</span>
                  )}
                </div>

                <div className="d-flex gap-2 mt-2 mt-md-0">
                  <i
                    className="bi bi-trash text-danger"
                    style={{ cursor: "pointer" }}
                    onClick={() => openDeleteModal(file)}
                  ></i>
                </div>
              </li>
            ))}
          </ul>
        )}


        {docs.length > 0 && (
          <Pagination
            totalItems={docs.length}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={(value) => {
              setItemsPerPage(value);
              setCurrentPage(1);
            }}
          />
        )}
      </div>


      {showDeleteModal && (
        <div
          className="modal fade show"
          style={{ display: "block", background: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Delete</h5>
                <button
                  className="btn-close"
                  onClick={() => setShowDeleteModal(false)}
                ></button>
              </div>

              <div className="modal-body">
                <p>
                  Are you sure you want to delete:
                  <br />
                  <strong>{fileToDelete?.name}</strong> ?
                </p>
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-danger"
                  onClick={confirmDelete}
                  disabled={deleteLoading}
                >
                  {deleteLoading ? (
                    <span className="spinner-border spinner-border-sm"></span>
                  ) : (
                    "Delete"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentManager;
