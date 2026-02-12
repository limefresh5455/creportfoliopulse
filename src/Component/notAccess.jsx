export const NoAccess = () => {
  return (
    <>   <div className="header-bg d-flex justify-content-start align-items-center sticky-header" style={{padding:"35px"}}>
        
      </div>
    <div style={styles.container}>
      <h1 style={styles.title}>🚫 Access Denied</h1>
      <p style={styles.text}>
        You don’t have permission to view this page.
      </p>
      
    </div>
    </>
  );
};

const styles = {
  container: {
    minHeight: "80vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    padding: "20px",
  },
  title: {
    fontSize: "2rem",
    marginBottom: "10px",
  },
  text: {
    fontSize: "1.1rem",
    marginBottom: "6px",
  },
  subtext: {
    fontSize: "0.95rem",
    color: "#666",
  },
};
