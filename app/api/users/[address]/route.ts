import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { address: string } }
) {
  try {
    // Veritabanından kullanıcı bilgilerini al
    const user = await db.user.findUnique({
      where: {
        wallet_address: params.address
      },
      select: {
        twitter_username: true,
        profile_image: true,
        wallet_address: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}