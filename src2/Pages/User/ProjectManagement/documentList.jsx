import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteDocumentApi,
  fetchDocumentsApi,
  fetchLineItemsApi,
  uploadDocumentApi,
} from "../../../Networking/User/APIs/ProjectManagement/projectManagement";

export const DocumentList = ({ projectId }) => {
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);

  const { list, loading } = useSelector(
    (state) => state.workLetterdocumentSlice,
  );

  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (projectId) {
      dispatch(fetchDocumentsApi({ projectId }));
    }
  }, [dispatch, projectId]);

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);

      await dispatch(
        uploadDocumentApi({
          projectId,
          file,
        }),
      ).unwrap();

      dispatch(fetchDocumentsApi({ projectId }));
      const res = await dispatch(fetchLineItemsApi({ projectId })).unwrap();

      console.log(res, "res");
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleDelete = async (docId) => {
    if (!window.confirm("Are you sure you want to delete this document?"))
      return;

    try {
      setDeletingId(docId);
      await dispatch(
        deleteDocumentApi({
          projectId,
          documentId: docId,
        }),
      ).unwrap();

      dispatch(fetchDocumentsApi({ projectId }));
    } catch (err) {
      console.error("Delete failed", err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="fw-bold mb-0">Documents</h6>
          <button
            className="btn btn-sm btn-secondary"
            onClick={handleUploadClick}
            disabled={uploading}
          >
            {uploading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Uploading
              </>
            ) : (
              <>
                <i className="bi bi-upload me-1" />
                Upload
              </>
            )}
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          hidden
          onChange={handleFileChange}
          disabled={uploading}
        />
        <hr />
        {loading ? (
          <ul className="list-group list-group-flush">
            {Array.from({ length: 3 }).map((_, i) => (
              <li
                key={i}
                className="list-group-item d-flex justify-content-between align-items-center placeholder-glow py-2"
              >
                <div className="d-flex align-items-center gap-2 w-75">
                  <span
                    className="placeholder rounded"
                    style={{ width: 24, height: 24 }}
                  />
                  <span className="placeholder col-6"></span>
                </div>

                <span
                  className="placeholder rounded-circle"
                  style={{ width: 32, height: 32 }}
                ></span>
              </li>
            ))}
          </ul>
        ) : list.length === 0 ? (
          <div className="text-center text-muted py-4">
            <i className="bi bi-file-earmark-text fs-3 d-block mb-2" />
            No documents uploaded
          </div>
        ) : (
          <ul className="list-group list-group-flush">
            {list.map((doc) => (
              <li
                key={doc.id}
                className="list-group-item d-flex justify-content-between align-items-center py-2"
              >
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-file-earmark-text text-primary fs-5" />
                  <span className="fw-medium">
                    {doc.document_name || doc.filename}
                  </span>
                </div>

                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => handleDelete(doc.id)}
                  disabled={deletingId === doc.id}
                >
                  {deletingId === doc.id ? (
                    <span className="spinner-border spinner-border-sm" />
                  ) : (
                    <i className="bi bi-trash" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
