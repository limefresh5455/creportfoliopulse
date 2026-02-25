import { useState } from "react";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { UpdateBuildingSubmit } from "../../../Networking/Admin/APIs/BuildingApi";
import RAGLoader from "../../../Component/Loader";

export const UpdateBuilding = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const initialBuildings = Array.isArray(location.state?.buildings)
    ? location.state.buildings
    : [
        location.state?.buildings || {
          id: "",
          building_name: "",
          address: "",
          year: "",
        },
      ];

  const [loading, setLoading] = useState(false);
  const [buildings, setBuildings] = useState(initialBuildings);

  const handleChange = (index, field, value) => {
    const updated = [...buildings];
    if (updated[index]) {
      updated[index][field] = value;
      setBuildings(updated);
    }
  };

  const addBuilding = () => {
    setBuildings([
      ...buildings,
      { id: "", building_name: "", address: "", year: "" },
    ]);
  };

  const removeBuilding = (index) => {
    const updated = buildings.filter((_, i) => i !== index);
    setBuildings(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formattedBuildings = buildings.map((b) => ({
        building_id: b.id,
        building_name: b.building_name,
        address: b.address,
        year: b.year,
      }));

      await dispatch(UpdateBuildingSubmit(formattedBuildings[0])).unwrap();
      navigate("/building_list");
    } catch (error) {
      console.error("Error updating building:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5 position-relative">
      <div className="text-center mb-5">
        <h2 className="fw-bold text-dark">🛠️ Update Buildings</h2>
        <p className="text-muted">
          Modify details for your existing buildings below.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {buildings.map((building, index) => (
          <div key={index} className="card shadow-sm mb-4 border-0">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="card-title mb-0">Building No. {index + 1}</h5>
                {buildings.length > 1 && (
                  <button
                    type="button"
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => removeBuilding(index)}
                    disabled={loading}
                  >
                    <i className="bi bi-trash3"></i> Remove
                  </button>
                )}
              </div>

              <div className="mb-2">
                <label className="form-label">Address</label>
                <div className="input-group">
                  <span className="input-group-text">
                    <i className="bi bi-geo-alt-fill"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. 123 Main Street, New Delhi"
                    value={building.address}
                    onChange={(e) =>
                      handleChange(index, "address", e.target.value)
                    }
                    required
                    disabled={loading}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}

        <div className="d-flex gap-2 mb-4">
          <button
            type="button"
            className="btn btn-outline-primary"
            onClick={addBuilding}
            disabled={loading}
          >
            <i className="bi bi-plus-circle"></i> Add More
          </button>

          <button type="submit" className="btn btn-warning" disabled={loading}>
            <i className="bi bi-pencil-square"></i> Update
          </button>
        </div>
      </form>

      {loading && (
        <div
          className="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-white bg-opacity-75"
          style={{ zIndex: 9999 }}
        >
          <RAGLoader />
        </div>
      )}
    </div>
  );
};
