import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function sendSMS(phone: string, message: string, channel: string = "sms") {
  let provider = process.env.PRIMARY_SMS_PROVIDER || "SMART_SMS";
  let waProvider = process.env.WHATSAPP_PROVIDER || "FREE_WHATSAPP";

  try {
    const dbSettings = await prisma.setting.findMany();
    dbSettings.forEach(s => {
      if (s.key === 'primarySmsProvider') provider = s.value;
      if (s.key === 'primaryWhatsAppProvider') waProvider = s.value;
    });
  } catch (e) {
    console.log("Failed to load settings from DB, using env variables", e);
  }

  // If WhatsApp is requested, route to the configured WhatsApp provider
  if (channel === "whatsapp") {
    if (waProvider === "FREE_WHATSAPP") {
      return sendViaFreeWhatsApp(phone, message);
    }
    if (waProvider === "SENDCHAMP") {
      return sendViaSendchamp(phone, message);
    }
    return sendViaTermii(phone, message, "whatsapp");
  }

  if (provider === "SMART_SMS") {
    return sendViaSmartSMS(phone, message);
  } else if (provider === "TERMII") {
    return sendViaTermii(phone, message, "generic");
  }

  throw new Error("Invalid SMS provider configured.");
}

async function sendViaSmartSMS(phone: string, message: string) {
  const token = process.env.SMART_SMS_TOKEN;
  let sender = process.env.SMART_SMS_SENDER || "OKMovement";
  if (sender === "OK_MOVEMENT") sender = "OKMovement"; // Bypass MTN spam filter

  if (!token || token === "your_smart_sms_token") {
    console.error("[SMART_SMS ERROR] Token is missing or invalid in environment variables.");
    return { success: false, provider: "SMART_SMS", error: "SMS Provider misconfigured on server" };
  }

  try {
    const response = await fetch("https://app.smartsmssolutions.com/io/api/client/v1/sms/", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        token: token,
        sender: sender,
        to: phone,
        message: message,
        type: "0",
        routing: "4"
      })
    });

    const data = await response.json();
    return { success: data.code === "1000" || data.successful === true, provider: "SMART_SMS", data };
  } catch (error) {
    console.error("Smart SMS Error:", error);
    return { success: false, provider: "SMART_SMS", error };
  }
}

async function sendViaTermii(phone: string, message: string, channelType: string = "generic") {
  const apiKey = process.env.TERMII_API_KEY;
  // Termii strictly requires approved sender IDs. "N-Alert" is their default, universally approved OTP sender ID.
  const sender = process.env.TERMII_SENDER_ID || "N-Alert";

  if (!apiKey || apiKey === "your_termii_api_key") {
    console.error(`[TERMII ERROR] API Key missing.`);
    return { success: false, provider: "TERMII", error: "Termii API Key missing" };
  }

  // Termii requires international format without the + sign
  let formattedPhone = phone;
  if (formattedPhone.startsWith('0')) {
    formattedPhone = '234' + formattedPhone.substring(1);
  } else if (formattedPhone.startsWith('+')) {
    formattedPhone = formattedPhone.substring(1);
  }

  try {
    const response = await fetch("https://api.ng.termii.com/api/sms/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: formattedPhone,
        from: sender,
        sms: message,
        type: "plain",
        channel: channelType, // "whatsapp" or "generic"
        api_key: apiKey,
      })
    });

    const data = await response.json();
    
    if (data.status === 422 || data.message !== "Successfully Sent") {
      console.error(`[TERMII REJECTED] Termii blocked the message:`, data);
      return { success: false, provider: "TERMII", error: data.message || data.error };
    }

    return { success: true, provider: "TERMII", data };
  } catch (error) {
    console.error("Termii Error:", error);
    return { success: false, provider: "TERMII", error: "Network error with Termii" };
  }
}

async function sendViaSendchamp(phone: string, message: string) {
  const apiKey = process.env.SENDCHAMP_PUBLIC_KEY;
  const sender = process.env.SENDCHAMP_SENDER || "Sendchamp";

  if (!apiKey || apiKey === "your_sendchamp_api_key") {
    console.error(`[SENDCHAMP ERROR] API Key missing.`);
    return { success: false, provider: "SENDCHAMP", error: "Sendchamp API Key missing" };
  }

  // Ensure 234 format without +
  let formattedPhone = phone;
  if (formattedPhone.startsWith('0')) {
    formattedPhone = '234' + formattedPhone.substring(1);
  } else if (formattedPhone.startsWith('+')) {
    formattedPhone = formattedPhone.substring(1);
  }

  try {
    const response = await fetch("https://api.sendchamp.com/api/v1/whatsapp/message/send", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        recipient: formattedPhone,
        message: message,
        sender: sender,
        type: "text"
      })
    });

    const data = await response.json();
    
    if (data.status === "success" || data.code === "200") {
      return { success: true, provider: "SENDCHAMP", data };
    } else {
      console.error(`[SENDCHAMP REJECTED] ${data.message || data.error}`);
      return { success: false, provider: "SENDCHAMP", error: data.message || data.error };
    }
  } catch (error) {
    console.error("Sendchamp Error:", error);
    return { success: false, provider: "SENDCHAMP", error: "Network error with Sendchamp" };
  }
}

async function sendViaFreeWhatsApp(phone: string, message: string) {
  try {
    const response = await fetch("https://whatsapp-bot-agqz.onrender.com/api/send-whatsapp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ phone, message }),
      signal: AbortSignal.timeout(5000)
    });

    const data = await response.json();
    
    if (data.success) {
      return { success: true, provider: "FREE_WHATSAPP", data };
    } else {
      console.error(`[FREE WHATSAPP ERROR] ${data.error}`);
      return { success: false, provider: "FREE_WHATSAPP", error: data.error };
    }
  } catch (error) {
    console.error("[FREE WHATSAPP SERVER DOWN] Is the microservice running on port 3005?");
    return { success: false, provider: "FREE_WHATSAPP", error: "Network error with Free WhatsApp microservice" };
  }
}
