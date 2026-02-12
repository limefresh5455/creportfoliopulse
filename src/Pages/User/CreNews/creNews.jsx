export const CreNews = () => {
  return (
    <div className="pt-5 pt-md-0" style={{ width: "100%", height: "100vh" }}>
      <iframe
        src="https://www.connectcre.com/new-york-tri-state/"
        title="Connect CRE News"
        style={{
          width: "100%",
          height: "100%",
          border: "none",
        }}
        loading="lazy"
        allowFullScreen
      />
    </div>
  );
};
