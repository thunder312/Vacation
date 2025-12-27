// server/api/auth/logout.post.ts
export default defineEventHandler(async (event) => {
  // Delete auth cookie
  deleteCookie(event, 'auth-token')

  return {
    success: true,
    message: 'Logged out successfully'
  }
})
