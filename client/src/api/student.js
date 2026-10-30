import api from './client';

export const getStudentSummary = async () => {
  const response = await api.get('/student/summary');
  return response.data;
};

export const getStudyDecks = async (type = null) => {
  const url = type ? `/student/decks?type=${type}` : '/student/decks';
  const response = await api.get(url);
  return response.data;
};

export const createStudyDeck = async (deckData) => {
  const response = await api.post('/student/decks', deckData);
  return response.data;
};

export const updateCardMastery = async (deckId, cardIndex, masteryScore) => {
  const response = await api.put(`/student/decks/${deckId}/cards/${cardIndex}/mastery`, {
    masteryScore,
  });
  return response.data;
};

export const submitQuizAttempt = async (deckId, attemptData) => {
  const response = await api.post(`/student/decks/${deckId}/attempt`, attemptData);
  return response.data;
};

export const generateAIQuiz = async (data) => {
  const response = await api.post('/student/ai-quiz', data);
  return response.data;
};

export const generateAIFlashcards = async (data) => {
  const response = await api.post('/student/ai-flashcards', data);
  return response.data;
};
