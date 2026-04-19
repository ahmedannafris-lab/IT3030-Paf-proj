const BASE_URL = "http://localhost:8080/api/notifications";

export const getNotificationsByUserId = async (userId) => {
  const response = await fetch(`${BASE_URL}/${userId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to fetch notifications: ${response.status} ${text}`);
  }

  return response.json();
};

export const createNotification = async (notificationData) => {
  const response = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(notificationData),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to create notification: ${response.status} ${text}`);
  }

  return response.json();
};