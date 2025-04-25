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
  }
});

export const sendWhatsAppNotification = async (to, message) => {
  try {
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
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      html
    });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error al enviar email:', error);
    return { success: false, error: error.message };
  }
};

export const sendAppointmentNotification = async (appointment, patient) => {
  const whatsappMessage = `
    🏥 Centro Quiropráctico - Recordatorio de Turno
    Paciente: ${patient.name}
    Fecha: ${appointment.date.toLocaleDateString()}
    Hora: ${appointment.startTime}
    Motivo: ${appointment.reason || 'No especificado'}
    Por favor, confirme su asistencia respondiendo SI o NO
  `;

  const emailHtml = `
    <h1>Recordatorio de Turno</h1>
    <p>Estimado/a ${patient.name},</p>
    <p>Le recordamos que tiene un turno programado para:</p>
    <ul>
      <li>Fecha: ${appointment.date.toLocaleDateString()}</li>
      <li>Hora: ${appointment.startTime}</li>
      <li>Motivo: ${appointment.reason || 'No especificado'}</li>
    </ul>
    <p>Por favor, confirme su asistencia respondiendo a este email.</p>
    <p>Saludos cordiales,<br>Centro Quiropráctico</p>
  `;

  // Enviar notificaciones
  const whatsappResult = await sendWhatsAppNotification(patient.phone, whatsappMessage);
  const emailResult = await sendEmailNotification(patient.email, 'Recordatorio de Turno', emailHtml);

  return {
    whatsapp: whatsappResult,
    email: emailResult
  };
}; 