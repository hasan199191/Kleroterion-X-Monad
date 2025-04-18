import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export interface Player {
  id: string
  twitter_id: string
  twitter_username: string
  wallet_address: string
  profile_image: string
  created_at: string
  last_login: string
  is_active: boolean
}

export interface PlayerInput {
  twitter_id: string
  twitter_username: string
  wallet_address: string
  profile_image: string
}

// playerService metotları
export const playerService = {
  getPlayerByTwitterId: async (twitterId: string): Promise<Player | null> => {
    try {
      const response = await fetch(`/api/players/${twitterId}`)
      
      if (response.status === 404) {
        return null // Oyuncu bulunamadığında null dön
      }
      
      if (!response.ok) {
        throw new Error(`API hatası: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error("Oyuncu bilgileri alınamadı:", error)
      return null
    }
  },
  createPlayer: async (input: PlayerInput): Promise<Player> => {
    const { data: existingPlayer } = await supabase
      .from("players")
      .select()
      .eq("twitter_id", input.twitter_id)
      .single()

    if (existingPlayer) {
      const { data, error } = await supabase
        .from("players")
        .update({ 
          wallet_address: input.wallet_address, 
          last_login: new Date().toISOString() 
        })
        .eq("twitter_id", input.twitter_id)
        .select()
        .single()

      if (error) throw error
      return data
    }

    const { data, error } = await supabase
      .from("players")
      .insert([{
        ...input,
        is_active: true,
      }])
      .select()
      .single()

    if (error) throw error
    return data
  },
  // Cüzdan adresine göre oyuncu bilgilerini getir
  getPlayerByWallet: async (walletAddress: string): Promise<Player | null> => {
    try {
      if (!walletAddress) {
        console.error("Wallet address is required")
        return null
      }

      console.log("Fetching player for wallet:", walletAddress)

      const { data, error } = await supabase
        .from("players")
        .select("*")
        .eq("wallet_address", walletAddress.toLowerCase())
        .single()

      if (error) {
        // Eğer kayıt bulunamazsa
        if (error.code === 'PGRST116') {
          console.log(`No player found for wallet: ${walletAddress}`)
          return null
        }
        
        // Diğer DB hataları için
        console.error("DB Error:", {
          code: error.code,
          message: error.message,
          details: error.details
        })
        return null
      }

      if (!data) {
        console.log(`No data returned for wallet: ${walletAddress}`)
        return null
      }

      console.log("Found player data:", {
        twitter_username: data.twitter_username,
        wallet_address: data.wallet_address,
        hasProfileImage: !!data.profile_image
      })

      return data
    } catch (error) {
      console.error("Service Error:", {
        error: error instanceof Error ? error.message : error
      })
      return null
    }
  }
}

// Alternatif export fonksiyonları
export const createOrUpdatePlayer = playerService.createPlayer
export const getPlayerByTwitterId = playerService.getPlayerByTwitterId
export const getPlayerInfo = playerService.getPlayerByWallet