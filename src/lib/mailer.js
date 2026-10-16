import "server-only";
import nodemailer from "nodemailer";
import { formatPrice } from "./shipping.js";
import { statusLabel } from "./order-status.js";

// Wysyłka przez SMTP (np. skrzynka klubowa w domenie kw.poznan.pl).
// Gdy SMTP nie jest skonfigurowane, maile są tylko logowane - zamówienie i tak przechodzi.
let transporter = null;

function getTransporter() {
  if (!process.env.SMTP_HOST) return null;
  if (!transporter) {
    const port = Number(process.env.SMTP_PORT || 465);
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
    });
  }
  return transporter;
}

function siteUrl() {
  return (process.env.SITE_URL || "http://localhost:3000").replace(/\/$/, "");
}

function escapeHtml(text) {
  return String(text ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

function deliveryText(order) {
  if (order.delivery?.lockerCode) return `Paczkomat InPost: ${order.delivery.lockerCode}`;
  if (order.delivery?.street) {
    return `${order.delivery.street}, ${order.delivery.postalCode} ${order.delivery.city}`;
  }
  return "Odbiór osobisty - ul. Składowa 11/10, Poznań";
}

function orderSummaryHtml(order) {
  const rows = order.lines
    .map(
      (l) =>
        `<tr><td style="padding:4px 8px">${escapeHtml(l.name)}${l.variantLabel ? ` (${escapeHtml(l.variantLabel)})` : ""}</td>` +
        `<td style="padding:4px 8px;text-align:center">${l.qty}</td>` +
        `<td style="padding:4px 8px;text-align:right">${formatPrice(l.unitPrice * l.qty)}</td></tr>`
    )
    .join("");
  return `
    <table style="border-collapse:collapse;width:100%;max-width:560px;font-size:14px">
      <thead><tr style="background:#f2f2ed"><th style="padding:4px 8px;text-align:left">Produkt</th><th style="padding:4px 8px">Ilość</th><th style="padding:4px 8px;text-align:right">Kwota</th></tr></thead>
      <tbody>${rows}
        <tr><td style="padding:4px 8px">Dostawa: ${escapeHtml(order.shipping.label)}</td><td></td><td style="padding:4px 8px;text-align:right">${formatPrice(order.shipping.price)}</td></tr>
        <tr><td style="padding:8px;font-weight:bold">Razem</td><td></td><td style="padding:8px;text-align:right;font-weight:bold">${formatPrice(order.total)}</td></tr>
      </tbody>
    </table>
    <p style="font-size:14px"><strong>Dostawa:</strong> ${escapeHtml(deliveryText(order))}</p>`;
}

async function send({ to, subject, html, replyTo }) {
  const t = getTransporter();
  if (!t) {
    console.warn(`[mailer] SMTP nieskonfigurowane - pomijam maila "${subject}" do ${to}`);
    return;
  }
  try {
    await t.sendMail({
      from: process.env.MAIL_FROM || process.env.SMTP_USER,
      to,
      subject,
      html,
      replyTo,
    });
  } catch (err) {
    // Mail to dodatek - jego błąd nie może zepsuć zamówienia ani webhooka.
    console.error(`[mailer] Nie udało się wysłać "${subject}" do ${to}:`, err.message);
  }
}

/** Potwierdzenie dla klienta + powiadomienie dla sklepu. */
export async function sendOrderConfirmedEmails(order) {
  const isCash = order.paymentMethod === "cash";
  const intro = isCash
    ? "Dziękujemy za zamówienie! Zapłacisz gotówką przy odbiorze osobistym - skontaktujemy się z Tobą, aby ustalić termin."
    : "Dziękujemy za zamówienie! Płatność została zaksięgowana. Poinformujemy Cię, gdy paczka zostanie wysłana.";

  const customerHtml = `
    <div style="font-family:Arial,sans-serif;color:#14140F">
      <h2>Zamówienie ${escapeHtml(order.number)}</h2>
      <p>${intro}</p>
      ${orderSummaryHtml(order)}
      <p style="font-size:13px;color:#555">Masz prawo odstąpić od umowy w ciągu 14 dni od otrzymania towaru bez podania przyczyny.
      Szczegóły w <a href="${siteUrl()}/regulamin">regulaminie sklepu</a>.</p>
      <p style="font-size:13px;color:#555">Pytania? Odpowiedz na tego maila.<br>Klub Wysokogórski w Poznaniu</p>
    </div>`;

  const tasks = [
    send({
      to: order.customer.email,
      subject: `Potwierdzenie zamówienia ${order.number} - Sklep KW Poznań`,
      html: customerHtml,
      replyTo: process.env.SHOP_NOTIFY_EMAIL,
    }),
  ];

  if (process.env.SHOP_NOTIFY_EMAIL) {
    tasks.push(
      send({
        to: process.env.SHOP_NOTIFY_EMAIL,
        subject: `Nowe zamówienie ${order.number} (${statusLabel(order.status)})`,
        replyTo: order.customer.email,
        html: `
          <div style="font-family:Arial,sans-serif">
            <p><strong>${escapeHtml(order.customer.name)}</strong> - ${escapeHtml(order.customer.email)} - ${escapeHtml(order.customer.phone || "brak telefonu")}</p>
            ${orderSummaryHtml(order)}
            ${order.notes ? `<p><strong>Uwagi:</strong> ${escapeHtml(order.notes)}</p>` : ""}
            <p><a href="${siteUrl()}/admin/zamowienia/${order.id}">Otwórz w panelu</a></p>
          </div>`,
      })
    );
  }

  await Promise.all(tasks);
}

export async function sendOrderShippedEmail(order) {
  const tracking = order.trackingNumber
    ? `<p>Numer przesyłki: <strong>${escapeHtml(order.trackingNumber)}</strong></p>`
    : "";
  await send({
    to: order.customer.email,
    subject: `Zamówienie ${order.number} zostało wysłane`,
    replyTo: process.env.SHOP_NOTIFY_EMAIL,
    html: `
      <div style="font-family:Arial,sans-serif;color:#14140F">
        <h2>Twoje zamówienie jest w drodze</h2>
        <p>Zamówienie ${escapeHtml(order.number)} zostało wysłane (${escapeHtml(deliveryText(order))}).</p>
        ${tracking}
        <p style="font-size:13px;color:#555">Klub Wysokogórski w Poznaniu</p>
      </div>`,
  });
}
