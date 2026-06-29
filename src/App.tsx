import { useEffect } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import Navbar from './components/landing/Navbar'
import Hero from './components/HeroSection'
import Button from './components/ui/Button'
import Visualizer from './pages/visualizer'

/** Feature cards displayed on the landing page */
const features = [
  {
    title: 'FIFO Algorithm',
    desc: 'First-In-First-Out page replacement. See how the oldest page gets evicted first when a fault occurs.',
    color: 'from-indigo-500 to-blue-500',
  },
  {
    title: 'LRU Algorithm',
    desc: 'Least-Recently-Used page replacement. Watch how pages that haven\'t been accessed the longest get replaced.',
    color: 'from-violet-500 to-purple-500',
  },
  {
    title: 'Step Control',
    desc: 'Play through simulations automatically or step forward/backward to examine each page fault in detail.',
    color: 'from-sky-500 to-cyan-500',
  },
  {
    title: 'Live Statistics',
    desc: 'Track page faults, hits, hit ratio, and fault ratio as the simulation runs in real time.',
    color: 'from-emerald-500 to-teal-500',
  },
]

/** Steps guide displayed in the "How It Works" section */
const steps = [
  { num: '01', title: 'Configure', desc: 'Set the number of memory frames, pick FIFO or LRU, and enter a page reference string.' },
  { num: '02', title: 'Simulate', desc: 'Watch pages load into frames one by one. Faults and hits are highlighted with color cues.' },
  { num: '03', title: 'Analyze', desc: 'Review the complete solution trace and summary statistics to understand algorithm behavior.' },
]

/** Landing page with hero, features, how-it-works, and footer sections */
function Home() {
  const navigate = useNavigate()

  /** Scroll to a section on page load if a hash is present in the URL */
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '')
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    }
  }, [])

  return (
    <main>
      <Hero />

      {/* Features */}
      <section id="features" className="scroll-mt-20 px-6 py-24 bg-white">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <span className="inline-block rounded-full bg-indigo-100 px-4 py-1.5 text-xs font-semibold text-indigo-700 mb-4">
              Features
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
              Everything you need to understand page replacement
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <div
                key={f.title}
                className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
              >
                <div className={`h-2 w-12 rounded-full bg-gradient-to-r ${f.color} mb-5`} />
                <h3 className="text-base font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="scroll-mt-20 px-6 py-24 bg-gray-50/50">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <span className="inline-block rounded-full bg-indigo-100 px-4 py-1.5 text-xs font-semibold text-indigo-700 mb-4">
              How It Works
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
              Three simple steps
            </h2>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {steps.map((s) => (
              <div key={s.num} className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-sm font-bold text-indigo-700">
                  {s.num}
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Button size="lg" onClick={() => navigate('/visualizer')}>
              Get Started Now
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white px-6 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <span className="text-sm font-bold text-gray-900">
            Flow<span className="text-indigo-600">Cache</span>
          </span>
          <p className="text-xs text-gray-400">
            Built for learning — FIFO &amp; LRU page replacement visualization.
          </p>
        </div>
      </footer>
    </main>
  )
}

/** Root application component with navigation and routing */
function App() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/visualizer" element={<Visualizer />} />
      </Routes>
    </div>
  )
}

export default App
