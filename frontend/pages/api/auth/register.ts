// frontend/pages/api/auth/register.ts
import { NextApiRequest, NextApiResponse } from 'next'
import { hash } from 'bcryptjs'
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
    const { email, password, name } = req.body

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' })
    }

    // Hash password
    const hashedPassword = await hash(password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    })

    // Create default workspace
    const workspace = await prisma.workspace.create({
      data: {
        name: `${name}'s Workspace`,
        ownerId: user.id,
        members: {
          create: {
            userId: user.id,
            role: 'owner',
          },
        },
      },
    })

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

    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      workspace,
    })
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}