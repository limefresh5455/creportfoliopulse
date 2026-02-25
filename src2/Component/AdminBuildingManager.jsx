import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import "bootstrap-icons/font/bootstrap-icons.css";
import RAGLoader from "./Loader";

export const AdminBuildingManager = ({
  category,
  heading,
  fetchAction,
  createAction,
  updateAction,
  deleteAction,
  navigateTo,
  navigateStateMapper,
}) => {
  const { BuildingList } = useSelector((state) => state.BuildingSlice);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cardsRef = useRef([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [address, setAddress] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editBuildingId, setEditBuildingId] = useState(null);
  const [editFieldValue, setEditFieldValue] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      await dispatch(fetchAction(category));
      setLoading(false);
    })();
  }, [dispatch, fetchAction, category]);

  const filteredBuildings = BuildingList.filter((b) => {
    const addr = b.address?.toLowerCase() || "";
    return addr.includes(searchTerm.toLowerCase());
  });

  const saveEdit = async (id) => {
    if (!editFieldValue.trim()) return;
    setLoading(true);
    await dispatch(updateAction({ building_id: id, address: editFieldValue }));
    await dispatch(fetchAction(category));
    setEditBuildingId(null);
    setLoading(false);
  };

  const handleDelete = async (id) => {
    setDeleteLoading(true);
    await dispatch(deleteAction(id));
    await dispatch(fetchAction(category));
    setDeleteLoading(false);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!address.trim()) return;

    setLoading(true);
    await dispatch(createAction([{ category, address }]));
    await dispatch(fetchAction(category));
    setAddress("");
    setLoading(false);
  };

  const handleNavigate = (building) => {
    console.log(building, "building");

    navigate(navigateTo, {
      state: navigateStateMapper ? navigateStateMapper(building) : {},
    });
  };

  return (
    <div className="container-fluid p-3">
      {deleteLoading && (
        <div className="upload-overlay">
          <div className="spinner-border text-primary" />
          <p className="mt-2">Deleting building...</p>
        </div>
      )}

      <div
        className="text-center bg-white rounded shadow-sm py-3 mb-4"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          borderBottom: "1px solid #dee2e6",
        }}
      >
        <h4 className="fw-bold">{heading}</h4>
        <input
          type="search"
          className="form-control mx-auto mt-2"
          style={{ maxWidth: 420 }}
          placeholder="Search by address"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="d-flex justify-content-center py-5">
          <RAGLoader />
        </div>
      ) : (
        <>
          <form onSubmit={handleAdd} className="row g-2 mb-4">
            <div className="col-md-9">
              <input
                className="form-control"
                placeholder="Enter building address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <button className="btn btn-success w-100">
                <i className="bi bi-plus-circle me-2" />
                Add Building
              </button>
            </div>
          </form>

          {[...filteredBuildings].reverse().map((building, i) => (
            <div
              key={building.id}
              ref={(el) => (cardsRef.current[i] = el)}
              className="card shadow-sm mb-3 p-3 rounded-4"
            >
              <div className="d-flex justify-content-between align-items-center">
                {editBuildingId === building.id ? (
                  <input
                    className="form-control me-2"
                    value={editFieldValue}
                    onChange={(e) => setEditFieldValue(e.target.value)}
                  />
                ) : (
                  <div
                    className="col-md-10 d-flex align-items-center"
                    style={{ cursor: "pointer" }}
                    onClick={() => handleNavigate(building)}
                  >
                    <i className="bi bi-geo-alt-fill text-primary me-2" />
                    {building.address}
                  </div>
                )}

                <div>
                  {editBuildingId === building.id ? (
                    <>
                      <i
                        className="bi bi-check-circle-fill text-success me-3"
                        onClick={() => saveEdit(building.id)}
                      />
                      <i
                        className="bi bi-x-circle-fill text-secondary"
                        onClick={() => setEditBuildingId(null)}
                      />
                    </>
                  ) : (
                    <>
                      <i
                        className="bi bi-pencil-square text-primary me-3"
                        onClick={() => {
                          setEditBuildingId(building.id);
                          setEditFieldValue(building.address);
                        }}
                      />
                      <i
                        className="bi bi-trash text-danger"
                        onClick={() => handleDelete(building.id)}
                      />
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
};
