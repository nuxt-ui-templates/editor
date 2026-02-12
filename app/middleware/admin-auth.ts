export default defineRouteMiddleware((to, from) => {
  const auth = useAuth()

  // Check if route requires authentication
  if (to.path.startsWith('/admin') && to.path !== '/admin/login') {
    if (!auth.isAuthenticated) {
      return navigateTo('/admin/login')
    }
  }

  // Redirect logged-in users from login page
  if (to.path === '/admin/login' && auth.isAuthenticated) {
    return navigateTo('/admin')
  }
})
