import api from "./api";

export const TICKET_PRIORITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
export const TICKET_STATUSES = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED", "REJECTED"];

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

export const createIncidentTicket = async (ticketData, attachments = []) => {
  const formData = new FormData();

  Object.entries(ticketData).forEach(([key, value]) => {
    if (value !== undefined && value !== null && `${value}`.trim() !== "") {
      formData.append(key, value);
    }
  });

  attachments.forEach((file) => {
    formData.append("attachments", file);
  });

  try {
    const response = await api.post("/incidents", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to create incident ticket"));
  }
};

export const listIncidentTickets = async (requesterId, status) => {
  try {
    const params = { requesterId };
    if (status) {
      params.status = status;
    }

    const response = await api.get("/incidents", { params });
    return response.data ?? [];
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to load incident tickets"));
  }
};

export const getIncidentTicket = async (ticketId, requesterId) => {
  try {
    const response = await api.get(`/incidents/${ticketId}`, {
      params: { requesterId },
    });

    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to load ticket details"));
  }
};

export const updateIncidentTicket = async (ticketId, payload) => {
  try {
    const response = await api.put(`/incidents/${ticketId}`, payload);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to update ticket"));
  }
};

export const deleteIncidentTicket = async (ticketId, actorUserId) => {
  try {
    await api.delete(`/incidents/${ticketId}`, {
      params: { actorUserId },
    });
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to delete ticket"));
  }
};

export const assignIncidentTechnician = async (ticketId, payload) => {
  try {
    const response = await api.put(`/incidents/${ticketId}/assign`, payload);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to assign technician"));
  }
};

export const updateIncidentStatus = async (ticketId, payload) => {
  try {
    const response = await api.patch(`/incidents/${ticketId}/status`, payload);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to update status"));
  }
};

export const listTicketComments = async (ticketId, requesterId) => {
  try {
    const response = await api.get(`/incidents/${ticketId}/comments`, {
      params: { requesterId },
    });

    return response.data ?? [];
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to load comments"));
  }
};

export const addTicketComment = async (ticketId, payload) => {
  try {
    const response = await api.post(`/incidents/${ticketId}/comments`, payload);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to add comment"));
  }
};

export const updateTicketComment = async (ticketId, commentId, payload) => {
  try {
    const response = await api.put(
      `/incidents/${ticketId}/comments/${commentId}`,
      payload
    );

    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to update comment"));
  }
};

export const deleteTicketComment = async (ticketId, commentId, actorUserId) => {
  try {
    await api.delete(`/incidents/${ticketId}/comments/${commentId}`, {
      params: { actorUserId },
    });
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to delete comment"));
  }
};

export const downloadIncidentAttachment = async (
  ticketId,
  attachmentId,
  requesterId
) => {
  try {
    const response = await api.get(
      `/incidents/${ticketId}/attachments/${attachmentId}`,
      {
        params: { requesterId },
        responseType: "blob",
      }
    );

    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to download attachment"));
  }
};

export const addIncidentAttachments = async (
  ticketId,
  actorUserId,
  attachments = []
) => {
  const formData = new FormData();
  attachments.forEach((file) => {
    formData.append("attachments", file);
  });

  try {
    const response = await api.post(`/incidents/${ticketId}/attachments`, formData, {
      params: { actorUserId },
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to add attachments"));
  }
};

export const deleteIncidentAttachment = async (
  ticketId,
  attachmentId,
  actorUserId
) => {
  try {
    const response = await api.delete(
      `/incidents/${ticketId}/attachments/${attachmentId}`,
      {
        params: { actorUserId },
      }
    );

    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to delete attachment"));
  }
};
