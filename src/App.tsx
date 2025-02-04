import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { HomeIcon, DocumentTextIcon } from "@heroicons/react/24/outline";
import UploadForm from "./components/UploadForm";
import Quiz from "./components/Quiz";

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <h1 className="text-xl font-bold text-indigo-600">Adaptive Learning</h1>
                </div>
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  <Link
                    to="/"
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 border-b-2 border-indigo-500"
                  >
                    <HomeIcon className="h-5 w-5 mr-1" />
                    PDF Yükle
                  </Link>
                  <Link
                    to="/quiz"
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900 hover:border-gray-300"
                  >
                    <DocumentTextIcon className="h-5 w-5 mr-1" />
                    Quiz
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <Routes>
              <Route path="/" element={<UploadForm />} />
              <Route path="/quiz" element={<Quiz />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
};

export default App;