import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isValidSessionToken, ADMIN_SESSION_COOKIE } from "./auth";

// Server Actions można wywołać bezpośrednio POST-em, z pominięciem layoutu
// panelu - dlatego każda akcja admina musi sama wywołać requireAdmin().
export async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  if (!isValidSessionToken(token)) {
    redirect("/admin/login");
  }
}
