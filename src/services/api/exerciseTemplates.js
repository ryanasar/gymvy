import apiClient from './client';

export const getAllExerciseTemplates = async () => {
  try {
    const response = await apiClient.get('/exercise-templates');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch exercise templates:', error);
    throw error;
  }
};

export const getExerciseTemplateById = async (id) => {
  try {
    const response = await apiClient.get(`/exercise-templates/${id}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch exercise template:', error);
    throw error;
  }
};

export const createExerciseTemplate = async (templateData) => {
  try {
    const response = await apiClient.post('/exercise-templates', templateData);
    return response.data;
  } catch (error) {
    console.error('Failed to create exercise template:', error);
    throw error;
  }
};

export const updateExerciseTemplate = async (id, templateData) => {
  try {
    const response = await apiClient.put(`/exercise-templates/${id}`, templateData);
    return response.data;
  } catch (error) {
    console.error('Failed to update exercise template:', error);
    throw error;
  }
};

export const deleteExerciseTemplate = async (id) => {
  try {
    const response = await apiClient.delete(`/exercise-templates/${id}`);
    return response.data;
  } catch (error) {
    console.error('Failed to delete exercise template:', error);
    throw error;
  }
};

export const addMuscleToTemplate = async (exerciseTemplateId, muscleId) => {
  try {
    const response = await apiClient.post(`/exercise-templates/muscle`, {
      exerciseTemplateId,
      muscleId
    });
    return response.data;
  } catch (error) {
    console.error('Failed to add muscle to template:', error);
    throw error;
  }
};

export const removeMuscleFromTemplate = async (templateId, muscleId) => {
  try {
    const response = await apiClient.delete(`/exercise-templates/${templateId}/muscle/${muscleId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to remove muscle from template:', error);
    throw error;
  }
};

export default function ExerciseTemplatesApiPage() {
  return null;
}
