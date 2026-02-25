import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
import { ListBuildingSubmit } from "../../../Networking/Admin/APIs/BuildingApi";
import { useDispatch, useSelector } from "react-redux";

import RAGLoader from "../../../Component/Loader";

export const SubleaseTrackerUserBuildinglist = () => {
  const { BuildingList, loading } = useSelector((state) => state.BuildingSlice);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cardsRef = useRef({});

  const [requestingPermissionId, setRequestingPermissionId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const category = "SubleaseTracker";
    dispatch(ListBuildingSubmit(category));
  }, [dispatch]);

  useEffect(() => {
    filteredBuildings.forEach((building, i) => {
      const card = cardsRef.current[building.id];
      if (card) {
        setTimeout(() => {
          card.classList.add("visible");
        }, i * 150);
      }
    });
  }, [BuildingList, searchTerm]);

  const filteredBuildings =
    searchTerm.trim() === ""
      ? BuildingList
      : BuildingList.filter((building) =>
          building.address?.toLowerCase().includes(searchTerm.toLowerCase())
        );

  const handleSubmit = async (building) => {
    const buildingId = building.id;
    navigate("/SubleaseTrackerChat", { state: { office: { buildingId } } });
  };

  return (
    <>
      <div
        className="header-bg {
-bg d-flex justify-content-start px-3 align-items-center sticky-header"
      >
        <h5 className="mb-0 text-light mx-4">Sublease Tracker list</h5>
      </div>
      {requestingPermissionId && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backdropFilter: "blur(5px)",
            backgroundColor: "rgba(0,0,0,0.3)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 2000,
          }}
        >
          <div
            className="spinner-border text-warning"
            style={{ width: "3rem", height: "3rem" }}
            role="status"
          >
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}

      <div className="container-fuild p-3">
        <input
          type="search"
          className="form-control"
          placeholder="Search by address..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          aria-label="Search Buildings by Address"
          autoComplete="off"
        />
      </div>

      <div className="container py-2">
        {loading ? (
          <div className="text-center py-5">
            <RAGLoader />
            <p className="mt-3 text-muted">Loading buildings...</p>
          </div>
        ) : filteredBuildings.length === 0 ? (
          <div className="alert alert-info">
            No buildings found matching your search.
          </div>
        ) : (
          <div className="row">
            {[...filteredBuildings].reverse().map((building, index) => (
              <div className="col-12 mb-3" key={building.id}>
                <div
                  ref={(el) => (cardsRef.current[building.id] = el)}
                  className="card border-0 shadow-sm slide-in-top d-flex flex-row align-items-center p-3"
                  style={{
                    backgroundColor: "#fff",
                    borderWidth: "0.1px",
                    borderColor: "#cacacaff",
                    borderRadius: "16px",
                  }}
                >
                  <div
                    className="card-body d-flex flex-column justify-content-center position-relative p-0"
                    onClick={() => handleSubmit(building)}
                    style={{ cursor: "pointer" }}
                  >
                    <div className="d-flex mx-1">
                      <i className="bi bi-geo-alt-fill me-2 text-primary"></i>
                      <div className="mx-2 check w-75">
                        {building.address || "N/A"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};
