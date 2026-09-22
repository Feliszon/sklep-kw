const SANDBOX_BASE_URL = "https://sandbox.przelewy24.pl";
const PRODUCTION_BASE_URL = "https://secure.przelewy24.pl";

function getConfig() {
  const isProduction = (process.env.P24_ENV || "sandbox").toLowerCase() === "production";

  return {
    isProduction,
    baseUrl: isProduction ? PRODUCTION_BASE_URL : SANDBOX_BASE_URL,
    merchantId: Number(process.env.P24_MERCHANT_ID),
    posId: Number(process.env.P24_POS_ID || process.env.P24_MERCHANT_ID),
    apiKey: process.env.P24_API_KEY || "",
    crcKey: process.env.P24_CRC_KEY || "",
    frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
    webhookUrl: process.env.P24_WEBHOOK_URL || "",
  };
}

module.exports = { getConfig };
