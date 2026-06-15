const nodemailer = require('nodemailer');

// In-memory rate limiting map: ip -> { count, firstRequestTime }
const rateLimitMap = new Map();
const LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 3;

// Helper to escape HTML characters
function escapeHTML(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

module.exports = async (req, res) => {
  // CORS Restriction
  const origin = req.headers.origin;
  const allowedOrigins = [
    'https://tzndesign.com',
    'https://www.tzndesign.com'
  ];
  let isAllowed = false;
  if (origin) {
    if (allowedOrigins.includes(origin) || /^http:\/\/localhost(:\d+)?$/.test(origin)) {
      isAllowed = true;
    }
  }

  res.setHeader('Access-Control-Allow-Credentials', true);
  if (isAllowed) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else if (origin) {
    console.warn(`[CORS Blocked] Origin not allowed: ${origin}`);
    return res.status(403).json({ error: 'CORS no permitido' });
  }

  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Accept'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 1. Server-side Honeypot Check
  const honeypotFields = ['website', 'company', 'title', 'description', 'feedback', 'notes', 'details', 'remarks', 'comments'];
  
  // Check top-level fields
  for (const field of honeypotFields) {
    if (req.body[field]) {
      console.warn(`[Bot Detected] Honeypot field "${field}" was filled.`);
      return res.status(200).json({ success: true, message: 'Correo enviado correctamente' });
    }
  }
  
  // Check the honeypots object sent from frontend
  if (req.body.honeypots && typeof req.body.honeypots === 'object') {
    const hp = req.body.honeypots;
    const allHpFields = [...honeypotFields, 'message', 'subject'];
    for (const field of allHpFields) {
      if (hp[field]) {
        console.warn(`[Bot Detected] Honeypot payload field "${field}" was filled.`);
        return res.status(200).json({ success: true, message: 'Correo enviado correctamente' });
      }
    }
  }

  // 2. Timestamp Anti-Bot Check (using clock-sync-proof client duration)
  const { _submissionDuration } = req.body;
  if (_submissionDuration !== undefined) {
    const duration = parseInt(_submissionDuration, 10);
    if (isNaN(duration) || duration < 3000) {
      console.warn(`[Bot Detected] Form submitted too fast: client duration ${duration}ms`);
      return res.status(200).json({ success: true, message: 'Correo enviado correctamente' });
    }
  } else {
    // If submission duration is missing, it's probably not our frontend
    console.warn(`[Bot Detected] Missing _submissionDuration`);
    return res.status(200).json({ success: true, message: 'Correo enviado correctamente' });
  }

  // 3. Rate Limiting by IP
  let ip = req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
  if (ip && ip.includes(',')) {
    ip = ip.split(',')[0].trim();
  }

  const now = Date.now();
  
  // Clean up expired rate limits in map to avoid leak
  for (const [key, value] of rateLimitMap.entries()) {
    if (now - value.firstRequestTime > LIMIT_WINDOW_MS) {
      rateLimitMap.delete(key);
    }
  }

  const limitInfo = rateLimitMap.get(ip) || { count: 0, firstRequestTime: now };
  
  if (now - limitInfo.firstRequestTime > LIMIT_WINDOW_MS) {
    limitInfo.count = 0;
    limitInfo.firstRequestTime = now;
  }

  if (limitInfo.count >= MAX_REQUESTS) {
    const remainingMs = LIMIT_WINDOW_MS - (now - limitInfo.firstRequestTime);
    const remainingMinutes = Math.ceil(remainingMs / (60 * 1000));
    console.warn(`[Rate Limit Exceeded] IP: ${ip}. Blocked for ${remainingMinutes} min.`);
    return res.status(429).json({
      error: `Demasiados envíos. Por favor, intentá de nuevo en ${remainingMinutes} minutos.`
    });
  }

  // 4. Input Parsing and Validation
  const { name, email, subject, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Faltan campos requeridos (nombre, email, mensaje)' });
  }

  let cleanName = name.trim();
  let cleanEmail = email.trim();
  let cleanSubject = (subject || '').trim();
  let cleanMessage = message.trim();

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail)) {
    return res.status(400).json({ error: 'El email proporcionado no tiene un formato válido.' });
  }

  // Enforce Max Lengths
  if (cleanName.length > 100) cleanName = cleanName.substring(0, 100);
  if (cleanEmail.length > 254) cleanEmail = cleanEmail.substring(0, 254);
  if (cleanSubject.length > 200) cleanSubject = cleanSubject.substring(0, 200);
  if (cleanMessage.length > 5000) cleanMessage = cleanMessage.substring(0, 5000);

  // HTML Escaping for Email Template
  const escapedName = escapeHTML(cleanName);
  const escapedEmail = escapeHTML(cleanEmail);
  const escapedSubject = escapeHTML(cleanSubject || 'Sin asunto especificado');
  const escapedMessage = escapeHTML(cleanMessage).replace(/\r?\n/g, '<br />');

  // Increment rate limit count before executing email transport
  limitInfo.count++;
  rateLimitMap.set(ip, limitInfo);

  // Validate environment credentials
  if (!process.env.LARK_SMTP_USER || !process.env.LARK_SMTP_PASSWORD) {
    console.error('Falta configurar las variables de entorno LARK_SMTP_USER o LARK_SMTP_PASSWORD en Vercel.');
    return res.status(500).json({ error: 'Error de configuración del servidor' });
  }

  // Configurar el transportador de correo para Lark Suite (SMTP)
  const transporter = nodemailer.createTransport({
    host: 'smtp.larksuite.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.LARK_SMTP_USER,
      pass: process.env.LARK_SMTP_PASSWORD,
    },
  });

  const mailOptions = {
    from: `"${cleanName} (Contacto Web)" <${process.env.LARK_SMTP_USER}>`,
    replyTo: cleanEmail,
    to: 'tescuchamos@tzndesign.com',
    subject: cleanSubject ? `Contacto Web: ${cleanSubject}` : `Nuevo mensaje de contacto de ${cleanName}`,
    text: `Nombre: ${cleanName}\nEmail: ${cleanEmail}\n\nMensaje:\n${cleanMessage}`,
    html: `
      <div style="font-family: sans-serif; padding: 20px; color: #111; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px;">
        <h2 style="border-bottom: 2px solid #ed6c46; padding-bottom: 10px; color: #ed6c46;">Nuevo Mensaje de Contacto</h2>
        <p><strong>Nombre:</strong> ${escapedName}</p>
        <p><strong>Email:</strong> <a href="mailto:${escapedEmail}">${escapedEmail}</a></p>
        <p><strong>Asunto:</strong> ${escapedSubject}</p>
        <div style="background-color: #f7f7f7; padding: 15px; border-radius: 5px; margin-top: 15px;">
          <p style="margin: 0; line-height: 1.6;">${escapedMessage}</p>
        </div>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #888; text-align: center;">Este correo fue enviado automáticamente desde el formulario de contacto de tzndesign.com</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return res.status(200).json({ success: true, message: 'Correo enviado correctamente' });
  } catch (error) {
    console.error('Error al enviar correo por SMTP de Lark:', error);
    return res.status(500).json({ error: 'Error al enviar el correo electrónico', details: error.message });
  }
};
