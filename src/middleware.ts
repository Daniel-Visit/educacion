import authConfig from "../auth.config"
import NextAuth from "next-auth"

const { auth } = NextAuth(authConfig)

export default auth(async function middleware(req) {
  // Tu lógica de middleware aquí
  return null
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
} 