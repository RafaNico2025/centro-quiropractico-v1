import nodemailer from 'nodemailer';
import axios from 'axios';
import 'dotenv/config';

// Configuración de WhatsApp Cloud API, si el cliente lo quiere activar, se debe configurar en el .env y descomentar el codigo

// const WHATSAPP_API_URL = 'https://graph.facebook.com/v17.0';
// const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
// const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;

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
              <span class="value">${appointment.startTime.slice(0, 5)} - ${appointment.endTime.slice(0, 5)}</span>
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
            <a href="tel:+5493537304294" class="btn">📞 Contactar por Teléfono</a>
            <a href="mailto:${process.env.EMAIL_USER}" class="btn btn-secondary">✉️ Enviar Consulta</a>
          </div>
        </div>

        <div class="footer">
          <p><strong>Centro Quiropráctico</strong></p>
          <p>Cuidando su salud con profesionalismo y dedicación</p>
          <p>Dirección del centro | Teléfono: +54 353 730 4294</p>
          <p style="font-size: 12px; color: #999;">
            Este email fue enviado a ${patient.email} porque solicitó un turno en nuestro centro.
            Si no debería recibir estos emails, contáctenos.
          </p>
        </div>
      </body>
      </html>
    `
  }),

  appointmentRescheduled: (appointment, patient, professional) => ({
    subject: '🔄 Turno Reagendado - Centro Quiropráctico',
    html: `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Turno Reagendado</title>
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
          .highlight { background: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; border-radius: 4px; margin: 15px 0; }
          .personal { background: #e7f3ff; padding: 10px; border-radius: 4px; margin: 10px 0; font-style: italic; }
          .important { background: #ffe6e6; padding: 15px; border-left: 4px solid #dc3545; border-radius: 4px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🏥 Centro Quiropráctico</h1>
          <h2>Turno Reagendado</h2>
        </div>
        
        <div class="content">
          <p>Estimado/a <strong>${patient.firstName} ${patient.lastName}</strong>,</p>
          
          <div class="important">
            <strong>🔄 Su turno ha sido reagendado</strong><br>
            Hemos modificado el horario de su cita. Por favor, tome nota de los nuevos detalles.
          </div>
          
          <p>Aquí están los <strong>nuevos detalles</strong> de su turno:</p>
          
          <div class="appointment-details">
            <div class="detail-row">
              <span class="label">📅 Nueva Fecha:</span>
              <span class="value">${new Date(appointment.date).toLocaleDateString('es-ES', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
            </div>
            <div class="detail-row">
              <span class="label">🕐 Nuevo Horario:</span>
              <span class="value">${appointment.startTime.slice(0, 5)} - ${appointment.endTime.slice(0, 5)}</span>
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
            <strong>⚠️ Importante:</strong> Por favor confirme que puede asistir en el nuevo horario. Si no puede asistir, le pedimos que nos contacte lo antes posible para poder ofrecer el horario a otros pacientes.
          </div>

          <div class="personal">
            Disculpe las molestias ocasionadas. Su bienestar sigue siendo nuestra prioridad y nos esforzamos por brindarle la mejor atención posible.
          </div>

          <div style="text-align: center; margin: 20px 0;">
            <a href="tel:+5493537304294" class="btn">📞 Confirmar Asistencia</a>
            <a href="mailto:${process.env.EMAIL_USER}" class="btn btn-secondary">✉️ Solicitar Cambio</a>
          </div>
        </div>

        <div class="footer">
          <p><strong>Centro Quiropráctico</strong></p>
          <p>Cuidando su salud con profesionalismo y dedicación</p>
          <p>Dirección del centro | Teléfono: +54 353 730 4294</p>
          <p style="font-size: 12px; color: #999;">
            Este email fue enviado a ${patient.email} porque su turno fue reagendado.
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
              <span class="value">${appointment.startTime.slice(0, 5)} - ${appointment.endTime.slice(0, 5)}</span>
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
            <a href="tel:+5493537304294" class="btn">📞 Confirmar por Teléfono</a>
            <a href="tel:+5493537304294" class="btn btn-cancel">❌ Cancelar Turno</a>
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
              <span class="value">${appointment.startTime.slice(0, 5)} - ${appointment.endTime.slice(0, 5)}</span>
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
            <a href="tel:+5493537304294" class="btn">📞 Reagendar mi Turno</a>
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
🕐 Hora: ${appointment.startTime.slice(0, 5)} - ${appointment.endTime.slice(0, 5)}
👨‍⚕️ Profesional: Dr. ${professional?.name || 'No asignado'} ${professional?.lastName || ''}

💡 Llegue 10 minutos antes de su cita.
📞 Para cancelar/reprogramar: +54 353 730 4294
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

// Función para enviar notificación de reagendado
export const sendAppointmentRescheduled = async (appointment, patient, professional = null) => {
  try {
    console.log('🔄 Enviando notificación de reagendado...', {
      patientEmail: patient.email,
      patientPhone: patient.phone,
      appointmentDate: appointment.date,
      appointmentStartTime: appointment.startTime,
      appointmentEndTime: appointment.endTime
    });

    // Si no tenemos el profesional, intentar obtenerlo
    if (!professional && appointment.professionalId) {
      const { Users } = await import('../database/connection.database.js');
      professional = await Users.findByPk(appointment.professionalId, {
        attributes: ['id', 'name', 'lastName', 'email']
      });
    }

    // Template de reagendado
    const emailTemplate = emailTemplates.appointmentRescheduled(appointment, patient, professional || { name: 'No asignado', lastName: '' });
    
    // Mensaje de WhatsApp para reagendado
    const whatsappMessage = `
🔄 *Turno Reagendado - Centro Quiropráctico*

👤 ${patient.firstName} ${patient.lastName}
📅 Nueva fecha: ${new Date(appointment.date).toLocaleDateString('es-ES')}
🕐 Nuevo horario: ${appointment.startTime.slice(0, 5)} - ${appointment.endTime.slice(0, 5)}
👨‍⚕️ Profesional: Dr. ${professional?.name || 'No asignado'} ${professional?.lastName || ''}

⚠️ Por favor confirme que puede asistir en el nuevo horario.
📞 Para confirmar o solicitar cambio: +54 353 730 4294
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

    console.log('📊 Resultados de notificación de reagendado:', results);
    return results;

  } catch (error) {
    console.error('❌ Error en sendAppointmentRescheduled:', error);
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
🕐 Hora: ${appointment.startTime.slice(0, 5)} - ${appointment.endTime.slice(0, 5)}

💡 No olvide llegar 10 minutos antes.
📞 +54 353 730 4294
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
🕐 Hora: ${appointment.startTime.slice(0, 5)} - ${appointment.endTime.slice(0, 5)}

${reason ? `📝 Motivo: ${reason}` : ''}

💡 Para reagendar: +54 353 730 4294
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

// Función para enviar solicitud de cita desde dashboard del paciente
export const sendAppointmentRequest = async (appointmentRequest) => {
  try {
    const { 
      motivo, 
      preferenciaDia, 
      preferenciaHora, 
      notas, 
      solicitadoPor, 
      emailSolicitante, 
      telefonoSolicitante,
      fechaSeleccionada,
      horarioSeleccionado,
      horariosSeleccionados,
      cantidadHorarios,
      tipoSolicitud
    } = appointmentRequest;
    
    // Procesar horarios para mostrar
    let horariosDisplay = '';
    if (horariosSeleccionados && Array.isArray(horariosSeleccionados)) {
      if (horariosSeleccionados.length === 1) {
        const horario = horariosSeleccionados[0];
        if (typeof horario === 'object' && horario.startTime && horario.endTime) {
          horariosDisplay = `${horario.startTime} - ${horario.endTime}`;
        } else {
          horariosDisplay = horario;
        }
      } else {
        horariosDisplay = horariosSeleccionados.map((h, index) => {
          if (typeof h === 'object' && h.startTime && h.endTime) {
            return `${index + 1}. ${h.startTime} - ${h.endTime}`;
          } else {
            return `${index + 1}. ${h}`;
          }
        }).join('<br>');
      }
    } else if (horarioSeleccionado) {
      horariosDisplay = horarioSeleccionado;
    }
    
    // Template de email para el centro quiropráctico
    const emailTemplate = {
      subject: `📋 Nueva Solicitud de Cita ${tipoSolicitud === 'horarios_especificos' ? `- ${cantidadHorarios} HORARIO${cantidadHorarios > 1 ? 'S' : ''} ESPECÍFICO${cantidadHorarios > 1 ? 'S' : ''} SOLICITADO${cantidadHorarios > 1 ? 'S' : ''}` : '- Dashboard Paciente'}`,
      html: `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Nueva Solicitud de Cita</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
            .request-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .detail-row { display: flex; justify-content: space-between; padding: 15px 0; border-bottom: 1px solid #eee; align-items: flex-start; }
            .detail-row:last-child { border-bottom: none; }
            .label { font-weight: bold; color: #555; min-width: 150px; }
            .value { color: #333; flex: 1; margin-left: 20px; }
            .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 14px; }
            .btn { display: inline-block; background: #007bff; color: white !important; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin: 10px 5px; font-weight: bold; font-size: 16px; }
            .urgent { background: #dc3545; color: white; padding: 15px; border-radius: 8px; margin: 15px 0; font-weight: bold; }
            .urgent-specific { background: #ff6b35; color: white; padding: 15px; border-radius: 8px; margin: 15px 0; font-weight: bold; }
            .patient-info { background: #e7f3ff; padding: 15px; border-left: 4px solid #007bff; border-radius: 4px; margin: 15px 0; }
            .specific-request { background: #fff9e6; border: 2px solid #ffc107; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .multiple-slots { background: #e8f5e8; border: 2px solid #28a745; padding: 20px; border-radius: 8px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>📋 Centro Quiropráctico</h1>
            <h2>Nueva Solicitud de Cita</h2>
          </div>
          
          <div class="content">
            ${tipoSolicitud === 'horarios_especificos' ? `
            <div class="urgent-specific">
              🎯 HORARIO${cantidadHorarios > 1 ? 'S' : ''} ESPECÍFICO${cantidadHorarios > 1 ? 'S' : ''}: El paciente seleccionó ${cantidadHorarios} horario${cantidadHorarios > 1 ? 's' : ''} disponible${cantidadHorarios > 1 ? 's' : ''} del sistema
            </div>
            
            <div class="specific-request">
              <h3>⭐ SOLICITUD CON HORARIO${cantidadHorarios > 1 ? 'S' : ''} ESPECÍFICO${cantidadHorarios > 1 ? 'S' : ''}</h3>
              <p><strong>📅 Fecha solicitada:</strong> ${new Date(fechaSeleccionada).toLocaleDateString('es-ES', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</p>
              <p><strong>🕐 Horario${cantidadHorarios > 1 ? 's' : ''} solicitado${cantidadHorarios > 1 ? 's' : ''}:</strong></p>
              <div style="margin-left: 20px; margin-top: 10px;">
                ${horariosDisplay}
              </div>
              <p style="color: #856404; font-weight: bold; margin-top: 15px;">
                ⚡ ACCIÓN PRIORITARIA: Estos horarios estaban disponibles cuando el paciente los seleccionó. 
                Revisar disponibilidad y confirmar lo antes posible.
              </p>
            </div>
            ` : `
            <div class="urgent">
              🚨 ACCIÓN REQUERIDA: Un paciente ha solicitado una cita desde el dashboard
            </div>
            `}
            
            <div class="patient-info">
              <h3>👤 Información del Solicitante:</h3>
              <p><strong>Nombre:</strong> ${solicitadoPor}</p>
              <p><strong>Email:</strong> ${emailSolicitante}</p>
              <p><strong>Teléfono:</strong> ${telefonoSolicitante}</p>
              <p><strong>Fecha de solicitud:</strong> ${new Date().toLocaleString('es-ES')}</p>
            </div>
            
            <h3>📋 Detalles de la Solicitud:</h3>
            <div class="request-details">
              <div class="detail-row">
                <span class="label">🩺 Motivo de Consulta:</span>
                <span class="value">${motivo}</span>
              </div>
              ${tipoSolicitud === 'horarios_especificos' ? `
              <div class="detail-row">
                <span class="label">📅 Fecha Específica:</span>
                <span class="value">${fechaSeleccionada} (${new Date(fechaSeleccionada).toLocaleDateString('es-ES', { weekday: 'long' })})</span>
              </div>
              <div class="detail-row">
                <span class="label">🕐 Horario${cantidadHorarios > 1 ? 's' : ''} Específico${cantidadHorarios > 1 ? 's' : ''}:</span>
                <span class="value">
                  <div style="margin-left: 0;">
                    ${horariosDisplay}
                  </div>
                </span>
              </div>
              ` : `
              <div class="detail-row">
                <span class="label">📅 Preferencia de Día:</span>
                <span class="value">${preferenciaDia}</span>
              </div>
              <div class="detail-row">
                <span class="label">🕐 Preferencia de Hora:</span>
                <span class="value">${preferenciaHora}</span>
              </div>
              `}
              ${notas ? `
              <div class="detail-row">
                <span class="label">📝 Notas Adicionales:</span>
                <span class="value">${notas}</span>
              </div>
              ` : ''}
            </div>

            <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h4>🎯 Próximos Pasos:</h4>
              <ol>
                <li>Revisar la disponibilidad según las preferencias del paciente</li>
                <li>Contactar al paciente por teléfono o email para confirmar</li>
                <li>Crear la cita en el sistema una vez confirmada</li>
                <li>Enviar confirmación al paciente</li>
              </ol>
            </div>

            <div style="text-align: center; margin: 20px 0;">
              <a href="tel:+5493537304294" class="btn">📞 Contactar por Teléfono</a>
              <a href="mailto:${emailSolicitante}?subject=Re: Solicitud de Cita&body=Estimado/a ${solicitadoPor},%0A%0AGracias por su solicitud de cita. Nos pondremos en contacto con usted para confirmar la fecha y hora.%0A%0ASaludos,%0ACentro Quiropráctico" class="btn">✉️ Responder por Email</a>
            </div>
          </div>

          <div class="footer">
            <p><strong>Centro Quiropráctico - Sistema de Gestión</strong></p>
            <p>Este email fue generado automáticamente desde el dashboard del paciente</p>
            <p>Fecha: ${new Date().toLocaleString('es-ES')}</p>
          </div>
        </body>
        </html>
      `
    };

    // Email de confirmación para el paciente
    const patientEmailTemplate = {
      subject: `✅ Solicitud de Cita Recibida ${tipoSolicitud === 'horarios_especificos' ? `- ${cantidadHorarios} Horario${cantidadHorarios > 1 ? 's' : ''} Específico${cantidadHorarios > 1 ? 's' : ''} Solicitado${cantidadHorarios > 1 ? 's' : ''}` : ''} - Centro Quiropráctico`,
      html: `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Solicitud Recibida</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
            .confirmation { background: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .specific-confirmation { background: #fff9e6; border: 2px solid #ffc107; color: #856404; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .next-steps { background: #fff3cd; border: 1px solid #ffeaa7; color: #856404; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .btn { display: inline-block; background: #28a745; color: white !important; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin: 10px 5px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🏥 Centro Quiropráctico</h1>
            <h2>Solicitud Recibida</h2>
          </div>
          
          <div class="content">
            <p>Estimado/a <strong>${solicitadoPor}</strong>,</p>
            
            ${tipoSolicitud === 'horarios_especificos' ? `
            <div class="specific-confirmation">
              <h3>🎯 ¡Solicitud con ${cantidadHorarios} horario${cantidadHorarios > 1 ? 's' : ''} específico${cantidadHorarios > 1 ? 's' : ''} recibida!</h3>
              <p>Hemos recibido su solicitud de cita con los horarios específicos que seleccionó:</p>
              <ul style="margin-left: 20px;">
                <li><strong>📅 Fecha solicitada:</strong> ${new Date(fechaSeleccionada).toLocaleDateString('es-ES', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</li>
                <li><strong>🕐 Horario${cantidadHorarios > 1 ? 's' : ''} solicitado${cantidadHorarios > 1 ? 's' : ''}:</strong></li>
                <div style="margin-left: 20px; margin-top: 5px;">
                  ${horariosDisplay}
                </div>
                <li><strong>🩺 Motivo:</strong> ${motivo}</li>
                ${notas ? `<li><strong>📝 Notas:</strong> ${notas}</li>` : ''}
              </ul>
              <p style="font-weight: bold; margin-top: 15px;">
                ⚡ <strong>Importante:</strong> Estos horarios estaban disponibles cuando usted los seleccionó. 
                Nos pondremos en contacto con usted en las próximas horas para confirmar la disponibilidad.
              </p>
            </div>
            ` : `
            <div class="confirmation">
              <h3>✅ ¡Su solicitud ha sido recibida exitosamente!</h3>
              <p>Hemos recibido su solicitud de cita con los siguientes detalles:</p>
              <ul>
                <li><strong>Motivo:</strong> ${motivo}</li>
                <li><strong>Preferencia de día:</strong> ${preferenciaDia}</li>
                <li><strong>Preferencia de hora:</strong> ${preferenciaHora}</li>
                ${notas ? `<li><strong>Notas:</strong> ${notas}</li>` : ''}
              </ul>
            </div>
            `}

            <div class="next-steps">
              <h4>📞 ¿Qué sigue ahora?</h4>
              ${tipoSolicitud === 'horarios_especificos' ? `
              <ol>
                <li><strong>Verificación rápida:</strong> Confirmaremos que los horarios siguen disponibles</li>
                <li><strong>Contacto prioritario:</strong> Nos comunicaremos con usted en las próximas 2-4 horas</li>
                <li><strong>Confirmación:</strong> Si están disponibles, confirmaremos su cita inmediatamente</li>
                <li><strong>Alternativas:</strong> Si no están disponibles, le ofreceremos horarios similares</li>
              </ol>
              ` : `
              <ol>
                <li>Revisaremos su solicitud y disponibilidad</li>
                <li>Nos contactaremos con usted en las próximas 24 horas</li>
                <li>Confirmaremos fecha y hora específica</li>
                <li>Le enviaremos la confirmación final</li>
              </ol>
              `}
            </div>

            <p>Si necesita contactarnos urgentemente o hacer cambios a su solicitud, puede:</p>

            <div style="text-align: center; margin: 20px 0;">
              <a href="https://wa.me/5493537304294?text=Hola,%20tengo%20una%20consulta%20sobre%20mi%20solicitud%20de%20cita" class="btn">📱 WhatsApp</a>
              <a href="tel:+5493537304294" class="btn">📞 Llamar</a>
            </div>

            <p style="margin-top: 20px;">Gracias por confiar en nosotros para su cuidado quiropráctico.</p>
            
            <p><strong>Equipo Centro Quiropráctico</strong></p>
          </div>
        </body>
        </html>
      `
    };

    // Enviar notificación al centro (email principal del sistema)
    const centerEmail = process.env.EMAIL_USER; // El email del centro
    const centerNotificationResult = await sendEmailNotification(
      centerEmail, 
      emailTemplate.subject, 
      emailTemplate.html
    );

    // Enviar confirmación al paciente
    const patientNotificationResult = await sendEmailNotification(
      emailSolicitante,
      patientEmailTemplate.subject,
      patientEmailTemplate.html
    );

    console.log('📧 Resultados solicitud de cita:', {
      centro: centerNotificationResult,
      paciente: patientNotificationResult
    });

    // Si al menos uno de los emails se envió exitosamente, consideramos éxito
    const success = centerNotificationResult.success || patientNotificationResult.success;

    return {
      success,
      centerNotification: centerNotificationResult,
      patientNotification: patientNotificationResult
    };

  } catch (error) {
    console.error('❌ Error en sendAppointmentRequest:', error);
    return {
      success: false,
      error: error.message
    };
  }
}; 

// Función para enviar notificación de cita aprobada
export const sendAppointmentApproved = async (appointment, patient, professional) => {
  try {
    const appointmentDate = new Date(appointment.date);
    const formattedDate = appointmentDate.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const startTime = appointment.startTime ? appointment.startTime.slice(0, 5) : 'No especificado';
    const endTime = appointment.endTime ? appointment.endTime.slice(0, 5) : 'No especificado';

    // Template de email para aprobación
    const emailTemplate = {
      subject: '✅ Tu solicitud de cita ha sido aprobada - Centro Quiropráctico',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #22c55e; margin: 0;">¡Solicitud Aprobada!</h1>
          </div>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #1f2937; margin-top: 0;">Hola ${patient.firstName},</h2>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
              ¡Excelentes noticias! Tu solicitud de cita ha sido <strong style="color: #22c55e;">aprobada</strong>.
            </p>
          </div>

          <div style="background-color: #ffffff; border: 1px solid #e5e7eb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #1f2937; margin-top: 0;">📅 Detalles de tu cita:</h3>
            <div style="color: #4b5563;">
              <p><strong>📍 Fecha:</strong> ${formattedDate}</p>
              <p><strong>🕒 Horario:</strong> ${startTime} - ${endTime}</p>
              <p><strong>👩‍⚕️ Profesional:</strong> ${professional ? `${professional.name} ${professional.lastName}` : 'Por asignar'}</p>
              <p><strong>📝 Motivo:</strong> ${appointment.reason || 'Consulta general'}</p>
              ${appointment.notes ? `<p><strong>📋 Notas:</strong> ${appointment.notes}</p>` : ''}
            </div>
          </div>

          <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin-bottom: 20px;">
            <p style="margin: 0; color: #92400e;">
              <strong>⏰ Próximo paso:</strong> Tu cita será confirmada y agendada oficialmente. 
              Recibirás una notificación adicional con los detalles finales.
            </p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <p style="color: #6b7280; font-size: 14px;">
              Si tienes alguna pregunta, no dudes en contactarnos.
            </p>
          </div>

          <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              Centro Quiropráctico - Cuidamos tu bienestar
            </p>
          </div>
        </div>
      `
    };

    // Mensaje de WhatsApp para aprobación
    const whatsappMessage = `🎉 ¡Hola ${patient.firstName}! 

✅ Tu solicitud de cita ha sido *APROBADA*

📅 *Detalles de tu cita:*
• Fecha: ${formattedDate}
• Horario: ${startTime} - ${endTime}
• Profesional: ${professional ? `${professional.name} ${professional.lastName}` : 'Por asignar'}

⏰ *Próximo paso:* Tu cita será confirmada y agendada oficialmente. Recibirás otra notificación con los detalles finales.

¡Gracias por confiar en nosotros! 🙏

_Centro Quiropráctico_`;

    const results = {};

    // Enviar email
    if (patient.email) {
      try {
        const emailResult = await sendEmailNotification(patient.email, emailTemplate.subject, emailTemplate.html);
        results.email = {
          success: emailResult.success,
          messageId: emailResult.messageId,
          recipient: patient.email
        };
      } catch (emailError) {
        console.error('Error enviando email de aprobación:', emailError);
        results.email = {
          success: false,
          error: emailError.message,
          recipient: patient.email
        };
      }
    }

    // Enviar WhatsApp
    if (patient.phone) {
      try {
        const whatsappResult = await sendWhatsAppNotification(patient.phone, whatsappMessage);
        results.whatsapp = {
          success: whatsappResult.success,
          messageId: whatsappResult.messageId,
          recipient: patient.phone
        };
      } catch (whatsappError) {
        console.error('Error enviando WhatsApp de aprobación:', whatsappError);
        results.whatsapp = {
          success: false,
          error: whatsappError.message,
          recipient: patient.phone
        };
      }
    }

    return results;

  } catch (error) {
    console.error('Error en sendAppointmentApproved:', error);
    throw error;
  }
};

// Función para enviar notificación de cita rechazada
export const sendAppointmentRejected = async (appointment, patient, rejectionReason, alternativeOptions) => {
  try {
    const appointmentDate = new Date(appointment.date);
    const formattedDate = appointmentDate.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const startTime = appointment.startTime ? appointment.startTime.slice(0, 5) : 'No especificado';
    const endTime = appointment.endTime ? appointment.endTime.slice(0, 5) : 'No especificado';

    // Template de email para rechazo
    const emailTemplate = {
      subject: '📋 Actualización sobre tu solicitud de cita - Centro Quiropráctico',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #ef4444; margin: 0;">Actualización de Solicitud</h1>
          </div>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #1f2937; margin-top: 0;">Hola ${patient.firstName},</h2>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
              Hemos revisado tu solicitud de cita para el <strong>${formattedDate}</strong> 
              de ${startTime} a ${endTime}.
            </p>
          </div>

          <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin-bottom: 20px;">
            <h3 style="color: #dc2626; margin-top: 0;">📋 Motivo:</h3>
            <p style="margin: 0; color: #7f1d1d;">${rejectionReason}</p>
          </div>

          ${alternativeOptions ? `
          <div style="background-color: #f0f9ff; border-left: 4px solid #3b82f6; padding: 15px; margin-bottom: 20px;">
            <h3 style="color: #1d4ed8; margin-top: 0;">💡 Opciones alternativas:</h3>
            <p style="margin: 0; color: #1e3a8a;">${alternativeOptions}</p>
          </div>
          ` : ''}

          <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 15px; margin-bottom: 20px;">
            <p style="margin: 0; color: #166534;">
              <strong>📞 ¿Qué puedes hacer?</strong><br>
              • Puedes solicitar una nueva cita con diferentes horarios<br>
              • Contactarnos por WhatsApp para coordinar personalmente<br>
              • Llamarnos para encontrar la mejor opción para ti
            </p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <p style="color: #6b7280; font-size: 14px;">
              Estamos aquí para ayudarte. No dudes en contactarnos para encontrar 
              la mejor solución para tu consulta.
            </p>
          </div>

          <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              Centro Quiropráctico - Cuidamos tu bienestar
            </p>
          </div>
        </div>
      `
    };

    // Mensaje de WhatsApp para rechazo
    const whatsappMessage = `📋 Hola ${patient.firstName},

Hemos revisado tu solicitud de cita para el *${formattedDate}* de ${startTime} a ${endTime}.

❗ *Motivo:* ${rejectionReason}

${alternativeOptions ? `💡 *Opciones alternativas:*
${alternativeOptions}

` : ''}📞 *¿Qué puedes hacer?*
• Solicitar una nueva cita con diferentes horarios
• Contactarnos por WhatsApp para coordinar
• Llamarnos para encontrar la mejor opción

Estamos aquí para ayudarte 🙏

_Centro Quiropráctico_`;

    const results = {};

    // Enviar email
    if (patient.email) {
      try {
        const emailResult = await sendEmailNotification(patient.email, emailTemplate.subject, emailTemplate.html);
        results.email = {
          success: emailResult.success,
          messageId: emailResult.messageId,
          recipient: patient.email
        };
      } catch (emailError) {
        console.error('Error enviando email de rechazo:', emailError);
        results.email = {
          success: false,
          error: emailError.message,
          recipient: patient.email
        };
      }
    }

    // Enviar WhatsApp
    if (patient.phone) {
      try {
        const whatsappResult = await sendWhatsAppNotification(patient.phone, whatsappMessage);
        results.whatsapp = {
          success: whatsappResult.success,
          messageId: whatsappResult.messageId,
          recipient: patient.phone
        };
      } catch (whatsappError) {
        console.error('Error enviando WhatsApp de rechazo:', whatsappError);
        results.whatsapp = {
          success: false,
          error: whatsappError.message,
          recipient: patient.phone
        };
      }
    }

    return results;

  } catch (error) {
    console.error('Error en sendAppointmentRejected:', error);
    throw error;
  }
}; 