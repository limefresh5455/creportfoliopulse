import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
import { ListBuildingSubmit } from "../../../Networking/Admin/APIs/BuildingApi";
import { useDispatch, useSelector } from "react-redux";
import RAGLoader from "../../../Component/Loader";

export const UserBuildingInfolist = () => {
  const { BuildingList, loading } = useSelector((state) => state.BuildingSlice);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cardsRef = useRef({});

  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const category = "BuildingInfo";
    dispatch(ListBuildingSubmit(category));
  }, [dispatch]);

  const filteredBuildings =
    searchTerm.trim() === ""
      ? BuildingList
      : BuildingList.filter((b) =>
          b.address?.toLowerCase().includes(searchTerm.toLowerCase()),
        );

  useEffect(() => {
    filteredBuildings.forEach((building, i) => {
      const card = cardsRef.current[building.id];
      if (card) {
        setTimeout(() => {
          card.classList.add("visible");
        }, i * 150);
      }
    });
  }, [filteredBuildings]);

  const goToChat = (buildingId, category) => {
    navigate("/building-chat", {
      state: { buildingId, category },
    });
  };

  return (
    <>
      <div className="header-bg d-flex justify-content-start px-3 align-items-center sticky-header">
        <h4 className="mb-0 text-light mx-4">Building Info list</h4>
      </div>

      <div className="container-fuild p-3">
        <input
          type="search"
          className="form-control"
          placeholder="Search by address..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
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
            {[...filteredBuildings].reverse().map((building) => (
              <div className="col-12 mb-3" key={building.id}>
                <div
                  ref={(el) => (cardsRef.current[building.id] = el)}
                  className="card border-0 shadow-sm slide-in-top p-3"
                  style={{ borderRadius: "16px" }}
                >
                  <div className="d-flex align-items-center justify-content-between ">
                    <div className="d-flex flex-column">
                      <div className="d-flex align-items-center">
                        <i className="bi bi-geo-alt-fill me-2 text-primary"></i>
                        <span className="fw-semibold">
                          {building.address || "N/A"}
                        </span>
                      </div>

                      <div className="d-flex align-items-center mt-1">
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
                          {building.current_occupancy ?? 0}%
                        </span>
                      </div>
                    </div>

                    <div className="d-flex gap-2 flex-wrap">
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
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};
