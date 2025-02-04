// src/api/api.ts
import { supabase } from '../lib/supabase';

export const API_BASE_URL = "https://peakybackend.onrender.com";

// Güncellenmiş Tipler
export interface UploadResponse {
  doc_id: string;
  message: string;
  file_url: string;
  error?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct_answer?: string;
}

export interface QuizResponse {
  questions: QuizQuestion[];
  unit_index: number;
}

export interface ProgressResponse {
  progress: number;
  completed_units: number;
  total_units: number;
}

interface SubmitQuizResponse {
  score: number;
  correct_count: number;
  total: number;
  xp_gain: number;
  new_xp: number;
  new_rank: string;
  review_questions: QuizQuestion[];
}

// Hata Yönetimi
const handleError = async (response: Response) => {
  try {
    const error = await response.json();
    return new Error(error.detail || error.message || 'Bilinmeyen hata');
  } catch {
    return new Error(await response.text());
  }
};

// PDF Yükleme
export async function uploadPdf(userId: string, file: File): Promise<UploadResponse> {
  try {
    // Frontend validasyonu
    const MAX_MB = 10;
    if (file.size > MAX_MB * 1024 * 1024) {
      throw new Error(`Dosya boyutu ${MAX_MB}MB'ı aşamaz`);
    }

    const formData = new FormData();
    formData.append("user_id", userId);
    formData.append("file", file);

    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) throw await handleError(response);
    return await response.json();
    
  } catch (error) {
    console.error('Upload error:', error);
    throw new Error(error instanceof Error ? error.message : 'Bilinmeyen hata');
  }
}

// Quiz Alma
export async function getQuiz(userId: string, pdfId: string, unitIndex: number): Promise<QuizResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/quiz/${userId}/${pdfId}/${unitIndex}`);
    if (!response.ok) throw await handleError(response);
    
    const data: QuizResponse = await response.json();
    return {
      ...data,
      questions: data.questions.map(q => ({
        ...q,
        options: shuffleArray(q.options),
        correct_answer: undefined
      }))
    };
    
  } catch (error) {
    console.error('Get quiz error:', error);
    throw error;
  }
}

// Quiz Gönderme
export async function submitQuiz(
  userId: string,
  pdfId: string,
  unitIndex: number,
  answers: { question_index: number; answer: string }[]
): Promise<SubmitQuizResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/quiz/${userId}/${pdfId}/${unitIndex}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers }),
    });

    if (!response.ok) throw await handleError(response);
    const data = await response.json();
    
    updateLocalUserState(data.new_xp, data.new_rank);
    return data;

  } catch (error) {
    console.error('Submit quiz error:', error);
    throw error;
  }
}

// Soru Üretimi
export async function generateQuestions(userId: string, docId: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/generate-questions/${userId}/${docId}`, {
      method: "POST",
    });

    if (!response.ok) throw await handleError(response);
    
    // Backend'in kendi status güncellemesini yapmasını bekliyoruz
    return;

  } catch (error) {
    console.error('Generate questions error:', error);
    throw error;
  }
}

// İlerleme Takibi
export async function generationProgress(userId: string, docId: string): Promise<ProgressResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/progress/${userId}/${docId}`);
    if (!response.ok) throw await handleError(response);
    
    const data: ProgressResponse = await response.json();
    return data;

  } catch (error) {
    console.error('Generation progress error:', error);
    throw error;
  }
}

// Yardımcı Fonksiyonlar
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function updateLocalUserState(newXp: number, newRank: string): void {
  localStorage.setItem('user_xp', newXp.toString());
  localStorage.setItem('user_rank', newRank);
  window.dispatchEvent(new Event('storage'));
}