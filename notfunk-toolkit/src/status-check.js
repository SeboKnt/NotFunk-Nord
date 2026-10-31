// Status monitoring script for NotFunk-Nord
// This script runs periodically to check website status and Wikipedia reference

const https = require('https');

// Check website status
function checkWebsite() {
  return new Promise((resolve, reject) => {
    const req = https.get('https://notfunk-nord.de', (res) => {
      resolve(res.statusCode === 200);
    });
    req.on('error', reject);
    req.end();
  });
}

// Check if domain is still referenced in Wikipedia
function checkWikipediaReference() {
  return new Promise((resolve, reject) => {
    const req = https.get('https://de.wikipedia.org/api/rest_v1/page/html/Notfunk', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve(data.includes('notfunk-nord.de'));
      });
    });
    req.on('error', reject);
    req.end();
  });
}

// Send email notification using SMTP (simplified)
function sendNotification(subject, body) {
  // In a real implementation, this would send an email
  console.log(`EMAIL SENT to notfunk@youngandhungry.org`);
  console.log(`Subject: ${subject}`);
  console.log(`Body: ${body}`);
  
  // For demonstration - in reality you would use an email service
  // like nodemailer or connect to an SMTP server
  return Promise.resolve();
}

async function main() {
  try {
    const websiteOk = await checkWebsite();
    const wikipediaRef = await checkWikipediaReference();
    
    if (!websiteOk || !wikipediaRef) {
      await sendNotification(
        '⚠️ Notfunk-Nord Status Alert',
        `Status check failed:\nWebsite OK: ${websiteOk}\nWikipedia reference: ${wikipediaRef}\n\nPlease check the system immediately.`
      );
    } else {
      console.log('All systems operational');
    }
  } catch (error) {
    await sendNotification(
      '❌ Notfunk-Nord Monitoring Error',
      `Monitoring script failed:\n${error.message}\n\nPlease investigate the monitoring system.`
    );
  }
}

// Only run if called directly (not imported)
if (require.main === module) {
  main();
}

module.exports = { checkWebsite, checkWikipediaReference, sendNotification };