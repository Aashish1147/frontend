import { Link, useLocation } from "react-router-dom"
import { CheckSquare, BookOpen } from "lucide-react"

const Navbar = () => {
  const location = useLocation()

  const isActive = (path) => {
    if (path === "/tasks") return location.pathname === "/" || location.pathname === "/tasks"
    return location.pathname === path
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <CheckSquare className="h-8 w-8 text-primary-600" />
            <span className="text-xl font-bold text-gray-900">TaskJournal</span>
          </div>

          <div className="flex space-x-1">
            <Link
              to="/tasks"
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                isActive("/tasks")
                  ? "bg-primary-100 text-primary-700"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              <CheckSquare className="h-4 w-4" />
              <span>Tasks</span>
            </Link>

            <Link
              to="/journal"
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                isActive("/journal")
                  ? "bg-primary-100 text-primary-700"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              <BookOpen className="h-4 w-4" />
              <span>Journal</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
