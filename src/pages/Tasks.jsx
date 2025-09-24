"use client"

import { useState, useEffect } from "react"
import { Plus, Trash2, Calendar, Tag, Search, Download } from "lucide-react"
import { getTasks, createTask, toggleTask, deleteTask } from "../utils/api"

const Tasks = () => {
  const [tasks, setTasks] = useState([])
  const [newTask, setNewTask] = useState({ title: "", dueDate: "", tags: "" })
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
      const taskData = {
        title: newTask.title,
        dueDate: newTask.dueDate || null,
        tags: newTask.tags ? newTask.tags.split(",").map((tag) => tag.trim()) : [],
      }

      const createdTask = await createTask(taskData)
      setTasks([...tasks, createdTask])
      setNewTask({ title: "", dueDate: "", tags: "" })
    } catch (error) {
      console.error("Failed to create task:", error)
    }
  }

  const handleToggle = async (taskId) => {
    try {
      const updatedTask = await toggleTask(taskId)
      setTasks(tasks.map((task) => (task.id === taskId ? updatedTask : task)))
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

  const filteredTasks = tasks.filter((task) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      task.title.toLowerCase().includes(searchLower) ||
      (task.tags && task.tags.some((tag) => tag.toLowerCase().includes(searchLower)))
    )
  })

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
                </div>

                <button
                  onClick={() => handleDelete(task.id)}
                  className="text-gray-400 hover:text-red-600 transition-colors duration-200"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default Tasks
