import axios from "axios";

/**
 * API base - uses Vite env var or defaults to localhost backend used during development.
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";

/**
 * Optional (DEV ONLY) shared-secret headers for calling backend endpoints that are intended
 * for server-to-server usage (e.g. GET /tasks/due). **DO NOT** expose secrets in a public
 * frontend in production. If you choose to use these from the browser for local testing, set:
 *   VITE_LAMBDA_SHARED_HEADER and VITE_LAMBDA_SHARED_VALUE in your .env.local (vite picks up only VITE_*)
 *
 * WARNING: Including these in client-side code will expose them to users. Only use for local dev.
 */
const DEV_SHARED_HEADER = import.meta.env.VITE_LAMBDA_SHARED_HEADER || null;
const DEV_SHARED_VALUE = import.meta.env.VITE_LAMBDA_SHARED_VALUE || null;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// -------------------------
// Journal API
// -------------------------
export const getJournalEntries = async (limit = 10) => {
  const response = await api.get(`/journal?limit=${limit}`);
  return response.data;
};

export const createJournalEntry = async (entryData) => {
  const response = await api.post("/journal", entryData);
  return response.data;
};

export const getMotivationalMessage = async (sentiment) => {
  const response = await api.post("/journal/inspire", { sentiment });
  return response.data;
};

// -------------------------
// Tasks API
// -------------------------
export const getTasks = async () => {
  const response = await api.get("/tasks");
  return response.data;
};

export const createTask = async (taskData) => {
  const response = await api.post("/tasks", taskData);
  return response.data;
};

/**
 * toggleTask - toggles the task's completed state (existing endpoint)
 */
export const toggleTask = async (taskId) => {
  const response = await api.patch(`/tasks/${taskId}/toggle`);
  return response.data;
};

export const deleteTask = async (taskId) => {
  await api.delete(`/tasks/${taskId}`);
};

// -------------------------
// Reminder-related helpers (new)
// -------------------------

/**
 * toggleReminder - flips reminder_enabled for a task (user-driven, safe to call from frontend)
 * PATCH /api/tasks/:id/reminder-toggle
 */
export const toggleReminder = async (taskId) => {
  const response = await api.patch(`/tasks/${taskId}/reminder-toggle`);
  return response.data;
};

/**
 * getDueTasks - Calls GET /api/tasks/due?window_minutes=XX
 *
 * NOTE: The /tasks/due endpoint is intended for server-to-server use (Lambda) and in production
 * should be protected by a shared secret. By default this function does NOT send any secret headers.
 *
 * If you need to test the endpoint from the browser in a local/dev environment, you can pass
 * { includeSecret: true } and set the env vars VITE_LAMBDA_SHARED_HEADER and VITE_LAMBDA_SHARED_VALUE.
 *
 * WARNING: Setting those VITE_ env vars will expose the secret to client bundle — ONLY use for local dev.
 */
export const getDueTasks = async (windowMinutes = 30, opts = { includeSecret: false }) => {
  const qs = `?window_minutes=${encodeURIComponent(windowMinutes)}`;
  const url = `/tasks/due${qs}`;

  if (opts.includeSecret && DEV_SHARED_HEADER && DEV_SHARED_VALUE) {
    // Dev-only path: add the shared secret header (explicit opt-in)
    const response = await api.get(url, {
      headers: {
        [DEV_SHARED_HEADER]: DEV_SHARED_VALUE,
      },
    });
    return response.data;
  }

  // Default: call without secret. On your production backend this route will likely return 401.
  const response = await api.get(url);
  return response.data;
};

/**
 * getTaskById - convenience helper
 */
export const getTaskById = async (taskId) => {
  const res = await api.get(`/tasks/${taskId}`);
  return res.data;
};

export default api;
