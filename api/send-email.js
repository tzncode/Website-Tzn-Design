const nodemailer = require('nodemailer');

module.exports = async (req, res) => {
  // Manejo de CORS (opcional si es consumido solo por el mismo dominio, pero útil para Vercel)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, subject, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Faltan campos requeridos (nombre, email, mensaje)' });
  }

  // Validar credenciales de entorno
  if (!process.env.LARK_SMTP_USER || !process.env.LARK_SMTP_PASSWORD) {
    console.error('Falta configurar las variables de entorno LARK_SMTP_USER o LARK_SMTP_PASSWORD en Vercel.');
    return res.status(500).json({ error: 'Error de configuración del servidor' });
  }

  // Configurar el transportador de correo para Lark Suite (SMTP)
  const transporter = nodemailer.createTransport({
    host: 'smtp.larksuite.com',
    port: 465,
    secure: true, // usar SSL en puerto 465
    auth: {
      user: process.env.LARK_SMTP_USER,
      pass: process.env.LARK_SMTP_PASSWORD,
    },
  });

  const mailOptions = {
    from: `"${name} (Contacto Web)" <${process.env.LARK_SMTP_USER}>`, // El remitente debe ser el email autenticado para pasar el filtro de Lark
    replyTo: email, // Permite que al dar "Responder" se responda al remitente original (cliente)
    to: 'tescuchamos@tzndesign.com',
    subject: subject ? `Contacto Web: ${subject}` : `Nuevo mensaje de contacto de ${name}`,
    text: `Nombre: ${name}\nEmail: ${email}\n\nMensaje:\n${message}`,
    html: `
      <div style="font-family: sans-serif; padding: 20px; color: #111; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px;">
        <h2 style="border-bottom: 2px solid #ed6c46; padding-bottom: 10px; color: #ed6c46;">Nuevo Mensaje de Contacto</h2>
        <p><strong>Nombre:</strong> ${name}</p>
        <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
        <p><strong>Asunto:</strong> ${subject || 'Sin asuntoSpecified'}</p>
        <div style="background-color: #f7f7f7; padding: 15px; border-radius: 5px; margin-top: 15px;">
          <p style="margin: 0; white-space: pre-wrap; line-height: 1.6;">${message}</p>
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
