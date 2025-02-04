import React, { useEffect, useState } from "react";
import { API_BASE_URL } from "../api/api";

interface ProgressProps {
  userId: string;
  docId: string;
  onCompleted: () => void;
}

const ProgressTracker: React.FC<ProgressProps> = ({ userId, docId, onCompleted }) => {
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/progress/${userId}/${docId}`);
        if (!res.ok) {
          console.error("Progress endpoint error:", res.status);
          return;
        }
        const data = await res.json();
        const prog = data.progress ?? 0;
        setProgress(prog);
        if (prog === 100) {
          clearInterval(interval);
          onCompleted();
        }
      } catch (error) {
        console.error("Progress hatası", error);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [userId, docId, onCompleted]);

  return (
    <div>
      <p>İşlem ilerlemesi: {(progress ?? 0).toFixed(0)}%</p>
      <progress value={progress} max="100" style={{ width: "100%" }} />
    </div>
  );
};

export default ProgressTracker;
