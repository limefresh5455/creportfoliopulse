import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap-icons/font/bootstrap-icons.css";
import {
  DeleteBuilding,
  ListBuildingSubmit,
  CreateBuildingSubmit,
  UpdateBuildingSubmit,
} from "../../../Networking/Admin/APIs/BuildingApi";
import { useDispatch, useSelector } from "react-redux";
import RAGLoader from "../../../Component/Loader";

export const BuildingInfoList = () => {
  const { BuildingList } = useSelector((state) => state.BuildingSlice);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cardsRef = useRef([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [address, setAddress] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [currentOccupancy, setCurrentOccupancy] = useState("");
  const [editBuildingId, setEditBuildingId] = useState(null);
  const [editFieldValue, setEditFieldValue] = useState("");
  const [editOccupancy, setEditOccupancy] = useState("");

  useEffect(() => {
    const fetchBuildings = async () => {
      setLoading(true);
      const category = "BuildingInfo";
      await dispatch(ListBuildingSubmit(category));
      setLoading(false);
    };
    fetchBuildings();
  }, [dispatch]);

  useEffect(() => {
    if (!loading) {
      cardsRef.current.forEach((card, i) => {
        if (card) {
          card.classList.remove("visible");
          setTimeout(() => {
            card.classList.add("visible");
          }, i * 150);
        }
      });
    }
  }, [BuildingList, searchTerm, loading]);

  const goToChat = (buildingId, category) => {
    navigate("/building-info-upload", {
      state: { buildingId, category },
    });
  };

  const startEdit = (building) => {
    setEditBuildingId(building.id);
    setEditFieldValue(building.address || "");
    setEditOccupancy(building.current_occupancy ?? "");
  };

  const saveEdit = async (buildingId) => {
    if (!editFieldValue.trim()) return;
    setLoading(true);

    try {
      const payload = {
        building_id: buildingId,
        address: editFieldValue,
        current_occupancy: Number(editOccupancy),
      };

      await dispatch(UpdateBuildingSubmit(payload)).unwrap();

      await dispatch(ListBuildingSubmit("BuildingInfo"));

      setEditBuildingId(null);
    } catch (error) {
      console.error("Error updating building:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (buildingId) => {
    try {
      setDeleteLoading(true);
      await dispatch(DeleteBuilding(buildingId));
      await dispatch(ListBuildingSubmit("BuildingInfo"));
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!address.trim()) return;

    setLoading(true);
    try {
      const payload = [
        {
          category: "BuildingInfo",
          address: address,
          current_occupancy: Number(currentOccupancy),
        },
      ];

      await dispatch(CreateBuildingSubmit(payload)).unwrap();

      await dispatch(ListBuildingSubmit("BuildingInfo"));

      setAddress("");
      setCurrentOccupancy("");
    } catch (error) {
      console.error("Error submitting building:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBuildings = BuildingList.filter((building) => {
    const name = building.building_name?.toLowerCase() || "";
    const addr = building.address?.toLowerCase() || "";
    const term = searchTerm.toLowerCase();
    return name.includes(term) || addr.includes(term);
  });

  const BuildingCard = ({ building, index }) => (
    <div
      ref={(el) => (cardsRef.current[index] = el)}
      className="card border-0 shadow-sm hover-shadow w-100"
      style={{
        backgroundColor: "#fff",
        borderWidth: "0.1px",
        borderColor: "#cacacaff",
        borderRadius: "16px",
      }}
    >
      <div className="position-absolute top-0 end-0 p-0 mx-4">
        {editBuildingId === building.id ? (
          <>
            <i
              className="bi bi-check-circle-fill text-success me-3"
              style={{ cursor: "pointer", fontSize: "1.2rem" }}
              onClick={() => saveEdit(building.id)}
              title="Save"
            ></i>
            <i
              className="bi bi-x-circle-fill text-secondary"
              style={{ cursor: "pointer", fontSize: "1.2rem" }}
              onClick={() => setEditBuildingId(null)}
              title="Cancel"
            ></i>
          </>
        ) : (
          <>
            <i
              className="bi bi-pencil-square text-primary me-3"
              style={{ cursor: "pointer", fontSize: "1.2rem" }}
              onClick={() => startEdit(building)}
              title="Edit"
            ></i>
            <i
              className="bi bi-trash text-danger"
              style={{ cursor: "pointer", fontSize: "1.2rem" }}
              onClick={() => handleDelete(building.id)}
              title="Delete"
            ></i>
          </>
        )}
      </div>

      <div className="card-body d-flex flex-column justify-content-center">
        {editBuildingId === building.id ? (
          <div className="d-flex flex-column gap-2">
            <input
              type="text"
              className="form-control"
              value={editFieldValue}
              onChange={(e) => setEditFieldValue(e.target.value)}
              placeholder="Building Address"
              autoFocus
            />

            <input
              type="number"
              className="form-control"
              value={editOccupancy}
              onChange={(e) => setEditOccupancy(e.target.value)}
              placeholder="Current Occupancy (%)"
              min="0"
              max="100"
            />
          </div>
        ) : (
          <>
            <div className="col-md-12 py-2">
              <div className="d-flex align-items-center justify-content-between mx-1 flex-wrap">
                <div className="d-flex flex-column col-12 col-md-6 mt-2 mt-md-0">
                  <div className="d-flex align-items-center mb-1">
                    <i className="bi bi-geo-alt-fill me-2 text-primary"></i>
                    <span className="fw-semibold">
                      {building.address || "N/A"}
                    </span>
                  </div>

                  <div className="d-flex align-items-center">
                    <i
                      className={`bi bi-people-fill me-2 ${
                        building.current_occupancy > 80
                          ? "text-success"
                          : building.current_occupancy > 50
                            ? "text-warning"
                            : "text-danger"
                      }`}
                    ></i>
                    <span className="fw-semibold">
                      {building.current_occupancy ?? "0"}%
                    </span>
                  </div>
                </div>

                <div className="d-flex col-12 col-md-6 justify-content-start justify-content-md-end gap-2 flex-wrap mt-3 mt-md-2">
                  <button
                    className="btn btn-dark btn-sm"
                    onClick={() => goToChat(building.id, "floor_plan")}
                  >
                    Floor Plan
                  </button>

                  <button
                    className="btn btn-dark btn-sm"
                    onClick={() => goToChat(building.id, "building_stack")}
                  >
                    Building Stack
                  </button>

                  <button
                    className="btn btn-dark btn-sm"
                    onClick={() => goToChat(building.id, "building_info")}
                  >
                    Building Info
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className="container-fuild p-3" style={{ position: "relative" }}>
      {deleteLoading && (
        <div className="upload-overlay">
          <div className="text-center">
            <div className="spinner-border text-primary" role="status"></div>
            <div className="upload-text mt-2">Deleting building...</div>
          </div>
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
        <h4 className="fw-bold text-dark">Building Info List</h4>
        <p className="text-muted mb-3">
          Here’s a summary of all the submitted buildings.
        </p>
        <input
          type="search"
          placeholder="Search by building name or address"
          className="form-control bg-white text-dark mx-auto text-center dark-placeholder"
          style={{ maxWidth: "420px" }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          disabled={loading || deleteLoading}
        />
      </div>

      {loading ? (
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ height: "60vh" }}
        >
          <RAGLoader />
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          <form onSubmit={handleAddSubmit}>
            <div className="row g-2 align-items-center justify-content-between">
              <div className="col-md-6">
                <div className="input-group">
                  <span className="input-group-text">
                    <i className="bi bi-geo-alt-fill"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter building address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              <div className="col-md-3">
                <input
                  type="number"
                  className="form-control"
                  placeholder="Current Occupancy (%)"
                  value={currentOccupancy}
                  onChange={(e) => setCurrentOccupancy(e.target.value)}
                  disabled={loading}
                  min="0"
                  max="100"
                  required
                />
              </div>

              <div className="col-md-3 col-12">
                <button
                  type="submit"
                  className="btn btn-success w-100"
                  disabled={loading}
                >
                  <i className="bi bi-plus-circle me-2"></i> Add Building
                </button>
              </div>
            </div>
          </form>

          {filteredBuildings.length === 0 ? (
            <p className="text-center text-muted mt-3">
              No buildings found. Add a new one above
            </p>
          ) : (
            [...filteredBuildings]
              .reverse()
              .map((building, index) => (
                <BuildingCard
                  key={building.id || index}
                  building={building}
                  index={index}
                />
              ))
          )}
        </div>
      )}
    </div>
  );
};
