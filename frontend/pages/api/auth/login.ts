// frontend/pages/api/auth/login.ts
import { NextApiRequest, NextApiResponse } from 'next'
import { compare } from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../../../src/lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { email, password } = req.body

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        workspaces: {
          include: {
            workspace: true,
          },
        },
      },
    })

    if (!user || !(await compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: '1d' }
    )

    // Set HTTP-only cookie
    res.setHeader(
      'Set-Cookie',
      `token=${token}; HttpOnly; Path=/; Max-Age=86400; SameSite=Strict${
        process.env.NODE_ENV === 'production' ? '; Secure' : ''
      }`
    )

    res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      workspaces: user.workspaces.map((wm) => wm.workspace),
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}