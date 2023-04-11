import { Dispatch, SetStateAction, createContext, useContext, useState } from 'react'

import axios from 'axios'

import { UserDto } from '@admin-web/common/types/UserDto'

interface AuthProviderProps {
  children: React.ReactNode
}

interface IAuthContext {
  user: UserDto | null
  logout: () => Promise<void>
  setUser: Dispatch<SetStateAction<UserDto | null>>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthContext = createContext<IAuthContext | null>(null)

export default function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserDto | null>(null)
  const logout = async () => {
    // TODO: send api for logging user out
    try {
      const res = await axios.get('http://localhost:3333/_api/auth/logout', {
        withCredentials: true,
      })
      console.log(res)
      setUser(null)
    } catch (err) {
      console.log(`Error when logging user out: ${err}`)
    }
  }

  return <AuthContext.Provider value={{ user, setUser, logout }}>{children}</AuthContext.Provider>
}
