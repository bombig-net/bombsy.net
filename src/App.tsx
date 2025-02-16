import './App.css'

function App() {

  const handleClick = () => {
    console.log('Button clicked')
  }

  return (
    <main className="flex flex-col justify-center items-center bg-black h-screen">
      <button className="bg-white px-8 py-4 rounded-md font-bold text-2xl uppercase" onClick={handleClick}>Don't click this button</button>
    </main>
  )
}

export default App
