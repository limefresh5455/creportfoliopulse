import { useEffect, useState } from "react";

function ThemeSelector() {
  const [theme, setTheme] = useState(
    localStorage.getItem("selectedTheme") || "lux",
  );

  useEffect(() => {
    const themeUrl = `https://cdn.jsdelivr.net/npm/bootswatch@5.3.2/dist/${theme}/bootstrap.min.css`;

    const link = document.getElementById("themeStylesheet");
    link.setAttribute("href", themeUrl);

    localStorage.setItem("selectedTheme", theme);
  }, [theme]);

  return (
    <div className="container mt-4">
      <label className="form-label">Choose Theme:</label>
      <select
        className="form-select w-25"
        value={theme}
        onChange={(e) => setTheme(e.target.value)}
      >
        <option value="lux">Lux</option>
        <option value="cyborg">Cyborg</option>
        <option value="morph">Morph</option>
        <option value="darkly">Darkly</option>
        <option value="quartz">Quartz</option>
        <option value="sketchy">Sketchy</option>
      </select>
    </div>
  );
}

export default ThemeSelector;
