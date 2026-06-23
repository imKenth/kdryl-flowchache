import { useNavigate } from "react-router-dom";
import Button from "./ui/Button";

export default function Hero() {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-[calc(100vh-65px)] flex flex-col items-center justify-center text-center bg-gradient-to-b from-white via-indigo-50/30 to-white px-6">
      {/* Decorative blobs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-200/20 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl" />

      <div className="relative">
        <span className="inline-block rounded-full bg-indigo-100 px-4 py-1.5 text-xs font-semibold text-indigo-700 mb-6">
          Interactive Learning Tool
        </span>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-gray-900 leading-tight">
          Visualize Cache
          <br />
          <span className="bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent">
            Replacement Algorithms
          </span>
        </h1>

        <p className="mt-5 max-w-xl mx-auto text-gray-500 text-lg leading-relaxed">
          Step-by-step interactive simulations of FIFO and LRU page replacement — 
          built for students, educators, and curious engineers.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Button size="lg" onClick={() => navigate("/visualizer")}>
            Launch Visualizer
          </Button>
          <Button
            variant="secondary"
            size="lg"
            onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Explore Features
          </Button>
        </div>

        <div className="mt-12 flex items-center justify-center gap-8 text-sm text-gray-400">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full bg-green-400" />
            FIFO &amp; LRU
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full bg-indigo-400" />
            Step-by-step
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full bg-blue-400" />
            Real-time stats
          </span>
        </div>
      </div>
    </section>
  );
}
