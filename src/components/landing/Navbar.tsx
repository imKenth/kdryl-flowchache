import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Button from '../ui/Button'

/** Navigation links for the landing page sections */
const links = [
  { label: 'Features', id: 'features' },
  { label: 'How It Works', id: 'how-it-works' },
]

/** Responsive navbar with smooth-scroll navigation and mobile hamburger menu */
export default function Navbar() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  /** Whether the current page is the visualizer (hides desktop nav CTA) */
  const isVisualizer = location.pathname === ("/visualizer")

  /** Scroll to a section, navigating to home first if needed */
  function scrollTo(id: string) {
    if (location.pathname !== '/') {
      navigate('/' + '#' + id)
    } else {
      const el = document.getElementById(id)
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  {/* When in visualizer, center the logo */}
  function logoCenter(isVisualizer: boolean) {
    return isVisualizer
    ? "flex justify-center item-center"
    : "flex justify-between items-center"
  }

  return (

    <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-md">
      <div 
        className={`mx-auto flex max-w-7xl px-6 py-4 lg:px-8${
          logoCenter(isVisualizer)
          }`}
      >

        <a href="/" className="text-xl font-bold tracking-tight text-gray-900">
          Flow<span className="text-indigo-600">Cache</span>
        </a>

        {/* Desktop navigation */}
        {!isVisualizer  && (
        <nav className="hidden md:flex md:items-center md:gap-8">
          {links.map((link) => (
            <button
              key={link.id}
              onClick={() => scrollTo(link.id)}
              className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
            >
              {link.label}
            </button>
          ))}
        </nav>
        )}
        
        



        {/* Desktop call-to-action — hidden on the visualizer page */}
        {!isVisualizer && (
          <div className="hidden md:block">
            <Button size="sm" variant="secondary" onClick={() => navigate('/visualizer')}>
              Launch Visualizer
            </Button>
          </div>
          )}

        {/* Mobile hamburger toggle */}
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="md:hidden rounded-lg p-2 text-gray-600 hover:bg-gray-100"
          aria-label="Toggle menu"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {open ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu dropdown */}
      {open && (
        <div className="border-t border-gray-100 px-6 pb-5 pt-3 md:hidden">
          <nav className="flex flex-col gap-3">
            {links.map((link) => (
              <button
                key={link.id}
                onClick={() => { setOpen(false); scrollTo(link.id) }}
                className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
              >
                {link.label}
              </button>
            ))}
            <div className="pt-2">
              <Button size="sm" className="w-full" onClick={() => { setOpen(false); navigate('/visualizer') }}>
                Launch Visualizer
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
