'use client';

export default function Home() {
  const handleGetStarted = () => {
    window.location.href = '/player/add-player'
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">        
      <div className="z-10 w-full max-w-6xl flex flex-col items-center gap-8 text-center">
        <h1 className="text-6xl font-bold">Futebolada</h1>
        <p className="text-2xl font-mono max-w-3xl">
          Welcome to Futebolada - Your Football Community
        </p>
        <button onClick={handleGetStarted} className="bg-blue-500 text-white px-4 py-2 rounded-md">
          Get Started
        </button>
      </div>
    </main>
  )
}

