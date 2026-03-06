type WhatsAppTemplateComponent = {
  type: 'body'
  parameters: { type: 'text'; text: string }[]
}

type WhatsAppTemplateMessage = {
  messaging_product: 'whatsapp'
  to: string
  type: 'template'
  template: {
    name: string
    language: { code: string }
    components: WhatsAppTemplateComponent[]
  }
}

type WhatsAppTextMessage = {
  messaging_product: 'whatsapp'
  to: string
  type: 'text'
  text: { preview_url: boolean; body: string }
}

function requireEnv(name: string) {
  const v = process.env[name]
  if (!v) throw new Error(`Missing env var: ${name}`)
  return v
}

function normalizePhone(phone: string) {
  // Expect E.164 without +, e.g. 919999999999
  return phone.replace(/[^\d]/g, '')
}

async function sendMessage(payload: WhatsAppTemplateMessage | WhatsAppTextMessage) {
  const token = requireEnv('WA_ACCESS_TOKEN')
  const phoneNumberId = requireEnv('WA_PHONE_NUMBER_ID')
  const url = `https://graph.facebook.com/v22.0/${phoneNumberId}/messages`

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `WhatsApp send failed: ${res.status}`)
  }
  return await res.json()
}

export async function sendOrderNotificationToBusiness(message: string) {
  const to = requireEnv('WA_BUSINESS_NOTIFY_TO')
  const normalized = normalizePhone(to)
  return await sendMessage({
    messaging_product: 'whatsapp',
    to: normalized,
    type: 'text',
    text: { preview_url: false, body: message },
  })
}

export async function sendReceiptToCustomer(opts: { to: string; variables: string[] }) {
  const normalized = normalizePhone(opts.to)

  const templateName = process.env.WA_RECEIPT_TEMPLATE_NAME
  if (!templateName) {
    // Fallback: plain text (may only deliver within the 24h customer service window)
    return await sendMessage({
      messaging_product: 'whatsapp',
      to: normalized,
      type: 'text',
      text: { preview_url: false, body: opts.variables.filter(Boolean).join('\n') },
    })
  }

  return await sendMessage({
    messaging_product: 'whatsapp',
    to: normalized,
    type: 'template',
    template: {
      name: templateName,
      language: { code: 'en' },
      components: [
        {
          type: 'body',
          parameters: opts.variables.map((text) => ({ type: 'text', text })),
        },
      ],
    },
  })
}

