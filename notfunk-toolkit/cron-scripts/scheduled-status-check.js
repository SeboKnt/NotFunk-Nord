#!/usr/bin/env node

// Cron-Skript für NotFunk-Nord Status-Checks
// Dieses Skript wird periodisch vom Cron-Job aufgerufen

import { checkWebsiteDetailed, checkWikipediaReference, checkApiStatus, sendDetailedNotification } from '../src/status-check.js';

async function runScheduledCheck() {
  try {
    console.log('🕒 Geplanter Status-Check wird ausgeführt...');
    
    // Alle Checks parallel ausführen
    const [websiteResult, wikipediaResult, apiResult] = await Promise.allSettled([
      checkWebsiteDetailed(),
      checkWikipediaReference(),
      checkApiStatus()
    ]);
    
    // Ergebnisse verarbeiten
    const checks = [
      { 
        name: 'Website', 
        result: websiteResult.status === 'fulfilled' ? websiteResult.value : { ok: false, error: websiteResult.reason?.message || 'Unknown error' }
      },
      { 
        name: 'Wikipedia Referenz', 
        result: wikipediaResult.status === 'fulfilled' ? wikipediaResult.value : { ok: false, error: wikipediaResult.reason?.message || 'Unknown error' }
      },
      { 
        name: 'API Status', 
        result: apiResult.status === 'fulfilled' ? apiResult.value : { ok: false, error: apiResult.reason?.message || 'Unknown error' }
      }
    ];
    
    // Benachrichtigung senden
    const emailSuccess = await sendDetailedNotification(checks);
    
    // Ergebnisse protokollieren
    console.log('\n📊 GEPLANTEX STATUS-CHECK ERGBNISSE:');
    for (const check of checks) {
      console.log(`${check.name}: ${check.result.ok ? '✅ OK' : '❌ FEHLER'} (${check.result.responseTime || 'N/A'}ms)`);
    }
    
    console.log(`\n📧 E-Mail-Benachrichtigung: ${emailSuccess ? 'Gesendet' : 'Fehler beim Senden'}`);
    
  } catch (error) {
    console.error('❌ Fehler im geplanten Check:', error);
    process.exit(1);
  }
}

// Ausführung starten
if (import.meta.url === `file://${process.argv[1]}`) {
  runScheduledCheck();
}

export { runScheduledCheck };