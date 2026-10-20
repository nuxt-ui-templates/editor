import { defineEventHandler, getRouterParam } from 'nuxt/server'

export default defineEventHandler(async (event) => {
  const pathname = getRouterParam(event, 'pathname')!

  event.res.headers.set('Content-Security-Policy', 'default-src \'none\';')
  return blob.serve(event, pathname)
})
