import { useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthContext'

export function ProfilePage() {
  const { getToken } = useAuth()
  const [token, setToken] = useState('')

  useEffect(() => {
    getToken().then((jwt) => {
      setToken(jwt || '')
    })
  }, [getToken])

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 text-[#04CA37]">
      <h1>Профиль</h1>

      <pre className="mx-auto max-w-7xl px-6 py-12 text-[#04CA37]">
        {token}
      </pre>
    </div>
  )
}
