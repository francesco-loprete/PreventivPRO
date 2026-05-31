import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAccountDeletionConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  if (!isAccountDeletionConfigured()) {
    return NextResponse.json(
      { error: "Account deletion is not configured on the server." },
      { status: 503 }
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const admin = createAdminClient();

    const { error: preventiviError } = await admin
      .from("preventivi")
      .delete()
      .eq("user_id", user.id);

    if (preventiviError) {
      throw preventiviError;
    }

    const { error: clientiError } = await admin
      .from("clienti")
      .delete()
      .eq("user_id", user.id);

    if (clientiError) {
      throw clientiError;
    }

    const { error: deleteUserError } = await admin.auth.admin.deleteUser(
      user.id
    );

    if (deleteUserError) {
      throw deleteUserError;
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Account deletion failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
