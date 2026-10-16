"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { adminSetOrderStatus, patchOrder } from "@/lib/orders";
import { sendOrderShippedEmail } from "@/lib/mailer";

export async function setOrderStatusAction(prevState, formData) {
  await requireAdmin();

  const id = formData.get("id");
  const status = formData.get("status");
  try {
    const order = await adminSetOrderStatus(id, status, { trackingNumber: formData.get("trackingNumber") });
    if (status === "shipped") await sendOrderShippedEmail(order);
  } catch (err) {
    return { error: err.message };
  }

  revalidatePath("/admin/zamowienia");
  revalidatePath(`/admin/zamowienia/${id}`);
  return { error: null };
}

export async function saveAdminNoteAction(prevState, formData) {
  await requireAdmin();

  const id = formData.get("id");
  const note = String(formData.get("adminNote") || "").slice(0, 2000);
  try {
    await patchOrder(id, { adminNote: note });
  } catch (err) {
    return { error: err.message };
  }
  revalidatePath(`/admin/zamowienia/${id}`);
  return { error: null, saved: true };
}
