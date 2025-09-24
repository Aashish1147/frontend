import axios from "axios"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api"

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Journal API
export const getJournalEntries = async (limit = 10) => {
  const response = await api.get(`/journal?limit=${limit}`)
  return response.data
}

export const createJournalEntry = async (entryData) => {
  const response = await api.post("/journal", entryData)
  return response.data
}

export const getMotivationalMessage = async (sentiment) => {
  const response = await api.post("/journal/inspire", { sentiment })
  return response.data
}

// Tasks API
export const getTasks = async () => {
  const response = await api.get("/tasks")
  return response.data
}

export const createTask = async (taskData) => {
  const response = await api.post("/tasks", taskData)
  return response.data
}

export const toggleTask = async (taskId) => {
  const response = await api.patch(`/tasks/${taskId}/toggle`)
  return response.data
}

export const deleteTask = async (taskId) => {
  await api.delete(`/tasks/${taskId}`)
}

export default api
