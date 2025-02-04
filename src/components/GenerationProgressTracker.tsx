import React, { useEffect, useState } from "react";
import { generationProgress } from "../api/api";

interface GenerationProgressProps {
  userId: string;
  docId: string;
  onCompleted: () => void;
}

const GenerationProgressTracker: React.FC<GenerationProgressProps> = ({ userId, docId, onCompleted }) => {
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const data = await generationProgress(userId, docId);
        const prog = data.progress ?? 0;
        setProgress(prog);
        
        if (prog >= 100) {
          clearInterval(interval);
          onCompleted();
        }
      } catch (error: any) {
        setError(error.message);
        clearInterval(interval);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [userId, docId, onCompleted]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-700">
          Soru üretim ilerlemesi: {Math.round(progress)}%
        </p>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div 
          className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {error && (
        <p className="text-sm text-red-600 mt-2">
          Hata: {error}
        </p>
      )}
    </div>
  );
};

export default GenerationProgressTracker;