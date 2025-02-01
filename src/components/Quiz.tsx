import React, { useState } from "react";
import { getQuiz, submitQuiz } from "../api/api";

const Quiz: React.FC = () => {
  const [userId, setUserId] = useState("");
  const [pdfId, setPdfId] = useState("");
  const [unitIndex, setUnitIndex] = useState(1);
  const [quizData, setQuizData] = useState<{ questions: any[] } | null>(null);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const fetchQuiz = async () => {
    setError("");
    setResult(null);
    try {
      const data = await getQuiz(userId, pdfId, unitIndex);
      setQuizData(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleAnswerChange = (questionIndex: number, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionIndex]: answer }));
  };

  const handleSubmitQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      // Dönüştürme: cevaplar {question_index, answer} dizisine
      const answerArray = Object.entries(answers).map(([qIndex, answer]) => ({
        question_index: parseInt(qIndex),
        answer,
      }));
      const res = await submitQuiz(userId, pdfId, unitIndex, answerArray);
      setResult(res);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h2>Quiz Bölümü</h2>
      <div style={{ marginBottom: "20px" }}>
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
          <label>Document ID: </label>
          <input
            type="text"
            value={pdfId}
            onChange={(e) => setPdfId(e.target.value)}
            placeholder="Backend’den aldığınız Document ID"
          />
        </div>
        <div>
          <label>Ünite Numarası: </label>
          <input
            type="number"
            value={unitIndex}
            onChange={(e) => setUnitIndex(Number(e.target.value))}
          />
        </div>
        <button onClick={fetchQuiz}>Quiz Getir</button>
      </div>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {quizData && quizData.questions && (
        <form onSubmit={handleSubmitQuiz}>
          {quizData.questions.map((q, index) => (
            <div key={index} style={{ marginBottom: "20px" }}>
              <p>
                <strong>
                  {index + 1}. {q.question}
                </strong>
              </p>
              {q.options &&
                q.options.map((opt: string, idx: number) => (
                  <div key={idx}>
                    <label>
                      <input
                        type="radio"
                        name={`question-${index}`}
                        value={opt}
                        onChange={() => handleAnswerChange(index, opt[0])}  
                        /* Varsayım: Cevap harfi seçenek metninin ilk karakteri (örneğin "A") */
                      />
                      {opt}
                    </label>
                  </div>
                ))}
            </div>
          ))}
          <button type="submit">Quiz Gönder</button>
        </form>
      )}
      {result && (
        <div style={{ marginTop: "20px" }}>
          <h3>Sonuçlar</h3>
          <p>
            <strong>Skor:</strong> {result.score * 100}% (
            {result.correct_count}/{result.total})
          </p>
          <p>
            <strong>XP Kazanımı:</strong> {result.xp_gain}
          </p>
          <p>
            <strong>Yeni XP:</strong> {result.new_xp}
          </p>
          <p>
            <strong>Yeni Rank:</strong> {result.new_rank}
          </p>
          {result.review_questions && result.review_questions.length > 0 && (
            <div>
              <h4>Tekrar Görülecek Sorular:</h4>
              <ul>
                {result.review_questions.map((q: any, idx: number) => (
                  <li key={idx}>{q.question}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Quiz;
