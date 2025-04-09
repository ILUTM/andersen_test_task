const API_BASE = process.env.REACT_APP_API_BASE_URL || '/api';

const API = {
  AUTH: {
    LOGIN: `${API_BASE}/api/login/`,
    REGISTER: `${API_BASE}/api/register/`,
    TOKEN: {
      OBTAIN: `${API_BASE}/api/token/`,
      REFRESH: `${API_BASE}/api/token/refresh/`,
      VERIFY: `${API_BASE}/api/token/verify/`,
    },
    ME: `${API_BASE}/api/users/me/`, // For the 'me' action
  },
  USERS: {
    BASE: `${API_BASE}/api/users/`,
    BY_ID: (id) => `${API_BASE}/api/users/${id}/`,
    UPDATE_FIELD: `${API_BASE}/api/users/update_field/`, // For update_field action
  },
  TASKS: {
    BASE: `${API_BASE}/api/tasks/`,
    MY_TASKS: `${API_BASE}/api/tasks/my_tasks/`,
    BY_ID: (id) => `${API_BASE}/api/tasks/${id}/`,
    COMPLETE: (id) => `${API_BASE}/api/tasks/${id}/complete/`,
    UPDATE_TITLE: (id) => `${API_BASE}/api/tasks/${id}/update_title/`,
    UPDATE_DESCRIPTION: (id) => `${API_BASE}/api/tasks/${id}/update_description/`,
  },
};

export default API;