"use client"

import { useState, useEffect } from "react"
import { Send, Search, Download, Sparkles, Save, Share, Heart } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { getJournalEntries, createJournalEntry, getMotivationalMessage } from "../utils/api"
import SentimentBadge from "../components/SentimentBadge"

const Journal = () => {
  const [entries, setEntries] = useState([])
  const [newEntry, setNewEntry] = useState({ text: "", tags: "" })
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [lastResponse, setLastResponse] = useState(null)

  useEffect(() => {
    loadEntries()
    loadDraft()
  }, [])

  useEffect(() => {
    // Auto-save draft
    const timer = setTimeout(() => {
      if (newEntry.text.trim()) {
        localStorage.setItem("journal-draft", JSON.stringify(newEntry))
      } else {
        localStorage.removeItem("journal-draft")
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [newEntry])

  const loadEntries = async () => {
    try {
      const data = await getJournalEntries()
      setEntries(data)
    } catch (error) {
      console.error("Failed to load entries:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadDraft = () => {
    const draft = localStorage.getItem("journal-draft")
    if (draft) {
      try {
        setNewEntry(JSON.parse(draft))
      } catch (error) {
        console.error("Failed to load draft:", error)
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!newEntry.text.trim()) return

    setSubmitting(true)
    try {
      const entryData = {
        text: newEntry.text,
        tags: newEntry.tags ? newEntry.tags.split(",").map((tag) => tag.trim()) : [],
      }

      const response = await createJournalEntry(entryData)
      setEntries([response, ...entries])
      setLastResponse(response)
      setNewEntry({ text: "", tags: "" })
      localStorage.removeItem("journal-draft")
    } catch (error) {
      console.error("Failed to create entry:", error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleInspireMore = async () => {
    if (!lastResponse) return

    try {
      const response = await getMotivationalMessage(lastResponse.sentiment)
      setLastResponse({ ...lastResponse, motivationalMessage: response.motivationalMessage })
    } catch (error) {
      console.error("Failed to get inspiration:", error)
    }
  }

  const handleExport = () => {
    const csvContent = [
      ["Date", "Text", "Sentiment", "Tags", "Motivational Message"],
      ...entries.map((entry) => [
        new Date(entry.createdAt).toLocaleDateString(),
        `"${entry.text.replace(/"/g, '""')}"`,
        entry.sentiment,
        entry.tags ? entry.tags.join("; ") : "",
        `"${entry.motivationalMessage?.replace(/"/g, '""') || ""}"`,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "journal-entries.csv"
    link.click()
    URL.revokeObjectURL(url)
  }

  const filteredEntries = entries.filter((entry) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      entry.text.toLowerCase().includes(searchLower) ||
      (entry.tags && entry.tags.some((tag) => tag.toLowerCase().includes(searchLower)))
    )
  })

  const sentimentData = entries.reduce((acc, entry) => {
    const sentiment = entry.sentiment || "Unknown"
    acc[sentiment] = (acc[sentiment] || 0) + 1
    return acc
  }, {})

  const chartData = Object.entries(sentimentData).map(([sentiment, count]) => ({
    sentiment,
    count,
    color:
      {
        Positive: "#10b981",
        Negative: "#ef4444",
        Neutral: "#6b7280",
        Mixed: "#f59e0b",
      }[sentiment] || "#6b7280",
  }))

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
        <h1 className="text-3xl font-bold text-gray-900">Journal</h1>
        <button onClick={handleExport} className="btn-secondary flex items-center space-x-2">
          <Download className="h-4 w-4" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* New Entry Form */}
      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <textarea
              placeholder="How was your day? What's on your mind?"
              value={newEntry.text}
              onChange={(e) => setNewEntry({ ...newEntry, text: e.target.value })}
              className="input-field min-h-[120px] resize-y"
              required
            />
            {newEntry.text.trim() && (
              <p className="text-xs text-gray-500 mt-1">Draft auto-saved • {newEntry.text.length} characters</p>
            )}
          </div>

          <div>
            <input
              type="text"
              placeholder="Tags (comma-separated)"
              value={newEntry.tags}
              onChange={(e) => setNewEntry({ ...newEntry, tags: e.target.value })}
              className="input-field"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary flex items-center space-x-2 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            <span>{submitting ? "Analyzing..." : "Submit Entry"}</span>
          </button>
        </form>
      </div>

      {/* Last Response Card */}
      {lastResponse && (
        <div className="card bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-blue-900">Latest Analysis</span>
            </div>
            <SentimentBadge sentiment={lastResponse.sentiment} />
          </div>

          <p className="text-gray-700 mb-4">{lastResponse.motivationalMessage}</p>

          <div className="flex flex-wrap gap-2">
            <button className="btn-secondary text-sm">
              <Save className="h-3 w-3 mr-1" />
              Save
            </button>
            <button className="btn-secondary text-sm">
              <Share className="h-3 w-3 mr-1" />
              Share
            </button>
            <button onClick={handleInspireMore} className="btn-primary text-sm">
              <Heart className="h-3 w-3 mr-1" />
              Inspire me more
            </button>
          </div>
        </div>
      )}

      {/* Sentiment Chart */}
      {entries.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Sentiment Overview</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <XAxis dataKey="sentiment" />
                <YAxis />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Sentiment Distribution</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="count"
                  label={({ sentiment, count }) => `${sentiment}: ${count}`}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search entries by text or tags..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field pl-10"
        />
      </div>

      {/* Entries List */}
      <div className="space-y-4">
        {filteredEntries.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-500">
              {searchTerm ? "No entries match your search." : "No journal entries yet. Write your first entry above!"}
            </p>
          </div>
        ) : (
          filteredEntries.map((entry) => (
            <div key={entry.id} className="card">
              <div className="flex items-start justify-between mb-3">
                <span className="text-sm text-gray-500">
                  {new Date(entry.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <SentimentBadge sentiment={entry.sentiment} />
              </div>

              <p className="text-gray-700 mb-3 leading-relaxed">{entry.text}</p>

              {entry.motivationalMessage && (
                <div className="bg-blue-50 border-l-4 border-blue-400 p-3 mb-3">
                  <p className="text-blue-800 text-sm italic">{entry.motivationalMessage}</p>
                </div>
              )}

              {entry.tags && entry.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {entry.tags.map((tag, index) => (
                    <span key={index} className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default Journal
