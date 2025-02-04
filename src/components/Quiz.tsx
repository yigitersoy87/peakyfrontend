import React, { useState } from "react";
import { getQuiz, submitQuiz } from "../api/api";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";

const Quiz: React.FC = () => {
  const [userId, setUserId] = useState("");
  const [pdfId, setPdfId] = useState("");
  const [unitIndex, setUnitIndex] = useState(1);
  const [quizData, setQuizData] = useState<{ questions: any[] } | null>(null);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const fetchQuiz = async () => {
    setError("");
    setResult(null);
    setIsLoading(true);
    try {
      const data = await getQuiz(userId, pdfId, unitIndex);
      setQuizData(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerChange = (questionIndex: number, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionIndex]: answer }));
  };

  const handleSubmitQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const answerArray = Object.entries(answers).map(([qIndex, answer]) => ({
        question_index: parseInt(qIndex),
        answer,
      }));
      const res = await submitQuiz(userId, pdfId, unitIndex, answerArray);
      setResult(res);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h2 className="text-lg font-medium leading-6 text-gray-900 mb-4">Quiz</h2>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
              <label htmlFor="docId" className="block text-sm font-medium text-gray-700">
                Document ID
              </label>
              <input
                type="text"
                id="docId"
                value={pdfId}
                onChange={(e) => setPdfId(e.target.value)}
                placeholder="Backend'den aldığınız Document ID"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            
            <div>
              <label htmlFor="unitIndex" className="block text-sm font-medium text-gray-700">
                Ünite Numarası
              </label>
              <input
                type="number"
                id="unitIndex"
                value={unitIndex}
                onChange={(e) => setUnitIndex(Number(e.target.value))}
                min="1"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          <button
            onClick={fetchQuiz}
            disabled={isLoading}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isLoading ? "Yükleniyor..." : "Quiz Getir"}
          </button>
        </div>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <XCircleIcon className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {quizData && quizData.questions && (
          <form onSubmit={handleSubmitQuiz} className="mt-6 space-y-6">
            {quizData.questions.map((q, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg">
                <p className="text-lg font-medium text-gray-900 mb-4">
                  {index + 1}. {q.question}
                </p>
                <div className="space-y-2">
                  {q.options &&
                    q.options.map((opt: string, idx: number) => (
                      <label key={idx} className="flex items-center space-x-3">
                        <input
                          type="radio"
                          name={`question-${index}`}
                          value={opt}
                          onChange={() => handleAnswerChange(index, opt[0])}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-gray-700">{opt}</span>
                      </label>
                    ))}
                </div>
              </div>
            ))}
            
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isLoading ? "Gönderiliyor..." : "Quiz'i Gönder"}
            </button>
          </form>
        )}

        {result && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex items-center mb-4">
              <CheckCircleIcon className="h-6 w-6 text-green-400" />
              <h3 className="ml-2 text-lg font-medium text-green-800">Sonuçlar</h3>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-md shadow-sm">
                  <p className="text-sm text-gray-500">Skor</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {result.score * 100}% ({result.correct_count}/{result.total})
                  </p>
                </div>
                <div className="bg-white p-4 rounded-md shadow-sm">
                  <p className="text-sm text-gray-500">XP Kazanımı</p>
                  <p className="text-lg font-semibold text-gray-900">{result.xp_gain}</p>
                </div>
              </div>

              <div className="bg-white p-4 rounded-md shadow-sm">
                <p className="text-sm text-gray-500">Yeni XP</p>
                <p className="text-lg font-semibold text-gray-900">{result.new_xp}</p>
              </div>

              <div className="bg-white p-4 rounded-md shadow-sm">
                <p className="text-sm text-gray-500">Yeni Rank</p>
                <p className="text-lg font-semibold text-gray-900">{result.new_rank}</p>
              </div>

              {result.review_questions && result.review_questions.length > 0 && (
                <div className="bg-yellow-50 p-4 rounded-md">
                  <h4 className="text-sm font-medium text-yellow-800 mb-2">
                    Tekrar Görülecek Sorular:
                  </h4>
                  <ul className="list-disc pl-5 space-y-1">
                    {result.review_questions.map((q: any, idx: number) => (
                      <li key={idx} className="text-sm text-yellow-700">
                        {q.question}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Quiz;