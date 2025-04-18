import { NextResponse } from "next/server"
import { createOrUpdatePlayer } from "@/services/playerService"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log('Gelen veri:', body)

    const player = await createOrUpdatePlayer(body)
    console.log('Oluşturulan kayıt:', player)

    return NextResponse.json({ 
      success: true, 
      player 
    })
  } catch (error) {
    console.error('Kayıt hatası:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Bilinmeyen hata' 
    })
  }
}