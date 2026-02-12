export const SidebarSkeleton = ({ collapsed }) => {
  const items = Array.from({ length: 8 });

  return (
    <div className="px-2">
 
      {!collapsed && (
        <div className="mb-3">
          <div
            className="bg-secondary rounded"
            style={{ height: "10px", width: "120px", opacity: 0.5 }}
          />
        </div>
      )}

      <ul className="nav flex-column gap-3">
        {items.map((_, index) => (
          <li key={index} className="nav-item d-flex align-items-center">
           
            <div
              className="bg-secondary rounded-circle me-2"
              style={{ width: "18px", height: "18px", opacity: 0.5 }}
            />

            {!collapsed && (
              <div
                className="bg-secondary rounded"
                style={{ height: "10px", width: "70%", opacity: 0.5 }}
              />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};
