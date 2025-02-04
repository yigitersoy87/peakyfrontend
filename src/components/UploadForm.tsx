import React, { useState, useRef } from "react";
import { CloudArrowUpIcon, DocumentIcon } from "@heroicons/react/24/outline";
import { uploadPdf, generateQuestions } from "../api/api";
import GenerationProgressTracker from "./GenerationProgressTracker";

const UploadForm: React.FC = () => {
  const [userId, setUserId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isGenerationStarted, setIsGenerationStarted] = useState(false);
  const [generationCompleted, setGenerationCompleted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== "application/pdf") {
        setError("Lütfen sadece PDF dosyası yükleyin");
        return;
      }
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError("Dosya boyutu 10MB'dan küçük olmalıdır");
        return;
      }
      setFile(selectedFile);
      setError("");
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      if (droppedFile.type !== "application/pdf") {
        setError("Lütfen sadece PDF dosyası yükleyin");
        return;
      }
      if (droppedFile.size > 10 * 1024 * 1024) {
        setError("Dosya boyutu 10MB'dan küçük olmalıdır");
        return;
      }
      setFile(droppedFile);
      setError("");
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setUploadProgress(0);
    setUploadResult(null);
    setIsUploading(true);

    if (!userId || !file) {
      setError("Lütfen kullanıcı ID'si ve dosya seçiniz.");
      setIsUploading(false);
      return;
    }

    try {
      const result = await uploadPdf(userId, file, (progress) => {
        setUploadProgress(progress);
      });
      
      console.log('Upload completed successfully:', result);
      setUploadResult(result);
      setIsUploading(false);
    } catch (err: any) {
      console.error('Upload failed:', err);
      setError(err.message || 'Dosya yükleme işlemi başarısız oldu');
      setIsUploading(false);
      setUploadResult(null);
    }
  };

  const handleStartGeneration = async () => {
    if (!uploadResult?.doc_id) return;
    
    setError("");
    setIsGenerating(true);
    
    try {
      await generateQuestions(userId, uploadResult.doc_id);
      setIsGenerationStarted(true);
    } catch (err: any) {
      setError(`Soru üretimi başlatılamadı: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setUploadResult(null);
    setError("");
    setIsUploading(false);
    setIsGenerating(false);
    setUploadProgress(0);
    setIsGenerationStarted(false);
    setGenerationCompleted(false);
  };

  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h2 className="text-lg font-medium leading-6 text-gray-900 mb-4">PDF Yükle</h2>

        {!uploadResult ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="userId" className="block text-sm font-medium text-gray-700">
                Kullanıcı ID
              </label>
              <input
                type="text"
                id="userId"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Örneğin: user_123"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">PDF Dosyası</label>
              <div
                className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                <div className="space-y-1 text-center">
                  {file ? (
                    <div className="flex flex-col items-center">
                      <DocumentIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="text-sm text-gray-600">{file.name}</p>
                      <p className="text-xs text-gray-500">
                        ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </p>
                      <button
                        type="button"
                        onClick={() => setFile(null)}
                        className="mt-2 text-sm text-red-600 hover:text-red-500"
                      >
                        Dosyayı Kaldır
                      </button>
                    </div>
                  ) : (
                    <>
                      <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                        >
                          <span>Dosya seç</span>
                          <input
                            id="file-upload"
                            ref={fileInputRef}
                            type="file"
                            accept="application/pdf"
                            className="sr-only"
                            onChange={handleFileSelect}
                          />
                        </label>
                        <p className="pl-1">veya sürükle bırak</p>
                      </div>
                      <p className="text-xs text-gray-500">PDF dosyası (10MB'a kadar)</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {isUploading && uploadProgress > 0 && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">Yükleniyor... {uploadProgress.toFixed(0)}%</p>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isUploading || !file}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                (isUploading || !file) ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isUploading ? "Yükleniyor..." : "Yükle"}
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <h3 className="text-lg font-medium text-green-800 mb-2">
                PDF başarıyla yüklendi!
              </h3>
              <p className="text-sm text-green-700">
                Dosya ID: {uploadResult.doc_id}
              </p>
            </div>

            {!isGenerationStarted && (
              <div className="bg-white border border-gray-200 rounded-md p-4">
                <button
                  onClick={handleStartGeneration}
                  disabled={isGenerating}
                  className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                    isGenerating ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {isGenerating ? "Başlatılıyor..." : "Soru Üretimini Başlat"}
                </button>
              </div>
            )}

            {isGenerationStarted && !generationCompleted && (
              <div className="bg-white border border-gray-200 rounded-md p-4">
                <h4 className="text-md font-medium text-gray-900 mb-3">
                  Sorular oluşturuluyor...
                </h4>
                <GenerationProgressTracker
                  userId={userId}
                  docId={uploadResult.doc_id}
                  onCompleted={() => setGenerationCompleted(true)}
                />
              </div>
            )}

            {generationCompleted && (
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <h3 className="text-lg font-medium text-green-800 mb-2">
                  Sorular başarıyla oluşturuldu!
                </h3>
                <div className="space-y-2">
                  <button
                    onClick={() => window.location.href = '/quiz'}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Quiz'e Başla
                  </button>
                  <button
                    onClick={handleReset}
                    className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Yeni Dosya Yükle
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadForm;