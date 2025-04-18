import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  try {
    // Basit bir sorgu deneyelim
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .limit(1)

    if (error) {
      console.error('Supabase bağlantı hatası:', error)
      return NextResponse.json({ 
        success: false, 
        error: error.message 
      })
    }

    return NextResponse.json({ 
      success: true, 
      connectionTest: "Başarılı",
      data 
    })
  } catch (error) {
    console.error('Test sırasında hata:', error)
    return NextResponse.json({ 
      success: false, 
      error: "Bağlantı testi başarısız" 
    })
  }
}