import nodemailer from 'nodemailer';
import axios from 'axios';
import 'dotenv/config';

// Configuración de WhatsApp Cloud API
const WHATSAPP_API_URL = 'https://graph.facebook.com/v17.0';
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;

// Configuración de Nodemailer para Email
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  },
  // Configuraciones anti-spam
  pool: true,
  maxConnections: 1,
  rateDelta: 20000, // 20 segundos entre emails
  rateLimit: 5 // máximo 5 emails por rateDelta
});

// Verificar configuración de email al iniciar
const verifyEmailConfig = async () => {
  try {
    await transporter.verify();
    console.log('✅ Configuración de email verificada correctamente');
  } catch (error) {
    console.warn('⚠️ Error en configuración de email:', error.message);
  }
};

// Verificar al importar el módulo
verifyEmailConfig();

// Templates de email
const emailTemplates = {
  appointmentConfirmation: (appointment, patient, professional) => ({
    subject: '✅ Confirmación de Turno - Centro Quiropráctico',
    html: `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Confirmación de Turno</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
          .appointment-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
          .detail-row:last-child { border-bottom: none; }
          .label { font-weight: bold; color: #555; }
          .value { color: #333; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 14px; }
          .btn { display: inline-block; background: #007bff; color: black !important; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin: 10px 5px; font-weight: bold; font-size: 16px; box-shadow: 0 2px 6px rgba(0,123,255,0.3); transition: background-color 0.3s; }
          .btn:hover { background: #0056b3; color: black !important; }
          .btn-secondary { background: #28a745; color: black !important; box-shadow: 0 2px 6px rgba(40,167,69,0.3); }
          .btn-secondary:hover { background: #1e7e34; color: black !important; }
          .highlight { background: #e7f3ff; padding: 15px; border-left: 4px solid #007bff; border-radius: 4px; margin: 15px 0; }
          .personal { background: #fff3cd; padding: 10px; border-radius: 4px; margin: 10px 0; font-style: italic; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🏥 Centro Quiropráctico</h1>
          <h2>Confirmación de Turno</h2>
        </div>
        
        <div class="content">
          <p>Estimado/a <strong>${patient.firstName} ${patient.lastName}</strong>,</p>
          
          <div class="personal">
            Nos complace confirmar que hemos recibido su solicitud de turno. Nuestro equipo profesional está preparado para brindarle la mejor atención.
          </div>
          
          <p>Su turno ha sido <strong>confirmado</strong> exitosamente. Aquí están los detalles:</p>
          
          <div class="appointment-details">
            <div class="detail-row">
              <span class="label">📅 Fecha:</span>
              <span class="value">${new Date(appointment.date).toLocaleDateString('es-ES', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
            </div>
            <div class="detail-row">
              <span class="label">🕐 Hora:</span>
              <span class="value">${appointment.startTime} - ${appointment.endTime}</span>
            </div>
            <div class="detail-row">
              <span class="label">👨‍⚕️ Profesional:</span>
              <span class="value">Dr. ${professional.name} ${professional.lastName}</span>
            </div>
            ${appointment.reason ? `
            <div class="detail-row">
              <span class="label">📋 Motivo:</span>
              <span class="value">${appointment.reason}</span>
            </div>
            ` : ''}
          </div>

          <div class="highlight">
            <strong>💡 Recordatorio importante:</strong> Por favor llegue 10 minutos antes de su cita para completar cualquier documentación necesaria. Si necesita cancelar o reprogramar, le pedimos que nos contacte con al menos 24 horas de anticipación para poder ofrecer el horario a otros pacientes.
          </div>

          <div class="personal">
            Su bienestar es nuestra prioridad. Si tiene alguna pregunta antes de su cita, no dude en contactarnos. Estamos aquí para ayudarle.
          </div>

          <div style="text-align: center; margin: 20px 0;">
            <a href="tel:+5491123456789" class="btn">📞 Contactar por Teléfono</a>
            <a href="mailto:${process.env.EMAIL_USER}" class="btn btn-secondary">✉️ Enviar Consulta</a>
          </div>
        </div>

        <div class="footer">
          <p><strong>Centro Quiropráctico</strong></p>
          <p>Cuidando su salud con profesionalismo y dedicación</p>
          <p>Dirección del centro | Teléfono: +54 911 234 5678</p>
          <p style="font-size: 12px; color: #999;">
            Este email fue enviado a ${patient.email} porque solicitó un turno en nuestro centro.
            Si no debería recibir estos emails, contáctenos.
          </p>
        </div>
      </body>
      </html>
    `
  }),

  appointmentReminder: (appointment, patient, professional) => ({
    subject: '🔔 Recordatorio de Turno - Mañana',
    html: `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Recordatorio de Turno</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ff9a56 0%, #ff6b6b 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
          .appointment-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
          .detail-row:last-child { border-bottom: none; }
          .label { font-weight: bold; color: #555; }
          .value { color: #333; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 14px; }
          .btn { display: inline-block; background: #007bff; color: black !important; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin: 10px 5px; font-weight: bold; font-size: 16px; box-shadow: 0 2px 6px rgba(0,123,255,0.3); transition: background-color 0.3s; }
          .btn:hover { background: #0056b3; color: black !important; }
          .btn-cancel { background: #dc3545; color: black !important; }
          .alert { background: #fff3cd; border: 1px solid #ffeaa7; color: #856404; padding: 15px; border-radius: 4px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🔔 Recordatorio de Turno</h1>
          <h2>Su cita es mañana</h2>
        </div>
        
        <div class="content">
          <p>Estimado/a <strong>${patient.firstName} ${patient.lastName}</strong>,</p>
          
          <p>Le recordamos que tiene una cita programada para <strong>mañana</strong>:</p>
          
          <div class="appointment-details">
            <div class="detail-row">
              <span class="label">📅 Fecha:</span>
              <span class="value">${new Date(appointment.date).toLocaleDateString('es-ES', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
            </div>
            <div class="detail-row">
              <span class="label">🕐 Hora:</span>
              <span class="value">${appointment.startTime} - ${appointment.endTime}</span>
            </div>
            <div class="detail-row">
              <span class="label">👨‍⚕️ Profesional:</span>
              <span class="value">Dr. ${professional.name} ${professional.lastName}</span>
            </div>
          </div>

          <div class="alert">
            <strong>⏰ Importante:</strong> Por favor llegue 10 minutos antes de su cita. Si no puede asistir, cancele con al menos 2 horas de anticipación.
          </div>

          <div style="text-align: center; margin: 20px 0;">
            <a href="tel:+5491123456789" class="btn">📞 Confirmar por Teléfono</a>
            <a href="tel:+5491123456789" class="btn btn-cancel">❌ Cancelar Turno</a>
          </div>
        </div>

        <div class="footer">
          <p><strong>Centro Quiropráctico</strong></p>
          <p>¡Esperamos verle pronto!</p>
        </div>
      </body>
      </html>
    `
  }),

  appointmentCancellation: (appointment, patient, professional, reason) => ({
    subject: '❌ Turno Cancelado - Centro Quiropráctico',
    html: `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Turno Cancelado</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
          .appointment-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
          .detail-row:last-child { border-bottom: none; }
          .label { font-weight: bold; color: #555; }
          .value { color: #333; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 14px; }
          .btn { display: inline-block; background: #007bff; color: black !important; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin: 10px 5px; font-weight: bold; font-size: 16px; box-shadow: 0 2px 6px rgba(0,123,255,0.3); transition: background-color 0.3s; }
          .btn:hover { background: #0056b3; color: black !important; }
          .btn-secondary { background: #28a745; color: black !important; box-shadow: 0 2px 6px rgba(40,167,69,0.3); }
          .btn-secondary:hover { background: #1e7e34; color: black !important; }
          .info { background: #d1ecf1; border: 1px solid #bee5eb; color: #0c5460; padding: 15px; border-radius: 4px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>❌ Turno Cancelado</h1>
        </div>
        
        <div class="content">
          <p>Estimado/a <strong>${patient.firstName} ${patient.lastName}</strong>,</p>
          
          <p>Le informamos que su turno ha sido <strong>cancelado</strong>:</p>
          
          <div class="appointment-details">
            <div class="detail-row">
              <span class="label">📅 Fecha:</span>
              <span class="value">${new Date(appointment.date).toLocaleDateString('es-ES', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
            </div>
            <div class="detail-row">
              <span class="label">🕐 Hora:</span>
              <span class="value">${appointment.startTime} - ${appointment.endTime}</span>
            </div>
            <div class="detail-row">
              <span class="label">👨‍⚕️ Profesional:</span>
              <span class="value">Dr. ${professional.name} ${professional.lastName}</span>
            </div>
            ${reason ? `
            <div class="detail-row">
              <span class="label">📝 Motivo de cancelación:</span>
              <span class="value">${reason}</span>
            </div>
            ` : ''}
          </div>

          <div class="info">
            <strong>💡 ¿Desea reagendar?</strong> Contáctenos para programar un nuevo turno en el horario que mejor le convenga.
          </div>

          <div style="text-align: center; margin: 20px 0;">
            <a href="tel:+5491123456789" class="btn">📞 Reagendar mi Turno</a>
          </div>
        </div>

        <div class="footer">
          <p><strong>Centro Quiropráctico</strong></p>
          <p>Lamentamos cualquier inconveniente causado.</p>
        </div>
      </body>
      </html>
    `
  })
};

export const sendWhatsAppNotification = async (to, message) => {
  try {
    if (!WHATSAPP_PHONE_NUMBER_ID || !WHATSAPP_TOKEN) {
      console.warn('⚠️ WhatsApp no configurado, saltando notificación WhatsApp');
      return { success: false, error: 'WhatsApp no configurado' };
    }

    const response = await axios.post(
      `${WHATSAPP_API_URL}/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to: to,
        type: "text",
        text: { body: message }
      },
      {
        headers: {
          'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return { success: true, messageId: response.data.messages[0].id };
  } catch (error) {
    console.error('Error al enviar WhatsApp:', error.response?.data || error.message);
    return { success: false, error: error.response?.data || error.message };
  }
};

export const sendEmailNotification = async (to, subject, html) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.warn('⚠️ Email no configurado, saltando notificación email');
      return { success: false, error: 'Email no configurado' };
    }

    const info = await transporter.sendMail({
      from: `"Centro Quiropráctico" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      // Headers anti-spam
      headers: {
        'X-Mailer': 'Centro Quiropráctico v1.0',
        'X-Priority': '3',
        'X-MSMail-Priority': 'Normal',
        'Importance': 'Normal',
        'List-Unsubscribe': `<mailto:${process.env.EMAIL_USER}?subject=Unsubscribe>`,
        'Return-Path': process.env.EMAIL_USER
      },
      // Configuración adicional
      text: html.replace(/<[^>]*>/g, ''), // Version texto plano
      replyTo: process.env.EMAIL_USER
    });
    
    console.log('✅ Email enviado:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error al enviar email:', error.message);
    return { success: false, error: error.message };
  }
};

// Función principal para enviar notificación de cita creada
export const sendAppointmentNotification = async (appointment, patient, professional = null) => {
  try {
    console.log('📧 Enviando notificación de cita...', {
      patientEmail: patient.email,
      patientPhone: patient.phone,
      appointmentDate: appointment.date
    });

    // Si no tenemos el profesional, intentar obtenerlo
    if (!professional && appointment.professionalId) {
      const { Users } = await import('../database/connection.database.js');
      professional = await Users.findByPk(appointment.professionalId, {
        attributes: ['id', 'name', 'lastName', 'email']
      });
    }

    // Template de confirmación
    const emailTemplate = emailTemplates.appointmentConfirmation(appointment, patient, professional || { name: 'No asignado', lastName: '' });
    
    // Mensaje de WhatsApp simplificado
    const whatsappMessage = `
🏥 *Centro Quiropráctico*
✅ *Turno Confirmado*

👤 Paciente: ${patient.firstName} ${patient.lastName}
📅 Fecha: ${new Date(appointment.date).toLocaleDateString('es-ES')}
🕐 Hora: ${appointment.startTime}
👨‍⚕️ Profesional: Dr. ${professional?.name || 'No asignado'} ${professional?.lastName || ''}

💡 Llegue 10 minutos antes de su cita.
📞 Para cancelar/reprogramar: +54 911 234 5678
    `.trim();

    // Enviar notificaciones en paralelo
    const [emailResult, whatsappResult] = await Promise.allSettled([
      patient.email ? sendEmailNotification(patient.email, emailTemplate.subject, emailTemplate.html) : Promise.resolve({ success: false, error: 'Sin email' }),
      patient.phone ? sendWhatsAppNotification(patient.phone, whatsappMessage) : Promise.resolve({ success: false, error: 'Sin teléfono' })
    ]);

    const results = {
      email: emailResult.status === 'fulfilled' ? emailResult.value : { success: false, error: emailResult.reason },
      whatsapp: whatsappResult.status === 'fulfilled' ? whatsappResult.value : { success: false, error: whatsappResult.reason }
    };

    console.log('📊 Resultados de notificación:', results);
    return results;

  } catch (error) {
    console.error('❌ Error en sendAppointmentNotification:', error);
    return {
      email: { success: false, error: error.message },
      whatsapp: { success: false, error: error.message }
    };
  }
};

// Función para enviar recordatorio
export const sendAppointmentReminder = async (appointment, patient, professional) => {
  try {
    const emailTemplate = emailTemplates.appointmentReminder(appointment, patient, professional);
    
    const whatsappMessage = `
🔔 *Recordatorio de Turno*

👤 ${patient.firstName} ${patient.lastName}
📅 MAÑANA: ${new Date(appointment.date).toLocaleDateString('es-ES')}
🕐 Hora: ${appointment.startTime}

💡 No olvide llegar 10 minutos antes.
📞 +54 911 234 5678
    `.trim();

    const [emailResult, whatsappResult] = await Promise.allSettled([
      patient.email ? sendEmailNotification(patient.email, emailTemplate.subject, emailTemplate.html) : Promise.resolve({ success: false, error: 'Sin email' }),
      patient.phone ? sendWhatsAppNotification(patient.phone, whatsappMessage) : Promise.resolve({ success: false, error: 'Sin teléfono' })
    ]);

    return {
      email: emailResult.status === 'fulfilled' ? emailResult.value : { success: false, error: emailResult.reason },
      whatsapp: whatsappResult.status === 'fulfilled' ? whatsappResult.value : { success: false, error: whatsappResult.reason }
    };

  } catch (error) {
    console.error('❌ Error en sendAppointmentReminder:', error);
    return {
      email: { success: false, error: error.message },
      whatsapp: { success: false, error: error.message }
    };
  }
};

// Función para enviar notificación de cancelación
export const sendAppointmentCancellation = async (appointment, patient, professional, reason = null) => {
  try {
    const emailTemplate = emailTemplates.appointmentCancellation(appointment, patient, professional, reason);
    
    const whatsappMessage = `
❌ *Turno Cancelado*

👤 ${patient.firstName} ${patient.lastName}
📅 Fecha: ${new Date(appointment.date).toLocaleDateString('es-ES')}
🕐 Hora: ${appointment.startTime}

${reason ? `📝 Motivo: ${reason}` : ''}

💡 Para reagendar: +54 911 234 5678
    `.trim();

    const [emailResult, whatsappResult] = await Promise.allSettled([
      patient.email ? sendEmailNotification(patient.email, emailTemplate.subject, emailTemplate.html) : Promise.resolve({ success: false, error: 'Sin email' }),
      patient.phone ? sendWhatsAppNotification(patient.phone, whatsappMessage) : Promise.resolve({ success: false, error: 'Sin teléfono' })
    ]);

    return {
      email: emailResult.status === 'fulfilled' ? emailResult.value : { success: false, error: emailResult.reason },
      whatsapp: whatsappResult.status === 'fulfilled' ? whatsappResult.value : { success: false, error: whatsappResult.reason }
    };

  } catch (error) {
    console.error('❌ Error en sendAppointmentCancellation:', error);
    return {
      email: { success: false, error: error.message },
      whatsapp: { success: false, error: error.message }
    };
  }
}; 