import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  CreateBuildingSubmit,
  ListBuildingSubmit,
} from "../../../Networking/Admin/APIs/BuildingApi";
import RAGLoader from "../../../Component/Loader";

export const CreateBuilding = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchBuildings = async () => {
      await dispatch(ListBuildingSubmit());
    };
    fetchBuildings();
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!address.trim()) return;

    setLoading(true);
    try {
      const buildingData = [{ building_name: "", address, year: "" }];
      await dispatch(CreateBuildingSubmit(buildingData)).unwrap();
      await dispatch(ListBuildingSubmit());
      navigate("/building_list");
    } catch (error) {
      console.error("Error submitting building:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5 position-relative">
      {loading && (
        <div
          className="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-white bg-opacity-75"
          style={{ zIndex: 9999 }}
        >
          <RAGLoader />
        </div>
      )}

      <div className="text-center mb-4">
        <h2 className="fw-bold text-dark">Add a Building</h2>
        <p className="text-muted">Enter the building address and click Add.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="row g-2 align-items-center justify-content-center">
          <div className="col-md-8">
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
    </div>
  );
};
