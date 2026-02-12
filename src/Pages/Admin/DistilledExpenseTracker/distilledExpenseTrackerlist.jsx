import React, { useEffect, useState } from "react";
import { Table } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { getdistilledExpenseTrackerlistApi } from "../../../Networking/Admin/APIs/distilledExpenseTrackerApi";
import RAGLoader from "../../../Component/Loader";
import Pagination from "../../../Component/pagination";

export const DistilledExpenseTrackerlist = () => {
  const dispatch = useDispatch();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    setLoading(true);
    dispatch(getdistilledExpenseTrackerlistApi())
      .unwrap()
      .then((res) => {
        setData(res.reverse());
        setLoading(false);
      })
      .catch((err) => {
        setError(err || "Failed to fetch data");
        setLoading(false);
      });
  }, [dispatch]);

  
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentData = data.slice(indexOfFirstItem, indexOfLastItem);

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "80vh" }}
      >
        <RAGLoader />
      </div>
    );
  }

  if (error) {
    return <div className="text-danger text-center mt-4">{error}</div>;
  }

  return (
    <div className="container-fuild p-3">
      <div className="mb-4 text-center">
        <h4 className="fw-bold">Distilled Expense Tracker Submissions</h4>
      </div>

      {data.length > 0 ? (
        <>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>#</th>
                <th>Submarket</th>
                <th>Building SF</th>
                <th>Class</th>
                <th>Property Insurance</th>
                <th>Janitorial</th>
                <th>Security</th>
                <th>TI Allowances</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {currentData.map((item, index) => (
                <tr key={item.id || index}>
                  <td>{indexOfFirstItem + index + 1}</td>
                  <td>{item.submarket_geo}</td>
                  <td>{item.building_sf_band}</td>
                  <td>{item.building_class}</td>
                  <td>{item.property_insurance_psf}</td>
                  <td>{item.janitorial_cleaning_psf}</td>
                  <td>{item.security_monitoring_psf}</td>
                  <td>{item.ti_allowances_psf}</td>
                  <td>{new Date(item.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </Table>


          <Pagination
            totalItems={data.length}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={(value) => {
              setItemsPerPage(value);
              setCurrentPage(1); 
            }}
          />
        </>
      ) : (
        <div className="text-center">No submissions found.</div>
      )}
    </div>
  );
};
