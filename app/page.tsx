'use client';

export default function Home() {
  const handleGetStarted = () => {
    window.location.href = '/player/add-player'
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8">        
      <div className="z-10 w-full max-w-6xl flex flex-col items-center gap-4 sm:gap-8 text-center">
        <h1 className="text-4xl sm:text-6xl font-bold">Futebolada</h1>
        <p className="text-lg sm:text-2xl font-mono max-w-3xl px-4">
          Welcome to Futebolada - Your Football Community
        </p>
        <button 
          onClick={handleGetStarted} 
          className="bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-600 transition-colors"
        >
          Get Started
        </button>
      </div>
    </main>
  )
}

