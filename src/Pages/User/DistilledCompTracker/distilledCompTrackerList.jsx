import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { getdistilledCompTrackerlistApi } from "../../../Networking/Admin/APIs/distilledCompTrackerApi";
import RAGLoader from "../../../Component/Loader";
import { useNavigate } from "react-router-dom";

export const DistilledCompTrackerList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [submarketFilter, setSubmarketFilter] = useState("");
  const [termFilter, setTermFilter] = useState("");

  const filteredData = data.filter((item) => {
    const matchesSearch =
      item.address_anon?.toLowerCase().includes(search.toLowerCase()) ||
      item.submarket?.toLowerCase().includes(search.toLowerCase());

    const matchesSubmarket = submarketFilter
      ? item.submarket === submarketFilter
      : true;

    const matchesTerm = termFilter
      ? String(item.term_months) === termFilter
      : true;

    return matchesSearch && matchesSubmarket && matchesTerm;
  });

  useEffect(() => {
    fetchComps();
  }, []);

  const fetchComps = async () => {
    try {
      setLoading(true);

      const response = await dispatch(
        getdistilledCompTrackerlistApi()
      ).unwrap();

      setData(response || []);
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  const handlechat = () => {
    navigate("/dct-chat", {
      state: { category: "DCT" },
    });
  };

  if (loading)
    return (
      <div className="container-fluid d-flex justify-content-center align-items-center vh-100">
        <RAGLoader />
      </div>
    );

  return (
    <div className="container-fluid m-2">
      <div className="row align-items-center mb-3 g-2">
        <div className="col-12 col-md-6">
          <input
            type="text"
            className="form-control form-control-sm"
            placeholder="Search address / submarket"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="col-12 col-md-6">
          <div className="d-flex flex-column flex-md-row justify-content-md-end gap-2">
            <select
              className="form-select form-select-sm"
              value={submarketFilter}
              onChange={(e) => setSubmarketFilter(e.target.value)}
            >
              <option value="">All Submarkets</option>
              {[...new Set(data.map((d) => d.submarket))].map(
                (sub, i) =>
                  sub && (
                    <option key={i} value={sub}>
                      {sub}
                    </option>
                  )
              )}
            </select>

            <select
              className="form-select form-select-sm"
              value={termFilter}
              onChange={(e) => setTermFilter(e.target.value)}
            >
              <option value="">All Terms</option>
              {[...new Set(data.map((d) => d.term_months))].map(
                (term, i) =>
                  term && (
                    <option key={i} value={term}>
                      {term} Months
                    </option>
                  )
              )}
            </select>

            <button
              className="btn btn-sm btn-secondary d-flex align-items-center justify-content-center gap-1"
              onClick={handlechat}
            >
              <i className="bi bi-chat-dots" />
              Chat
            </button>
          </div>
        </div>
      </div>

      {filteredData.length === 0 ? (
        <div>No records found</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered table-striped">
            <thead>
              <tr>
                <th>#</th>
                <th>Address</th>
                <th>Submarket</th>
                <th>Terms Months</th>
                <th>SF Rounded</th>
                <th>TI Allowance PSF</th>
                <th>Free Rent Months</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item, index) => (
                <tr key={item.id || index}>
                  <td>{index + 1}</td>
                  <td>{item.address_anon || "-"}</td>
                  <td>{item.submarket || "-"}</td>
                  <td>{item.term_months || "-"}</td>
                  <td>{item.sf_rounded || "-"}</td>
                  <td>{item.ti_allowance_psf || "-"}</td>
                  <td>{item.free_rent_months || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
