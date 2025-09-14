// frontend/pages/index.tsx
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useStore } from '../stores/useStore'

export default function Home() {
  const router = useRouter()
  const user = useStore((state) => state.user)

  useEffect(() => {
    if (user) {
      router.push('/dashboard')
    } else {
      router.push('/auth/login')
    }
  }, [user, router])

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
    </div>
  )
}