import 'dotenv/config';
import { sendEmailNotification, sendAppointmentNotification } from '../services/notification.service.js';

console.log('🧪 Iniciando prueba del sistema de notificaciones...\n');

// Verificar variables de entorno
console.log('📋 Verificando configuración:');
console.log('EMAIL_USER:', process.env.EMAIL_USER ? '✅ Configurado' : '❌ No configurado');
console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '✅ Configurado' : '❌ No configurado');
console.log('WHATSAPP_TOKEN:', process.env.WHATSAPP_TOKEN ? '✅ Configurado' : '⚠️ No configurado (opcional)');
console.log('');

// Datos de prueba
const testAppointment = {
  id: 999,
  date: '2024-01-15',
  startTime: '10:00',
  endTime: '11:00',
  reason: 'Consulta de prueba - Sistema de notificaciones',
  status: 'scheduled'
};

const testPatient = {
  id: 999,
  firstName: 'Paciente',
  lastName: 'De Prueba',
  email: process.env.EMAIL_USER, // Enviamos a nuestro propio email para probar
  phone: '+54 911 123 4567'
};

const testProfessional = {
  id: 999,
  name: 'Dr. Prueba',
  lastName: 'Sistema',
  email: process.env.EMAIL_USER
};

async function runTests() {
  try {
    console.log('🧪 Test 1: Envío de email simple...');
    const emailResult = await sendEmailNotification(
      testPatient.email,
      '🧪 Test - Centro Quiropráctico',
      '<h1>✅ Test exitoso</h1><p>El sistema de notificaciones está funcionando correctamente.</p>'
    );
    console.log('Resultado:', emailResult);
    console.log('');

    console.log('🧪 Test 2: Notificación completa de cita...');
    const notificationResult = await sendAppointmentNotification(
      testAppointment,
      testPatient,
      testProfessional
    );
    console.log('Resultado:', notificationResult);
    console.log('');

    console.log('✅ Pruebas completadas. Revisa tu email para verificar que llegaron las notificaciones.');

  } catch (error) {
    console.error('❌ Error durante las pruebas:', error);
  }
}

// Ejecutar pruebas automáticamente
console.log('🚀 Ejecutando pruebas...\n');
runTests(); 