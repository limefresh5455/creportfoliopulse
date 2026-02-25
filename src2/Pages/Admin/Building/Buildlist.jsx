import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "bootstrap-icons/font/bootstrap-icons.css";
import {
  DeleteBuilding,
  ListBuildingSubmit,
  CreateBuildingSubmit,
  UpdateBuildingSubmit,
} from "../../../Networking/Admin/APIs/BuildingApi";
import { useDispatch, useSelector } from "react-redux";
import RAGLoader from "../../../Component/Loader";

const getCategoryFromPath = (pathname) => {
  if (pathname.startsWith("/project-management")) {
    return "workletter";
  }

  if (pathname.startsWith("/admin-lease-loi-building-list")) {
    return "Lease&Loi";
  }

  return "";
};

export const ListBuilding = () => {
  const { BuildingList } = useSelector((state) => state.BuildingSlice);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cardsRef = useRef([]);
  const location = useLocation();

  const category = getCategoryFromPath(location.pathname);

  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [address, setAddress] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [editBuildingId, setEditBuildingId] = useState(null);
  const [editFieldValue, setEditFieldValue] = useState("");

  useEffect(() => {
    const fetchBuildings = async () => {
      setLoading(true);
      await dispatch(ListBuildingSubmit(category));
      setLoading(false);
    };

    if (category) fetchBuildings();
  }, [dispatch, category]);

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

  const startEdit = (building) => {
    setEditBuildingId(building.id);
    setEditFieldValue(building.address || "");
  };

  const saveEdit = async (buildingId) => {
    if (!editFieldValue.trim()) return;
    setLoading(true);

    try {
      const payload = {
        building_id: buildingId,
        address: editFieldValue,
      };

      await dispatch(UpdateBuildingSubmit(payload)).unwrap();

      await dispatch(ListBuildingSubmit(category));

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
      await dispatch(ListBuildingSubmit(category));
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
          category: category,
          address: address,
        },
      ];

      await dispatch(CreateBuildingSubmit(payload)).unwrap();

      await dispatch(ListBuildingSubmit(category));

      setAddress("");
    } catch (error) {
      console.error("Error submitting building:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (building) => {
    const buildingId = building.id;
    const address = building.address;
    console.log(building, "buildingId");

    if (category === "Lease&Loi") {
      navigate("/admin-select-lease-loi", {
        state: { office: { buildingId } },
      });
    } else if (category === "workletter") {
      console.log("Navigating with address:", address);
      navigate("/projects", { state: { office: { buildingId, address } } });
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
      <div className="position-absolute top-0 end-0 p-2">
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
          <input
            type="text"
            className="form-control"
            value={editFieldValue}
            onChange={(e) => setEditFieldValue(e.target.value)}
            autoFocus
          />
        ) : (
          <p
            className="mb-2 text-secondary"
            onClick={() => handleSubmit(building)}
            style={{ cursor: "pointer" }}
          >
            <div className="col-md-12 py-2">
              <div className="d-flex mx-1">
                <i className="bi bi-geo-alt-fill me-2 text-primary"></i>
                <div className="mx-2 check w-75">
                  {building.address || "N/A"}
                </div>
              </div>
            </div>
          </p>
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
        <h4 className="fw-bold text-dark">Building List</h4>
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
              <div className="col-md-9">
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
