import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import UploadForm from "./components/UploadForm";
import Quiz from "./components/Quiz";

const App: React.FC = () => {
  return (
    <Router>
      <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
        <nav>
          <ul style={{ display: "flex", gap: "20px", listStyle: "none" }}>
            <li><Link to="/">PDF Yükle</Link></li>
            <li><Link to="/quiz">Quiz</Link></li>
          </ul>
        </nav>
        <hr />
        <Routes>
          <Route path="/" element={<UploadForm />} />
          <Route path="/quiz" element={<Quiz />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
