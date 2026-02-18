import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import "bootstrap-icons/font/bootstrap-icons.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { BsPlusLg } from "react-icons/bs";
import RAGLoader from "../../../Component/Loader";
import {
  DeleteRenewalById,
  GetRenewalById,
  GetRenewalTrackerList,
  UpdateRenewalById,
} from "../../../Networking/Admin/APIs/RenewalTrackeApi";

export const RenewalTrackerList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, list, error } = useSelector((state) => state.RenewalSlice);

  const role = sessionStorage.getItem("role");
  const Role = role;

  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [detail, setDetail] = useState(null);
  const [deleteModal, setDeleteModal] = useState({
    show: false,
    id: null,
    name: "",
    loading: false,
  });
  const [detailLoading, setDetailLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "asc",
  });

  const confirmDelete = (id, name) => {
    setDeleteModal({
      show: true,
      id,
      name,
      loading: false,
    });
  };

  useEffect(() => {
    dispatch(GetRenewalTrackerList());
  }, [dispatch]);

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return {
          key,
          direction: prev.direction === "asc" ? "desc" : "asc",
        };
      }
      return { key, direction: "asc" };
    });
  };

  const sortedList = useMemo(() => {
    if (!list) return [];

    let sortable = [...list];

    if (!sortConfig.key) return sortable;

    sortable.sort((a, b) => {
      let valA = a.data[sortConfig.key];
      let valB = b.data[sortConfig.key];

      if (sortConfig.key.includes("date")) {
        valA = new Date(valA || 0).getTime();
        valB = new Date(valB || 0).getTime();
      }

      if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
      if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

    return sortable;
  }, [list, sortConfig]);

  const openDetailModal = async (id, edit = false) => {
    setShowModal(true);
    setIsEdit(edit);
    setDetailLoading(true);

    try {
      const data = await dispatch(GetRenewalById(id)).unwrap();

      const initializedData = {
        ...data?.data,
        lease_commencement_date: data?.data?.lease_commencement_date || "",
        lease_expiration_date: data?.data?.lease_expiration_date || "",
        notice_of_renewal_date: data?.data?.notice_of_renewal_date || "",
        renewal_clause: data?.data?.renewal_clause || false,
        notes: data?.data?.notes || "",
        q1: data?.data?.q1 || {
          check_in: false,
          headcount_confirmation: false,
          building_update_note_sent: false,
          holiday_gift: true,
        },
        q2: data?.data?.q2 || {
          check_in: false,
          headcount_confirmation: false,
          building_update_note_sent: false,
          holiday_gift: true,
        },
        q3: data?.data?.q3 || {
          check_in: false,
          headcount_confirmation: false,
          building_update_note_sent: false,
          holiday_gift: true,
        },
        q4: data?.data?.q4 || {
          check_in: false,
          headcount_confirmation: false,
          building_update_note_sent: false,
          holiday_gift: true,
        },
      };

      setDetail({ ...data, data: initializedData });
    } catch (error) {
      console.error("Error fetching details:", error);
      toast.error("Failed to load renewal details");
    } finally {
      setDetailLoading(false);
    }
  };

  const handleNavigate = () => {
    {
      Role === "admin"
        ? navigate("/renewal-tracker-form")
        : navigate("/user-renewal-tracker-form");
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.id) return;

    setDeleteModal((prev) => ({ ...prev, loading: true }));

    try {
      await dispatch(DeleteRenewalById(deleteModal.id)).unwrap();
      dispatch(GetRenewalTrackerList());
      toast.success("Renewal deleted successfully!");
      setDeleteModal({ show: false, id: null, name: "", loading: false });
    } catch (error) {
      console.error("Error deleting Renewal:", error);
      toast.error("Failed to delete Renewal. Please try again.");
      setDeleteModal((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setDetail((prev) => ({
        ...prev,
        data: {
          ...prev.data,
          [parent]: {
            ...prev.data[parent],
            [child]: type === "checkbox" ? checked : value,
          },
        },
      }));
    } else {
      setDetail((prev) => ({
        ...prev,
        data: {
          ...prev.data,
          [name]: type === "checkbox" ? checked : value,
        },
      }));
    }
  };

  const handleSave = async () => {
    if (!detail?.id) return;

    setIsSaving(true);
    try {
      await dispatch(
        UpdateRenewalById({
          tracker_id: detail.id,
          data: {
            tenant_name: detail.data.tenant_name,
            building_address: detail.data.building_address,
            floor_suite: detail.data.floor_suite,
            lease_commencement_date: detail.data.lease_commencement_date,
            lease_expiration_date: detail.data.lease_expiration_date,
            tenant_headcount: detail.data.tenant_headcount
              ? parseInt(detail.data.tenant_headcount)
              : 0,
            notice_of_renewal_date: detail.data.notice_of_renewal_date,
            renewal_clause: detail.data.renewal_clause || false,
            tenant_current_rent: detail.data.tenant_current_rent,
            most_recent_building_comp: detail.data.most_recent_building_comp,
            tenant_contact_info: detail.data.tenant_contact_info,
            notes: detail.data.notes,
            q1: detail.data.q1,
            q2: detail.data.q2,
            q3: detail.data.q3,
            q4: detail.data.q4,
          },
        }),
      ).unwrap();

      dispatch(GetRenewalTrackerList());
      setShowModal(false);
      setIsEdit(false);
      toast.success("Renewal updated successfully!");
    } catch (error) {
      console.error("Error updating Renewal:", error);
      toast.error("Failed to update Renewal. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "";
      return date.toISOString().split("T")[0];
    } catch (error) {
      return "";
    }
  };

  const renderQuarterSection = (quarter, quarterName) => (
    <div className="border p-3 mb-3 rounded">
      <h6 className="fw-bold mb-3">{quarterName.toUpperCase()}</h6>
      <div className="row">
        <div className="col-md-6">
          <div className="form-check mb-2">
            {isEdit ? (
              <input
                type="checkbox"
                className="form-check-input"
                name={`${quarter}.check_in`}
                checked={detail?.data?.[quarter]?.check_in ?? false}
                onChange={handleChange}
                id={`${quarter}-checkin`}
              />
            ) : (
              <input
                type="checkbox"
                className="form-check-input"
                checked={detail?.data?.[quarter]?.check_in ?? false}
                disabled
              />
            )}
            <label className="form-check-label" htmlFor={`${quarter}-checkin`}>
              Check In
            </label>
          </div>

          <div className="form-check mb-2">
            {isEdit ? (
              <input
                type="checkbox"
                className="form-check-input"
                name={`${quarter}.headcount_confirmation`}
                checked={
                  detail?.data?.[quarter]?.headcount_confirmation ?? false
                }
                onChange={handleChange}
                id={`${quarter}-headcount`}
              />
            ) : (
              <input
                type="checkbox"
                className="form-check-input"
                checked={
                  detail?.data?.[quarter]?.headcount_confirmation ?? false
                }
                disabled
              />
            )}
            <label
              className="form-check-label"
              htmlFor={`${quarter}-headcount`}
            >
              Headcount Confirmation
            </label>
          </div>
        </div>

        <div className="col-md-6">
          <div className="form-check mb-2">
            {isEdit ? (
              <input
                type="checkbox"
                className="form-check-input"
                name={`${quarter}.building_update_note_sent`}
                checked={
                  detail?.data?.[quarter]?.building_update_note_sent ?? false
                }
                onChange={handleChange}
                id={`${quarter}-note-sent`}
              />
            ) : (
              <input
                type="checkbox"
                className="form-check-input"
                checked={
                  detail?.data?.[quarter]?.building_update_note_sent ?? false
                }
                disabled
              />
            )}
            <label
              className="form-check-label"
              htmlFor={`${quarter}-note-sent`}
            >
              Building Update Note Sent
            </label>
          </div>

          <div className="form-check mb-2">
            {isEdit ? (
              <input
                type="checkbox"
                className="form-check-input"
                name={`${quarter}.holiday_gift`}
                checked={detail?.data?.[quarter]?.holiday_gift ?? false}
                onChange={handleChange}
                id={`${quarter}-holiday-gift`}
              />
            ) : (
              <input
                type="checkbox"
                className="form-check-input"
                checked={detail?.data?.[quarter]?.holiday_gift ?? false}
                disabled
              />
            )}
            <label
              className="form-check-label"
              htmlFor={`${quarter}-holiday-gift`}
            >
              Holiday Gift
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="header-bg d-flex justify-content-between px-3 align-items-center sticky-header">
        <h5 className="mb-0 text-light mx-4">Renewal Tracker List</h5>
        <button
          className="btn btn-secondary d-flex align-items-center gap-2"
          onClick={() => handleNavigate()}
          style={{ fontWeight: "600", padding: "0.5rem 1rem" }}
        >
          <BsPlusLg /> Add Renewal
        </button>
      </div>
      <div className="container-fuild p-4">
        {loading && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "200px",
            }}
          >
            <RAGLoader />
          </div>
        )}

        {!loading && list?.length === 0 && (
          <div className="text-center my-5">
            <p className="text-muted fs-5">No renewal entries found.</p>
          </div>
        )}

        {!loading && list?.length > 0 && (
          <div className="table-responsive shadow-sm bg-white rounded">
            <table className="table align-middle">
              <thead>
                <tr className="table-light text-uppercase small fw-bold">
                  <th className="text-nowrap">Tenant Name</th>
                  <th className="text-nowrap">Floor / Suite</th>
                  <th className="text-nowrap">Commencement Date</th>

                  <th
                    className="text-nowrap"
                    role="button"
                    onClick={() => handleSort("lease_expiration_date")}
                    style={{ cursor: "pointer" }}
                  >
                    Expiration Date{" "}
                    {sortConfig.key === "lease_expiration_date" &&
                      (sortConfig.direction === "asc" ? " ↑" : " ↓")}
                  </th>

                  <th
                    className="text-nowrap"
                    role="button"
                    onClick={() => handleSort("tenant_headcount")}
                    style={{ cursor: "pointer" }}
                  >
                    Headcount{" "}
                    {sortConfig.key === "tenant_headcount" &&
                      (sortConfig.direction === "asc" ? " ↑" : " ↓")}
                  </th>

                  <th className="text-nowrap">Building Address</th>
                  <th className="text-nowrap">Last Edited By</th>
                  <th className="text-nowrap text-center">Actions</th>
                </tr>
              </thead>

              <tbody className="text-center">
                {sortedList.map((item) => (
                  <tr key={item.id} className="border-bottom">
                    <td>{item?.data?.tenant_name || "N/A"}</td>
                    <td>{item?.data?.floor_suite || "N/A"}</td>
                    <td>
                      {item?.data?.lease_commencement_date?.slice(0, 10) ||
                        "N/A"}
                    </td>
                    <td>
                      {item?.data?.lease_expiration_date?.slice(0, 10) || "N/A"}
                    </td>
                    <td>{item?.data?.tenant_headcount || 0}</td>
                    <td
                      style={{
                        maxWidth: "200px",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {item?.data?.building_address || "N/A"}
                    </td>
                    <td>
                      <div
                        className="text-truncate"
                        style={{ maxWidth: "100px" }}
                      >
                        {item?.updated_by_email || "N/A"}
                      </div>
                    </td>

                    <td className="text-center table-icons">
                      <button
                        className="btn btn-outline-primary btn-sm rounded-circle me-2"
                        onClick={() => openDetailModal(item.id, false)}
                        title="View Details"
                      >
                        <i className="bi bi-eye"></i>
                      </button>
                      <button
                        className="btn btn-outline-warning btn-sm rounded-circle me-2"
                        onClick={() => openDetailModal(item.id, true)}
                        title="Edit"
                      >
                        <i className="bi bi-pencil-square"></i>
                      </button>

                      <button
                        className="btn btn-outline-danger btn-sm rounded-circle"
                        onClick={() =>
                          confirmDelete(item.id, item?.data?.tenant_name)
                        }
                        title="Delete"
                      >
                        <i className="bi bi-trash3"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {deleteModal.show && (
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
                    onClick={() =>
                      setDeleteModal({
                        show: false,
                        id: null,
                        name: "",
                        loading: false,
                      })
                    }
                    disabled={deleteModal.loading}
                  ></button>
                </div>
                <div className="modal-body">
                  Are you sure you want to delete{" "}
                  <strong>{deleteModal.name || "this renewal"}</strong>?
                </div>
                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    onClick={() =>
                      setDeleteModal({
                        show: false,
                        id: null,
                        name: "",
                        loading: false,
                      })
                    }
                    disabled={deleteModal.loading}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={handleDelete}
                    disabled={deleteModal.loading}
                  >
                    {deleteModal.loading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Deleting...
                      </>
                    ) : (
                      "Delete"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showModal && (
          <div
            className="modal fade show"
            style={{ display: "block", background: "rgba(0,0,0,0.5)" }}
          >
            <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title fw-bold">
                    {isEdit ? "Edit Renewal" : "Renewal Details"}
                  </h5>
                  <button
                    className="btn-close"
                    onClick={() => {
                      setShowModal(false);
                      setIsEdit(false);
                    }}
                    disabled={isSaving || detailLoading}
                  ></button>
                </div>

                <div className="modal-body">
                  {detailLoading ? (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "200px",
                      }}
                    >
                      <RAGLoader />
                    </div>
                  ) : (
                    <div className="row g-3">
                      <div className="col-12">
                        <h5 className="fw-bold border-bottom pb-2 mb-3">
                          Basic Information
                        </h5>
                      </div>

                      <div className="col-md-6">
                        <label className="form-label fw-bold">
                          Tenant Name:
                        </label>
                        {isEdit ? (
                          <input
                            type="text"
                            className="form-control"
                            name="tenant_name"
                            value={detail?.data?.tenant_name || ""}
                            onChange={handleChange}
                          />
                        ) : (
                          <p className="mb-0">{detail?.data?.tenant_name}</p>
                        )}
                      </div>

                      <div className="col-md-6">
                        <label className="form-label fw-bold">
                          Floor / Suite:
                        </label>
                        {isEdit ? (
                          <input
                            type="text"
                            className="form-control"
                            name="floor_suite"
                            value={detail?.data?.floor_suite || ""}
                            onChange={handleChange}
                          />
                        ) : (
                          <p className="mb-0">{detail?.data?.floor_suite}</p>
                        )}
                      </div>

                      <div className="col-md-6">
                        <label className="form-label fw-bold">
                          Building Address:
                        </label>
                        {isEdit ? (
                          <input
                            type="text"
                            className="form-control"
                            name="building_address"
                            value={detail?.data?.building_address || ""}
                            onChange={handleChange}
                          />
                        ) : (
                          <p className="mb-0">
                            {detail?.data?.building_address}
                          </p>
                        )}
                      </div>

                      <div className="col-md-6">
                        <label className="form-label fw-bold">Headcount:</label>
                        {isEdit ? (
                          <input
                            type="number"
                            className="form-control"
                            name="tenant_headcount"
                            value={detail?.data?.tenant_headcount || 0}
                            onChange={handleChange}
                          />
                        ) : (
                          <p className="mb-0">
                            {detail?.data?.tenant_headcount}
                          </p>
                        )}
                      </div>

                      <div className="col-12 mt-4">
                        <h5 className="fw-bold border-bottom pb-2 mb-3">
                          Dates
                        </h5>
                      </div>

                      <div className="col-md-4">
                        <label className="form-label fw-bold">
                          Lease Commencement Date:
                        </label>
                        {isEdit ? (
                          <input
                            type="date"
                            className="form-control"
                            name="lease_commencement_date"
                            value={formatDateForInput(
                              detail?.data?.lease_commencement_date,
                            )}
                            onChange={handleChange}
                          />
                        ) : (
                          <p className="mb-0">
                            {detail?.data?.lease_commencement_date?.slice(
                              0,
                              10,
                            ) || "N/A"}
                          </p>
                        )}
                      </div>

                      <div className="col-md-4">
                        <label className="form-label fw-bold">
                          Lease Expiration Date:
                        </label>
                        {isEdit ? (
                          <input
                            type="date"
                            className="form-control"
                            name="lease_expiration_date"
                            value={formatDateForInput(
                              detail?.data?.lease_expiration_date,
                            )}
                            onChange={handleChange}
                          />
                        ) : (
                          <p className="mb-0">
                            {detail?.data?.lease_expiration_date?.slice(
                              0,
                              10,
                            ) || "N/A"}
                          </p>
                        )}
                      </div>

                      <div className="col-md-4">
                        <label className="form-label fw-bold">
                          Notice of Renewal Date:
                        </label>
                        {isEdit ? (
                          <input
                            type="date"
                            className="form-control"
                            name="notice_of_renewal_date"
                            value={formatDateForInput(
                              detail?.data?.notice_of_renewal_date,
                            )}
                            onChange={handleChange}
                          />
                        ) : (
                          <p className="mb-0">
                            {detail?.data?.notice_of_renewal_date?.slice(
                              0,
                              10,
                            ) || "N/A"}
                          </p>
                        )}
                      </div>

                      <div className="col-12 mt-4">
                        <h5 className="fw-bold border-bottom pb-2 mb-3">
                          Renewal Information
                        </h5>
                      </div>

                      <div className="col-md-6">
                        <div className="form-check">
                          {isEdit ? (
                            <input
                              type="checkbox"
                              className="form-check-input"
                              name="renewal_clause"
                              checked={detail?.data?.renewal_clause || false}
                              onChange={handleChange}
                              id="renewal-clause"
                            />
                          ) : (
                            <input
                              type="checkbox"
                              className="form-check-input"
                              checked={detail?.data?.renewal_clause || false}
                              disabled
                            />
                          )}
                          <label
                            className="form-check-label"
                            htmlFor="renewal-clause"
                          >
                            Renewal Clause
                          </label>
                        </div>
                      </div>

                      <div className="col-md-6">
                        <label className="form-label fw-bold">
                          Tenant Current Rent:
                        </label>
                        {isEdit ? (
                          <input
                            type="text"
                            className="form-control"
                            name="tenant_current_rent"
                            value={detail?.data?.tenant_current_rent || ""}
                            onChange={handleChange}
                          />
                        ) : (
                          <p className="mb-0">
                            {detail?.data?.tenant_current_rent || "N/A"}
                          </p>
                        )}
                      </div>

                      <div className="col-md-12 mt-2">
                        <label className="form-label fw-bold">
                          Most Recent Building Comp:
                        </label>
                        {isEdit ? (
                          <input
                            type="text"
                            className="form-control"
                            name="most_recent_building_comp"
                            value={
                              detail?.data?.most_recent_building_comp || ""
                            }
                            onChange={handleChange}
                          />
                        ) : (
                          <p className="mb-0">
                            {detail?.data?.most_recent_building_comp || "N/A"}
                          </p>
                        )}
                      </div>

                      <div className="col-12 mt-4">
                        <h5 className="fw-bold border-bottom pb-2 mb-3">
                          Contact Information
                        </h5>
                      </div>

                      <div className="col-12">
                        <label className="form-label fw-bold">
                          Tenant Contact Info:
                        </label>
                        {isEdit ? (
                          <textarea
                            className="form-control"
                            name="tenant_contact_info"
                            value={detail?.data?.tenant_contact_info || ""}
                            onChange={handleChange}
                            rows="3"
                          />
                        ) : (
                          <p className="mb-0">
                            {detail?.data?.tenant_contact_info || "N/A"}
                          </p>
                        )}
                      </div>
                      <div className="col-12 mt-4">
                        <h5 className="fw-bold border-bottom pb-2 mb-3">
                          Notes
                        </h5>
                      </div>

                      <div className="col-12">
                        {isEdit ? (
                          <textarea
                            className="form-control"
                            name="notes"
                            value={detail?.data?.notes || ""}
                            onChange={handleChange}
                            rows="4"
                            placeholder="Enter any notes related to this renewal..."
                          />
                        ) : (
                          <p className="mb-0">{detail?.data?.notes || "N/A"}</p>
                        )}
                      </div>

                      <div className="col-12 mt-4">
                        <h5 className="fw-bold border-bottom pb-2 mb-3">
                          Quarterly Checks
                        </h5>
                      </div>
                      {renderQuarterSection("q1", "Quarter 1")}
                      {renderQuarterSection("q2", "Quarter 2")}
                      {renderQuarterSection("q3", "Quarter 3")}
                      {renderQuarterSection("q4", "Quarter 4")}
                    </div>
                  )}
                </div>

                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowModal(false);
                      setIsEdit(false);
                    }}
                    disabled={isSaving || detailLoading}
                  >
                    {isEdit ? "Cancel" : "Close"}
                  </button>
                  {isEdit && !detailLoading && (
                    <button
                      className="btn btn-primary"
                      onClick={handleSave}
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                            aria-hidden="true"
                          ></span>
                          Saving...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
