export const API_BASE_URL = "http://localhost:8000";

export async function uploadPdf(userId: string, file: File) {
  const formData = new FormData();
  formData.append("user_id", userId);
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Upload failed");
  }

  return await response.json();
}

export async function getQuiz(userId: string, pdfId: string, unitIndex: number) {
  const response = await fetch(`${API_BASE_URL}/quiz/${userId}/${pdfId}/${unitIndex}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to get quiz");
  }
  return await response.json();
}

export async function submitQuiz(
  userId: string,
  pdfId: string,
  unitIndex: number,
  answers: { question_index: number; answer: string }[]
) {
  const response = await fetch(`${API_BASE_URL}/quiz/${userId}/${pdfId}/${unitIndex}/submit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ answers }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Quiz submission failed");
  }
  return await response.json();
}
