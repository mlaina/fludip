import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'

const publicRoutes = ['/', '/legal', '/s/', '/api/webhook', '/api/lisa', '/image', '/validation', '/auth/callback', '/auth/confirm', '/preview/*', '/my-story/*']

// Rutas permitidas para usuarios con plan WAITING
const waitingAllowedRoutes = ['/coming-soon', '/story-view/']

export async function middleware (req: { nextUrl: { pathname: string; searchParams: { has: (arg0: string) => any } }; url: string | URL | undefined; headers: { get: (arg0: string) => string } }) {
  let res = NextResponse.next()

  if (req.nextUrl.pathname.startsWith('/images')) {
    return res
  }

  // Si se detecta el parámetro _cf_chl_tk, forzar redirección con status 303 y eliminar header duplicado.
  if (req.nextUrl.searchParams.has('_cf_chl_tk')) {
    res = NextResponse.redirect(new URL('/', req.url), { status: 303 })
    res.headers.delete('x-middleware-set-cookie')
    return res
  }

  if (req.nextUrl.pathname.startsWith('/auth/callback')) {
    return res // Permitir el flujo de autenticación sin interrupciones
  }

  // Inicializa Supabase en el middleware
  const supabase = createMiddlewareClient({ req, res })
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    if (req.nextUrl.pathname !== '/') {
      res = NextResponse.redirect(new URL('/', req.url), { status: 303 })
      res.headers.delete('x-middleware-set-cookie')
      return res
    }
    return res
  }

  // Verifica si la ruta es pública
  const isPublicRoute = publicRoutes.some((route) => {
    if (route.endsWith('/*')) {
      const baseRoute = route.slice(0, -2)
      return req.nextUrl.pathname.startsWith(baseRoute)
    }
    return route === req.nextUrl.pathname
  })

  if (user && req.nextUrl.pathname === '/success') {
    return res
  }

  if (user && req.nextUrl.pathname.startsWith('/api/')) {
    return res
  }

  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|videos/).*)']
}
