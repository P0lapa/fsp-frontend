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
    <div className="mx-auto max-w-7xl px-6 py-12 font-ibm text-[var(--color-text)]">
      <h1>Профиль</h1>

      <pre className="mx-auto max-w-7xl overflow-x-auto px-6 py-12 font-ibm text-[var(--color-text)]">
        {token}
      </pre>
    </div>
  )
}
