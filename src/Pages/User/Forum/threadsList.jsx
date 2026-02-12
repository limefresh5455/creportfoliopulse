import React, { useEffect, useState } from "react";

export default function () {
  const [threads, setThreads] = useState([]);

  useEffect(() => {
    (async () => {
      const data = await getThreads(clientId);
      setThreads(data);
    })();
  }, [clientId]);

  return (
    <div>
      {threads.map((t) => (
        <div key={t.id}>
          <h3>{t.title}</h3>
          <p>{t.description}</p>
        </div>
      ))}
    </div>
  );
}
