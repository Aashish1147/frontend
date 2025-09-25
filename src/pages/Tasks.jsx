"use client"

import { useState, useEffect } from "react"
import { Plus, Trash2, Calendar, Tag, Search, Download } from "lucide-react"
import { getTasks, createTask, toggleTask, deleteTask, toggleReminder } from "../utils/api"

const Tasks = () => {
  const [tasks, setTasks] = useState([])
  const [newTask, setNewTask] = useState({
    title: "",
    dueDate: "",
    tags: "",
    user_email: "",   // new
    user_name: ""     // optional friendly name
  })

  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTasks()
  }, [])

  const loadTasks = async () => {
    try {
      const data = await getTasks()
      setTasks(data)
    } catch (error) {
      console.error("Failed to load tasks:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!newTask.title.trim()) return

    try {
      if (newTask.user_email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(newTask.user_email)) {
          // show some UI error message, or:
          return alert("Please enter a valid email address");
        }
      }
      
      const taskData = {
        title: newTask.title,
        description: newTask.description || "",   // if you have a description field
        dueDate: newTask.dueDate || null,
        tags: newTask.tags ? newTask.tags.split(",").map((tag) => tag.trim()) : [],
        user_email: newTask.user_email ? newTask.user_email.trim() : null,
        user_name: newTask.user_name ? newTask.user_name.trim() : "",
      }

      const createdTask = await createTask(taskData)
      setTasks([...tasks, createdTask])
      setNewTask({ title: "", dueDate: "", tags: "", user_email: "", user_name: "" })
    } catch (error) {
      console.error("Failed to create task:", error)
    }
  }

  const handleToggle = async (taskId) => {
    try {
      const updatedTask = await toggleTask(taskId)
      // the existing toggleTask might return the updated task or a success object
      if (updatedTask && updatedTask.id) {
        setTasks(tasks.map((task) => (task.id === taskId ? updatedTask : task)))
      } else {
        // fallback: optimistic toggle locally
        setTasks(tasks.map((task) => (task.id === taskId ? { ...task, completed: !task.completed } : task)))
      }
    } catch (error) {
      console.error("Failed to toggle task:", error)
    }
  }

  const handleDelete = async (taskId) => {
    try {
      await deleteTask(taskId)
      setTasks(tasks.filter((task) => task.id !== taskId))
    } catch (error) {
      console.error("Failed to delete task:", error)
    }
  }

  const handleExport = () => {
    const dataStr = JSON.stringify(tasks, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = "tasks.json"
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleToggleReminder = async (taskId) => {
    try {
      const res = await toggleReminder(taskId)
      // res could be { ok: true, reminder_enabled: boolean } or the updated task
      if (res && typeof res.reminder_enabled !== "undefined") {
        setTasks(tasks.map((t) => (t.id === taskId ? { ...t, reminder_enabled: res.reminder_enabled } : t)))
      } else if (res && res.id) {
        setTasks(tasks.map((t) => (t.id === taskId ? res : t)))
      } else {
        // fallback: refetch tasks
        await loadTasks()
      }
    } catch (err) {
      console.error("Failed to toggle reminder", err)
    }
  }

  const filteredTasks = tasks.filter((task) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      task.title.toLowerCase().includes(searchLower) ||
      (task.tags && task.tags.some((tag) => tag.toLowerCase().includes(searchLower)))
    )
  })

  const formatDate = (d) => {
    if (!d) return "—"
    try {
      return new Date(d).toLocaleString()
    } catch {
      return d
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
        <button onClick={handleExport} className="btn-secondary flex items-center space-x-2">
          <Download className="h-4 w-4" />
          <span>Export JSON</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search tasks by title or tags..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field pl-10"
        />
      </div>

      {/* Add Task Form */}
      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Task title..."
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              className="input-field"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="date"
                value={newTask.dueDate}
                onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                className="input-field pl-10"
              />
            </div>

            <div className="relative">
              <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tags (comma-separated)"
                value={newTask.tags}
                onChange={(e) => setNewTask({ ...newTask, tags: e.target.value })}
                className="input-field pl-10"
              />
            </div>

            <div>
              <input
                type="text"
                placeholder="Your name (optional)"
                value={newTask.user_name}
                onChange={(e) => setNewTask({ ...newTask, user_name: e.target.value })}
                className="input-field"
              />
            </div>

            {/* User email */}
            <div>
              <input
                type="email"
                placeholder="Your email (optional)"
                value={newTask.user_email}
                onChange={(e) => setNewTask({ ...newTask, user_email: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          <button type="submit" className="btn-primary flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Add Task</span>
          </button>
        </form>
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-500">
              {searchTerm ? "No tasks match your search." : "No tasks yet. Create your first task above!"}
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div key={task.id} className="card">
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => handleToggle(task.id)}
                  className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />

                <div className="flex-1 min-w-0">
                  <h3 className={`font-medium ${task.completed ? "line-through text-gray-500" : "text-gray-900"}`}>
                    {task.title}
                  </h3>

                  <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-gray-500">
                    {task.dueDate && (
                      <span className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                      </span>
                    )}

                    {task.tags && task.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {task.tags.map((tag, index) => (
                          <span key={index} className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Reminder info */}
                  <div className="mt-3 flex items-center justify-between gap-4">
                    <div className="text-sm text-gray-600">
                      <div>
                        <strong>Reminder:</strong> {task.reminder_enabled ? "ON" : "OFF"}
                        {" "}
                        {task.reminder_sent && <span className="ml-2 inline-block bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs">Reminded</span>}
                      </div>
                      <div className="mt-1">
                        <small>Last status: <span className="font-medium">{task.last_reminder_status || "—"}</span></small>
                      </div>
                      <div>
                        <small>Last sent: <span className="font-medium">{formatDate(task.last_reminder_sent_at)}</span></small>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleReminder(task.id)}
                        className="px-3 py-1 border rounded text-sm hover:bg-gray-50"
                        title={task.reminder_enabled ? "Disable reminder" : "Enable reminder"}
                      >
                        {task.reminder_enabled ? "Disable" : "Enable"}
                      </button>

                      <button
                        onClick={() => handleDelete(task.id)}
                        className="text-gray-400 hover:text-red-600 transition-colors duration-200"
                        title="Delete task"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Mobile delete button fallback (if layout collapses) */}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default Tasks
