import ChatInterface from '@/components/ChatInterface';
import VelAnimation from '@/components/VelAnimation';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-stone-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Soft Ambient Background - Pleasant & Calm */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Warm, soft gradient orbs - greatly reduced intensity */}
        <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] bg-amber-900/20 rounded-full blur-[120px]" />
        <div className="absolute top-[20%] -right-[10%] w-[60%] h-[60%] bg-orange-900/10 rounded-full blur-[100px]" />
        <div className="absolute -bottom-[10%] left-[30%] w-[50%] h-[50%] bg-yellow-900/10 rounded-full blur-[100px]" />
      </div>

      {/* Main Content Grid */}
      <div className="relative z-10 w-full max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left Vel Animation */}
        <div className="hidden lg:block flex-shrink-0">
          <VelAnimation side="left" />
        </div>

        {/* Center Chat Interface */}
        <div className="flex-1 w-full max-w-4xl mx-auto">
          {/* Header - Simple & Elegant */}
          <div className="text-center mb-8">
            <div className="relative inline-block mb-3">
              <h1 className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-orange-200 to-amber-200 drop-shadow-sm tracking-tight">
                OMNISCIENT
              </h1>
            </div>
            <p className="text-orange-100/60 text-lg font-light tracking-wide mb-2">
              Manifested from Murugan’s belief in you - Omniscient
            </p>
            <div className="flex items-center justify-center gap-2 text-amber-200/40 text-sm">
              <span className="w-1.5 h-1.5 bg-amber-400/60 rounded-full" />
              <span>Powered by Omniscient</span>
              <span className="w-1.5 h-1.5 bg-amber-400/60 rounded-full" />
            </div>
          </div>

          <ChatInterface />
        </div>

        {/* Right Vel Animation */}
        <div className="hidden lg:block flex-shrink-0">
          <VelAnimation side="right" />
        </div>
      </div>

      {/* Very subtle bottom accent */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/20 to-transparent" />
    </main>
  );
}
