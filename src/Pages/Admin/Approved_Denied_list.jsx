import React, { useEffect, useState } from 'react';
import { Approved_list_submit, Denied_list_submit } from '../../Networking/Admin/APIs/PermissionApi';
import { useDispatch } from 'react-redux';
import RAGLoader from '../../Component/Loader';

export const Approved_Denied_list = () => {
  const [approvedList, setApprovedList] = useState([]);
  const [deniedList, setDeniedList] = useState([]);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const approvedRes = await dispatch(Approved_list_submit());
        const approvedData = approvedRes.payload || approvedRes;
        const approved = [];
        const denied = [];

        approvedData.forEach((user) => {
          user.requested_buildings.forEach((request) => {
            const item = {
              userName: user.user_name,
              email: user.email,
              building: request.building_name,
              status: request.status,
              createdAt: request.created_at,
              updatedAt: request.updated_at,
            };

            if (request.status === 'approved') {
              approved.push(item);
            } else if (request.status === 'denied') {
              denied.push(item);
            }
          });
        });

        setApprovedList(approved);
        setDeniedList(denied);

        const deniedRes = await dispatch(Denied_list_submit());
        const deniedData = deniedRes.payload || deniedRes;
        const additionalDenied = [];

        deniedData.forEach((user) => {
          user.requested_buildings.forEach((request) => {
            if (request.status === 'denied') {
              const item = {
                userName: user.user_name,
                email: user.email,
                building: request.building_name,
                status: request.status,
                createdAt: request.created_at,
                updatedAt: request.updated_at,
              };
              additionalDenied.push(item);
            }
          });
        });

        setDeniedList((prev) => [
          ...prev,
          ...additionalDenied.filter(
            (item) =>
              !prev.some(
                (existing) =>
                  existing.email === item.email &&
                  existing.building === item.building &&
                  existing.status === 'denied'
              )
          ),
        ]);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dispatch]);

  const formatDate = (datetime) => new Date(datetime).toLocaleString();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
       <RAGLoader /> 
      </div>
    );
  }

  return (
    <div className="container p-4">
      <div className="row">
        <div className="col-md-6 mb-4">
          <div className="card border-success shadow-sm h-100">
            <div className="card-header text-dark fw-bold">
              Approved Requests
            </div>
            <div className="card-body overflow-auto" style={{ maxHeight: '400px' }}>
              {approvedList.length === 0 ? (
                <p className="text-muted">No approved requests</p>
              ) : (
                approvedList.map((item, index) => (
                  <div key={index} className="mb-3 p-3 border rounded bg-light">
                    <p><strong>User:</strong> {item.userName}</p>
                    <p><strong>Building:</strong> {item.building}</p>
                    <p><strong>Status:</strong> <span className="text-success">{item.status}</span></p>
                    <p className="text-muted small mb-0"><em>Updated at:</em> {formatDate(item.updatedAt)}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="col-md-6 mb-4">
          <div className="card border-danger shadow-sm h-100">
            <div className="card-header text-dark fw-bold">
              Denied Requests
            </div>
            <div className="card-body overflow-auto" style={{ maxHeight: '400px' }}>
              {deniedList.length === 0 ? (
                <p className="text-muted">No denied requests</p>
              ) : (
                deniedList.map((item, index) => (
                  <div key={index} className="mb-3 p-3 border rounded bg-light">
                    <p><strong>User:</strong> {item.userName}</p>
                    <p><strong>Building:</strong> {item.building}</p>
                    <p><strong>Status:</strong> <span className="text-danger">{item.status}</span></p>
                    <p className="text-muted small mb-0"><em>Updated at:</em> {formatDate(item.updatedAt)}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
