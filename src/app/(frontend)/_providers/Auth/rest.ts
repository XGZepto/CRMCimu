import { User } from "@/payload-types"

export const rest = async (
    url: string,
    args?: any, // eslint-disable-line @typescript-eslint/no-explicit-any
    options?: RequestInit,
  ): Promise<null | undefined | User> => {
    const method = options?.method || 'POST'
  
    try {
      const res = await fetch(url, {
        method,
        ...(method === 'POST' ? { body: JSON.stringify(args) } : {}),
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      })

      // Check if response is ok first
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }

      // Check if response is JSON
      const contentType = res.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Response is not JSON')
      }

      const data = await res.json()
      const { errors, user } = data

      if (errors) {
        throw new Error(errors[0].message)
      }

      return user
    } catch (e: unknown) {
      // Better error handling
      if (e instanceof Error) {
        throw e
      }
      throw new Error(String(e))
    }
  }
  