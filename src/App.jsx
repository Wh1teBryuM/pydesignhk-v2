import { useState, useEffect } from 'react'

function App() {
  const [status, setStatus] = useState('Checking connection...')

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const res = await fetch('http://localhost:3001/test')
        const data = await res.json()
        setStatus(data.message)
      } catch (error) {
        setStatus('Backend not reachable')
      }
    }

    checkBackend()
  }, [])

  return (
    <div>
      <h1>pydesignhk</h1>
      <p>Backend status: {status}</p>
    </div>
  )
}

export default App