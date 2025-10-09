import React from 'react'
import { useNavigate } from 'react-router-dom'

function HomePage() {
    const navigate = useNavigate()
  return (
    <div>
      <button onClick={()=> navigate('/sign-in')}>
SignIn
      </button>
    </div>
  )
}

export default HomePage
