import React from "react";

const Pagination = ({
  totalItems,
  itemsPerPage,
  currentPage,
  onPageChange,
  onItemsPerPageChange,
  pageNeighbours = 1, 
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const getPageNumbers = () => {
    const totalNumbers = pageNeighbours * 2 + 3; 
    const totalBlocks = totalNumbers + 2;

    if (totalPages > totalBlocks) {
      const startPage = Math.max(2, currentPage - pageNeighbours);
      const endPage = Math.min(totalPages - 1, currentPage + pageNeighbours);

      let pages = [];
      for (let i = startPage; i <= endPage; i++) pages.push(i);

      if (startPage > 2) pages.unshift("...");
      if (endPage < totalPages - 1) pages.push("...");

      return [1, ...pages, totalPages];
    }

    return Array.from({ length: totalPages }, (_, i) => i + 1);
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  };

  if (totalPages === 0) return null; 

  return (
    <div className="d-flex flex-column flex-md-row justify-content-between align-items-center p-3">
    
      <div className="d-flex align-items-center gap-2 mb-3 mb-md-0">
        <label htmlFor="itemsPerPage" className="text-secondary mb-0">
          Show:
        </label>
        <select
          id="itemsPerPage"
          className="form-select form-select-sm"
          style={{ width: "80px" }}
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
        <span className="text-muted small ms-2">
          Showing{" "}
          {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)} -{" "}
          {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} items
        </span>
      </div>

      
      <nav aria-label="Pagination">
        <ul className="pagination mb-0">

          
          <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
            <button
              className="page-link"
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              aria-label="Previous"
            >
              &laquo;
            </button>
          </li>

         
          {getPageNumbers().map((page, idx) => (
            <li
              key={idx}
              className={`page-item ${page === currentPage ? "active" : ""} ${
                page === "..." ? "disabled" : ""
              }`}
            >
              {page === "..." ? (
                <span className="page-link">…</span>
              ) : (
                <button
                  className={`page-link ${
                    page === currentPage ? "bg-secondary text-white" : "text-secondary"
                  }`}
                  onClick={() => onPageChange(page)}
                >
                  {page}
                </button>
              )}
            </li>
          ))}

 
          <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
            <button
              className="page-link"
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              aria-label="Next"
            >
              &raquo;
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Pagination;
