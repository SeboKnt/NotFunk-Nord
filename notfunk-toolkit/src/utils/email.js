import { createTransport } from 'nodemailer';

// E-Mail-Konfiguration (in Produktion aus Umgebungsvariablen laden)
const EMAIL_CONFIG = {
  host: 'smtp.youngandhungry.org',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: 'notfunk@youngandhungry.org',
    pass: process.env.EMAIL_PASSWORD || 'dummy-password'
  }
};

// Transporter erstellen
const transporter = createTransport(EMAIL_CONFIG);

/**
 * Sendet eine E-Mail-Benachrichtigung
 * @param {string} subject - Betreff der E-Mail
 * @param {string} body - Textkörper der E-Mail
 * @returns {Promise<boolean>} - True wenn erfolgreich gesendet
 */
async function sendEmailNotification(subject, body) {
  try {
    // In einer echten Implementierung hier die tatsächliche E-Mail senden
    // Für jetzt loggen wir es nur, da wir keinen echten SMTP-Server haben
    
    console.log(`📧 E-MAIL SIMULIERT:`);
    console.log(`An: notfunk@youngandhungry.org`);
    console.log(`Betreff: ${subject}`);
    console.log(`Nachricht: ${body}`);
    console.log(`---`);
    
    // Für eine spätere echte Implementierung:
    /*
    const info = await transporter.sendMail({
      from: '"NotFunk-Nord Monitoring" <notfunk@youngandhungry.org>',
      to: 'notfunk@youngandhungry.org',
      subject: subject,
      text: body
    });
    
    console.log('E-Mail gesendet:', info.messageId);
    return true;
    */
   
   // Simuliere erfolgreichen Versand
   return true;
  } catch (error) {
    console.error('Fehler beim Senden der E-Mail:', error.message);
    return false;
  }
}

export { sendEmailNotification };