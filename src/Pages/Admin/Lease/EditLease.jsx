import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { UpdateLeaseSubmit } from "../../../Networking/Admin/APIs/LeaseApi";
import RAGLoader from "../../../Component/Loader";

export const UpdateLease = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const [offices, setOffices] = useState([]);
  const [loading, setLoading] = useState(false);

  const buildingId = location.state?.Building_id;
  const passedOffices = location.state?.offices || [];

  useEffect(() => {
    if (passedOffices.length > 0) {
      setOffices(passedOffices);
    } else {
      navigate(`/LeaseList/${buildingId}`);
    }
  }, [passedOffices]);

  const handleChange = (index, field, value) => {
    const updated = [...offices];
    updated[index][field] = value;
    setOffices(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      for (const office of offices) {
        const payload = {
          building_id: buildingId,
          lease_data: {
            lease_id: office.lease_id,
            tenant_name: office.tenant_name,
            suite_number: office.suite_number,
          },
        };

        await dispatch(UpdateLeaseSubmit(payload));
      }

      navigate(`/LeaseList/${buildingId}`);
    } catch (error) {
      console.error("Error updating lease:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5 position-relative">
      <div className="text-center mb-5">
        <h2 className="fw-bold text-dark">✏️ Edit Lease</h2>
        <p className="text-muted">Modify existing lease records below.</p>
      </div>

      <form onSubmit={handleSubmit}>
        {offices.map((office, index) => (
          <div key={index} className="card shadow-sm mb-4 border-0">
            <div className="card-body">
              <div className="mb-3 d-flex justify-content-between align-items-center">
                <h5 className="card-title mb-0">Lease No. {index + 1}</h5>
              </div>

              <div className="mb-3">
                <label className="form-label">Tenant Name</label>
                <div className="input-group">
                  <span className="input-group-text">
                    <i className="bi bi-person-fill"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. John Smith"
                    value={office.tenant_name}
                    onChange={(e) =>
                      handleChange(index, "tenant_name", e.target.value)
                    }
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Suite Number</label>
                <div className="input-group">
                  <span className="input-group-text">
                    <i className="bi bi-door-open-fill"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Suite 305"
                    value={office.suite_number}
                    onChange={(e) =>
                      handleChange(index, "suite_number", e.target.value)
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
          <button type="submit" className="btn btn-warning" disabled={loading}>
            <i className="bi bi-save"></i> Save Changes
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate(`/LeaseList/${buildingId}`)}
            disabled={loading}
          >
            Cancel
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
