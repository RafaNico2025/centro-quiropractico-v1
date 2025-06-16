import { sendEmailNotification } from '../../services/notification.service.js';

/**
 * @swagger
 * /contact:
 *   post:
 *     summary: Enviar mensaje de contacto
 *     tags: [Contacto]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - email
 *               - mensaje
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: Nombre completo del remitente
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Correo electrónico del remitente
 *               telefono:
 *                 type: string
 *                 description: Número de teléfono del remitente (opcional)
 *               mensaje:
 *                 type: string
 *                 description: Contenido del mensaje
 *     responses:
 *       200:
 *         description: Mensaje enviado exitosamente
 *       400:
 *         description: Error en la solicitud
 *       500:
 *         description: Error del servidor
 */
const sendContactMessage = async (req, res) => {
  try {
    const { nombre, email, telefono, mensaje } = req.body;

    // Validar campos requeridos
    if (!nombre || !email || !mensaje) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    // Crear el template del email
    const emailTemplate = {
      subject: 'Nuevo mensaje de contacto',
      html: `
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #f8f9fa; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
            .content { background: #fff; padding: 20px; border-radius: 5px; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>Nuevo mensaje de contacto</h2>
            </div>
            <div class="content">
              <p><strong>De:</strong> ${nombre}</p>
              <p><strong>Email:</strong> ${email}</p>
              ${telefono ? `<p><strong>Teléfono:</strong> ${telefono}</p>` : ''}
              <p><strong>Mensaje:</strong></p>
              <p>${mensaje}</p>
            </div>
            <div class="footer">
              <p>Este mensaje fue enviado desde el formulario de contacto del sitio web.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    // Enviar notificación por email al centro quiropráctico
    const notificationResult = await sendEmailNotification(
      process.env.EMAIL_USER,
      emailTemplate.subject,
      emailTemplate.html
    );

    if (notificationResult.success) {
      res.status(200).json({ 
        message: 'Mensaje enviado exitosamente. Nos pondremos en contacto contigo pronto.',
        data: { nombre, email, telefono }
      });
    } else {
      console.error('Error al enviar mensaje:', notificationResult.error);
      res.status(500).json({ 
        error: 'Error al enviar el mensaje. Intenta nuevamente o contacta por WhatsApp.' 
      });
    }

  } catch (error) {
    console.error('Error al procesar mensaje de contacto:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export { sendContactMessage }; 