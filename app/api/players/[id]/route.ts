import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// Segment Config
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const params = await context.params;
    const id = params.id;
    console.log('Twitter ID query:', id);

    const { data, error } = await supabase
      .from("players")
      .select("*")
      .eq("twitter_id", id)
      .maybeSingle();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json(null, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Route error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
