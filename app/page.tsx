import ChatInterface from '@/components/ChatInterface';
import VelAnimation from '@/components/VelAnimation';

export default function Home() {
  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-100 via-orange-50 to-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Elements for Spiritual Ambiance */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-orange-300/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-[10%] right-[10%] w-[30%] h-[30%] bg-yellow-200/30 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute bottom-[10%] left-[20%] w-[40%] h-[40%] bg-amber-100/40 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      <div className="relative z-10 w-full max-w-6xl flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
        {/* Left Side: 3D Vel Animation */}
        <div className="hidden md:block">
          <VelAnimation />
        </div>

        {/* Right Side: Chat Interface */}
        <div className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <div className="md:hidden mb-4 flex justify-center">
              <VelAnimation />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-600 mb-2 drop-shadow-sm">
              Kandhan-Karunai
            </h1>
            <p className="text-orange-800/70 text-lg font-medium italic">
              "Let the inner voice guide you..."
            </p>
          </div>

          <ChatInterface />

          <footer className="mt-8 text-center text-orange-900/40 text-sm">
            <p>© 2025 Kandhan-Karunai. All rights reserved.</p>
          </footer>
        </div>
      </div>
    </main>
  );
}
