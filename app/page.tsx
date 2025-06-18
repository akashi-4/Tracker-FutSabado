'use client';

export default function Home() {
  const handleGetStarted = () => {
    window.location.href = '/player/players-list'
  }

  return (
    <main className="h-screen text-white flex flex-col items-center justify-center px-4 relative -mt-[84px]">
      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-black/60 z-0"></div>
      
      <div className="z-10 w-full max-w-6xl flex flex-col items-center gap-4 sm:gap-8 text-center">
        <h1 className="text-4xl sm:text-6xl font-bold text-accent drop-shadow-lg">Futeba</h1>
        <p className="text-lg sm:text-2xl font-mono max-w-3xl px-4 text-white drop-shadow-md">
          Welcome to Futeba - Your Football Community
        </p>
        <button 
          onClick={handleGetStarted} 
          className="btn-primary max-w-xs shadow-lg"
        >
          See what's happening
        </button>
      </div>
    </main>
  )
}

