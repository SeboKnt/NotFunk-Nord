// Erweitertes Status-Monitoring für NotFunk-Nord
// Diese Version fügt detailliertere Checks und bessere Fehlerbehandlung hinzu

import https from 'https';
import { sendEmailNotification } from './utils/email.js';

// Timeout-Konfiguration
const REQUEST_TIMEOUT = 10000; // 10 Sekunden

/**
 * Prüft den Status der Website mit detaillierten Informationen
 * @returns {Promise<Object>} Statusinformationen
 */
function checkWebsiteDetailed() {
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    const req = https.get('https://notfunk-nord.de', (res) => {
      const responseTime = Date.now() - startTime;
      
      resolve({
        ok: res.statusCode === 200,
        statusCode: res.statusCode,
        responseTime: responseTime,
        headers: {
          contentType: res.headers['content-type'],
          server: res.headers['server']
        }
      });
    });
    
    req.on('error', (error) => {
      resolve({
        ok: false,
        error: error.message,
        responseTime: Date.now() - startTime
      });
    });
    
    req.on('timeout', () => {
      req.destroy();
      resolve({
        ok: false,
        error: 'Timeout',
        responseTime: REQUEST_TIMEOUT
      });
    });
    
    req.setTimeout(REQUEST_TIMEOUT);
  });
}

/**
 * Prüft ob die Domain im Wikipedia-Artikel referenziert ist
 * @returns {Promise<Object>} Wikipedia-Referenz-Informationen
 */
function checkWikipediaReference() {
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    const req = https.get('https://de.wikipedia.org/api/rest_v1/page/html/Notfunk', (res) => {
      let data = '';
      
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const responseTime = Date.now() - startTime;
        const isReferenced = data.includes('notfunk-nord.de');
        
        resolve({
          ok: true,
          referenced: isReferenced,
          responseTime: responseTime,
          contentLength: data.length
        });
      });
    });
    
    req.on('error', (error) => {
      resolve({
        ok: false,
        error: error.message,
        responseTime: Date.now() - startTime
      });
    });
    
    req.on('timeout', () => {
      req.destroy();
      resolve({
        ok: false,
        error: 'Timeout',
        responseTime: REQUEST_TIMEOUT
      });
    });
    
    req.setTimeout(REQUEST_TIMEOUT);
  });
}

/**
 * Prüft zusätzliche Dienste (z.B. API-Endpunkte)
 * @returns {Promise<Object>} API-Status-Informationen
 */
function checkApiStatus() {
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    const req = https.get('https://notfunk-nord.de/api/health', (res) => {
      let data = '';
      
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const responseTime = Date.now() - startTime;
        
        try {
          const jsonData = JSON.parse(data);
          resolve({
            ok: res.statusCode === 200,
            statusCode: res.statusCode,
            responseTime: responseTime,
            data: jsonData
          });
        } catch (parseError) {
          resolve({
            ok: false,
            error: 'Invalid JSON response',
            responseTime: responseTime,
            rawResponse: data.substring(0, 100) + '...'
          });
        }
      });
    });
    
    req.on('error', (error) => {
      resolve({
        ok: false,
        error: error.message,
        responseTime: Date.now() - startTime
      });
    });
    
    req.on('timeout', () => {
      req.destroy();
      resolve({
        ok: false,
        error: 'Timeout',
        responseTime: REQUEST_TIMEOUT
      });
    });
    
    req.setTimeout(REQUEST_TIMEOUT);
  });
}

/**
 * Sendet eine detaillierte Status-Benachrichtigung
 * @param {Array} checks - Liste der durchgeführten Checks
 * @returns {Promise<boolean>} Erfolg des Versands
 */
async function sendDetailedNotification(checks) {
  const failedChecks = checks.filter(check => !check.result.ok);
  const hasFailures = failedChecks.length > 0;
  
  const subject = hasFailures 
    ? `⚠️ Notfunk-Nord Status Alert - ${failedChecks.length} Fehler` 
    : '✅ NotFunk-Nord Status Report - Alles OK';
  
  let body = `Notfunk-Nord System Status Report\n`;
  body += `Zeitpunkt: ${new Date().toISOString()}\n\n`;
  
  for (const check of checks) {
    body += `${check.name}: ${check.result.ok ? '✅ OK' : '❌ FEHLER'}\n`;
    
    if (check.result.responseTime) {
      body += `  Antwortzeit: ${check.result.responseTime}ms\n`;
    }
    
    if (!check.result.ok && check.result.error) {
      body += `  Fehler: ${check.result.error}\n`;
    }
    
    if (check.result.statusCode) {
      body += `  Status: ${check.result.statusCode}\n`;
    }
    
    body += `\n`;
  }
  
  if (hasFailures) {
    body += `Bitte überprüfen Sie das System umgehend!\n`;
  } else {
    body += `Alle Systeme sind ordnungsgemäß funktionsfähig.\n`;
  }
  
  return await sendEmailNotification(subject, body);
}

/**
 * Hauptfunktion für das erweiterte Status-Monitoring
 */
async function main() {
  try {
    console.log('🔄 Starte erweitertes Status-Monitoring...');
    
    // Alle Checks parallel ausführen
    const [websiteResult, wikipediaResult, apiResult] = await Promise.all([
      checkWebsiteDetailed(),
      checkWikipediaReference(),
      checkApiStatus()
    ]);
    
    const checks = [
      { name: 'Website', result: websiteResult },
      { name: 'Wikipedia Referenz', result: wikipediaResult },
      { name: 'API Status', result: apiResult }
    ];
    
    // Benachrichtigung senden
    const emailSuccess = await sendDetailedNotification(checks);
    
    // Ergebnisse ausgeben
    console.log('\n📊 STATUS REPORT:');
    for (const check of checks) {
      console.log(`${check.name}: ${check.result.ok ? 'OK' : 'FEHLER'} (${check.result.responseTime || 'N/A'}ms)`);
    }
    
    console.log(`\n📧 E-Mail-Benachrichtigung: ${emailSuccess ? 'Gesendet' : 'Fehler beim Senden'}`);
    
    // Bei Fehlern exit code setzen
    const hasErrors = checks.some(check => !check.result.ok);
    process.exit(hasErrors ? 1 : 0);
    
  } catch (error) {
    console.error('❌ Kritischer Fehler im Monitoring:', error.message);
    await sendEmailNotification(
      '❌ NotFunk-Nord Monitoring CRITICAL ERROR',
      `Kritischer Fehler im Monitoring-System:\n${error.message}\n\nBitte überprüfen Sie das Monitoring selbst.`
    );
    process.exit(1);
  }
}

// Nur ausführen wenn direkt aufgerufen
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

// Export für andere Module
export {
  checkWebsiteDetailed,
  checkWikipediaReference,
  checkApiStatus,
  sendDetailedNotification,
  main
};