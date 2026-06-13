export type AuthenticatedUser = {
  id: string
  email: string
  name: string
  username: string
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser
    }
  }
}

export {}
