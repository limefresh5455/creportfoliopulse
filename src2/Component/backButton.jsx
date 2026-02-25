import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export const BackButton = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  return (
    <button
      onClick={handleBack}
      className="bg-dark text-white d-flex align-items-center justify-content-center"
      style={{
        cursor: "pointer",
        width: "35px",
        height: "35px",
        borderRadius: "5px",
        border: "none",
      }}
      aria-label="Go back"
    >
      <FaArrowLeft size={14} />
    </button>
  );
};
