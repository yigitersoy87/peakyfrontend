import React, { useState } from "react";
import { uploadPdf } from "../api/api";

const UploadForm: React.FC = () => {
  const [userId, setUserId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!userId || !file) {
      setError("Lütfen kullanıcı ID'si ve dosya seçiniz.");
      return;
    }
    try {
      const result = await uploadPdf(userId, file);
      setUploadResult(result);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h2>PDF Yükle</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Kullanıcı ID: </label>
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="Örneğin: user_123"
          />
        </div>
        <div>
          <label>PDF Dosyası: </label>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
          />
        </div>
        <button type="submit">Yükle</button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {uploadResult && (
        <div>
          <h3>Yükleme Başarılı!</h3>
          <p>
            <strong>Document ID:</strong> {uploadResult.doc_id}
          </p>
          <h4>Learning Path</h4>
          <pre style={{ background: "#f0f0f0", padding: "10px" }}>
            {JSON.stringify(uploadResult.learning_path, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default UploadForm;
