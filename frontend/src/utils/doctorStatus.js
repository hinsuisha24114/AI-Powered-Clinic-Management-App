// Simple helper functions to store doctor's leave status in localStorage

const KEY = 'doctor_on_leave' // storage key

// Save leave status (true/false) as a string
export const setDoctorOnLeave = (isOnLeave) => {
  localStorage.setItem(KEY, isOnLeave ? 'true' : 'false')
}

// Read leave status. Returns true if stored as 'true', otherwise false.
export const getDoctorOnLeave = () => {
  return localStorage.getItem(KEY) === 'true'
}



