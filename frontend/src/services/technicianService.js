import api from "./api";

const getErrorMessage = (error, fallbackMessage) => {
  const backendMessage = error?.response?.data;

  if (typeof backendMessage === "string" && backendMessage.trim()) {
    return backendMessage;
  }

  if (backendMessage?.message) {
    return backendMessage.message;
  }

  return fallbackMessage;
};

export const listTechnicians = async (requesterId) => {
  try {
    const response = await api.get("/technicians", {
      params: { requesterId },
    });

    return response.data ?? [];
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to load technicians"));
  }
};

export const createTechnician = async (payload) => {
  try {
    const response = await api.post("/technicians", payload);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to create technician"));
  }
};

export const updateTechnician = async (technicianId, payload) => {
  try {
    const response = await api.put(`/technicians/${technicianId}`, payload);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to update technician"));
  }
};

export const deleteTechnician = async (technicianId, actorUserId) => {
  try {
    await api.delete(`/technicians/${technicianId}`, {
      params: { actorUserId },
    });
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to delete technician"));
  }
};