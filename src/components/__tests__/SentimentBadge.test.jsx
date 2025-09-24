import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import "@testing-library/jest-dom"
import SentimentBadge from "../SentimentBadge"

describe("SentimentBadge", () => {
  it("renders positive sentiment correctly", () => {
    render(<SentimentBadge sentiment="positive" />)
    const badge = screen.getByText("positive")
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass("bg-green-100", "text-green-800")
  })

  it("renders negative sentiment correctly", () => {
    render(<SentimentBadge sentiment="negative" />)
    const badge = screen.getByText("negative")
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass("bg-red-100", "text-red-800")
  })

  it("renders unknown sentiment as default", () => {
    render(<SentimentBadge sentiment={null} />)
    const badge = screen.getByText("Unknown")
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass("bg-gray-100", "text-gray-800")
  })
})
