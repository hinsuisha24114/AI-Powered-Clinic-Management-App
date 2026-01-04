export const setToken = (token) => {
  localStorage.setItem('token', token)
}

export const getToken = () => {
  return localStorage.getItem('token')
}

export const removeToken = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user_role') // also clear role when logging out
}

export const isAuthenticated = () => {
  return !!getToken()
}

// ===== Simple helpers for user role (doctor / patient / receptionist) =====

export const setUserRole = (role) => {
  localStorage.setItem('user_role', role)
}

export const getUserRole = () => {
  return localStorage.getItem('user_role') || 'Doctor'
}
