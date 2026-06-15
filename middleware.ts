import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const publicRoutes = new Set([
    '/',
    '/registreren',
    '/inloggen',
    '/wachtwoord-vergeten',
])

function isPublicRoute(pathname: string): boolean {
    if (publicRoutes.has(pathname)) return true
    if (pathname.startsWith('/auth')) return true
    return false
}

export async function middleware(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    )
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const {
        data: { user }
    } = await supabase.auth.getUser()

    const { pathname } = request.nextUrl

    if (user && pathname === '/inloggen') {
        const url = request.nextUrl.clone()
        url.pathname = '/vandaag'
        return NextResponse.redirect(url)
    }

    if (!user && !isPublicRoute(pathname)) {
        const url = request.nextUrl.clone()
        url.pathname = '/inloggen'
        return NextResponse.redirect(url)
    }

    return supabaseResponse;
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ]
}
