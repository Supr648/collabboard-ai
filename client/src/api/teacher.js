import api from './client';

export const getClassrooms = async () => {
  const response = await api.get('/teacher/classrooms');
  return response.data;
};

export const createClassroom = async (classroomData) => {
  const response = await api.post('/teacher/classrooms', classroomData);
  return response.data;
};

export const createAssignment = async (classroomId, assignmentData) => {
  const response = await api.post(`/teacher/classrooms/${classroomId}/assignments`, assignmentData);
  return response.data;
};

export const submitStudentAssignment = async (classroomId, assignmentId, submissionData) => {
  const response = await api.post(`/teacher/classrooms/${classroomId}/assignments/${assignmentId}/submit`, submissionData);
  return response.data;
};

export const generateAITeachingMaterial = async (data) => {
  const response = await api.post('/teacher/ai-lesson-material', data);
  return response.data;
};
