import { NextResponse } from "next/server";
import {
  generateEstimateDescription,
  OpenAiEstimateError,
} from "@/lib/openai/generate-estimate";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

type GeneratePreventivoBody = {
  prompt?: string;
};

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Autenticazione richiesta." },
        { status: 401 }
      );
    }

    let body: GeneratePreventivoBody;

    try {
      body = (await request.json()) as GeneratePreventivoBody;
    } catch {
      return NextResponse.json(
        { error: "Corpo della richiesta non valido." },
        { status: 400 }
      );
    }

    const prompt = body.prompt?.trim();

    if (!prompt) {
      return NextResponse.json(
        { error: "Inserisci una breve descrizione del lavoro." },
        { status: 400 }
      );
    }

    if (prompt.length > 500) {
      return NextResponse.json(
        { error: "La descrizione breve non può superare 500 caratteri." },
        { status: 400 }
      );
    }

    const description = await generateEstimateDescription(prompt);

    return NextResponse.json({ description });
  } catch (error) {
    if (error instanceof OpenAiEstimateError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    console.error("[api/ai/generate-preventivo]", error);

    return NextResponse.json(
      { error: "Errore imprevisto durante la generazione." },
      { status: 500 }
    );
  }
}
