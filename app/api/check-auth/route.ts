import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"
import { createOrUpdatePlayer } from "@/services/playerService"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()
    const { walletAddress } = body

    if (!session?.user || !walletAddress) {
      return NextResponse.json({ 
        success: false, 
        error: "Oturum veya cüzdan bilgisi eksik" 
      })
    }

    // Supabase'e kaydet
    const player = await createOrUpdatePlayer({
      twitter_id: session.user.id,
      twitter_username: session.user.username || "",
      wallet_address: walletAddress,
      profile_image: session.user.image || ""
    })

    return NextResponse.json({ 
      success: true, 
      authenticated: true,
      player
    })

  } catch (error) {
    console.error("Auth check error:", error)
    return NextResponse.json({ 
      success: false,
      error: "İşlem sırasında bir hata oluştu" 
    })
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    return NextResponse.json({ 
      authenticated: !!session,
      user: session?.user 
    })
  } catch (error) {
    console.error("Auth check error:", error)
    return NextResponse.json({ 
      authenticated: false,
      error: "Kimlik doğrulama kontrolü başarısız" 
    })
  }
}