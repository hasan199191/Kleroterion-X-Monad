"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useWallet } from "@/context/WalletContext"
import { playerService } from "@/services/playerService"
import { supabase } from "@/lib/supabase"

export default function TestPage() {
  const { data: session, status } = useSession()
  const wallet = useWallet()
  const [player, setPlayer] = useState(null)

  useEffect(() => {
    const initPlayer = async () => {
      if (session?.user?.id && wallet.address) {
        try {
          // Önce oyuncuyu kontrol et
          const existingPlayer = await playerService.getPlayerByTwitterId(session.user.id)

          if (!existingPlayer) {
            // Oyuncu yoksa yeni kayıt oluştur
            const newPlayer = {
              twitter_id: session.user.id,
              twitter_username: session.user.username || '',
              wallet_address: wallet.address,
              profile_image: session.user.image || '',
              created_at: new Date().toISOString(),
              last_login: new Date().toISOString(),
              is_active: true
            }

            // Supabase'e direkt kaydet
            const { data, error } = await supabase
              .from('players')
              .insert([newPlayer])
              .select()
              .single()

            if (error) {
              console.error('Kayıt hatası:', error)
            } else {
              console.log('Yeni oyuncu kaydedildi:', data)
              setPlayer(data)
            }
          } else {
            setPlayer(existingPlayer)
          }
        } catch (error) {
          console.error('Oyuncu işlemi hatası:', error)
        }
      }
    }

    initPlayer()
  }, [session, wallet.address])

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Auth Test Sayfası</h1>
      
      <div className="space-y-4">
        <div className="p-4 bg-gray-100 rounded">
          <h2 className="font-bold">Oturum Durumu:</h2>
          <pre className="mt-2 p-2 bg-white rounded">
            {JSON.stringify({
              status,
              session,
              userId: session?.user?.id,
              walletAddress: wallet.address,
              player
            }, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}