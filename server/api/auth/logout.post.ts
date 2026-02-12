export default defineEventHandler(async (event) => {
  try {
    // Clear auth token cookie
    deleteCookie(event, 'auth_token')

    return {
      success: true,
      message: 'Logged out successfully'
    }
  }
  catch (error) {
    console.error('[v0] Logout error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Logout failed'
    })
  }
})
