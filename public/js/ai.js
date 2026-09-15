// NotFunk-Nord — KI Chat Interface
// Interface für den Hugging Face Mistral Assistant

(function () {
  'use strict';

  const MAX_HISTORY = 10;
  let messageHistory = [];
  let isTyping = false;

  async function sendMessage(question) {
    if (!question.trim() || isTyping) return;

    const input = document.getElementById('ai-input');
    const messagesDiv = document.getElementById('ai-messages');
    const suggestionsDiv = document.getElementById('ai-suggestions');

    // Verstecke Vorschläge nach erster Nachricht
    if (suggestionsDiv) suggestionsDiv.style.display = 'none';

    // User-Nachricht anzeigen
    appendMessage('user', question);
    messageHistory.push({ role: 'user', content: question });

    // Loading-Status
    isTyping = true;
    input.disabled = true;
    const loadingId = appendMessage('assistant', '⏳ Überlege...', true);

    try {
      const response = await fetch('/api/ai/chat?question=' + encodeURIComponent(question));
      const data = await response.json();

      // Loading entfernen
      removeMessage(loadingId);

      if (data.reply && data.reply !== 'Keine Antwort erhalten') {
        appendMessage('assistant', data.reply);
        messageHistory.push({ role: 'assistant', content: data.reply });

        // Limitieren
        if (messageHistory.length > MAX_HISTORY * 2) {
          messageHistory = messageHistory.slice(-MAX_HISTORY * 2);
        }
      } else {
        appendMessage('assistant', 'Entschuldigung, ich konnte keine Antwort generieren.');
      }
    } catch (error) {
      removeMessage(loadingId);
      appendMessage('assistant', 'Fehler: ' + error.message);
    } finally {
      isTyping = false;
      input.disabled = false;
      input.value = '';
      input.focus();
    }
  }

  function appendMessage(role, text, isLoading = false) {
    const messagesDiv = document.getElementById('ai-messages');
    if (!messagesDiv) return null;

    const div = document.createElement('div');
    div.className = 'ai-message ' + (role === 'user' ? 'ai-user' : 'ai-assistant');
    if (isLoading) div.id = 'ai-loading-' + Date.now();

    const avatar = document.createElement('div');
    avatar.className = 'ai-avatar';
    avatar.textContent = role === 'user' ? '👤' : '📻';

    const content = document.createElement('div');
    content.className = 'ai-content';
    content.textContent = text;

    div.appendChild(avatar);
    div.appendChild(content);
    messagesDiv.appendChild(div);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;

    return div.id;
  }

  function removeMessage(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
  }

  function loadSuggestions() {
    const container = document.getElementById('ai-suggestions');
    if (!container) return;

    fetch('/api/ai/suggest')
      .then(r => r.json())
      .then(data => {
        container.innerHTML = data.suggestions.map(s => `
          <button class="ai-suggestion" onclick="AppAI.ask('${s.replace(/'/g, "\\'")}')">${s}</button>
        `).join('');
      })
      .catch(() => {
        // Fallback-Suggestions
        container.innerHTML = `
          <button class="ai-suggestion" onclick="AppAI.ask('Welche Frequenz im Notfall?')">Welche Frequenz im Notfall?</button>
          <button class="ai-suggestion" onclick="AppAI.ask('Was ist LoRa?')">Was ist LoRa?</button>
          <button class="ai-suggestion" onclick="AppAI.ask('Notfunk-Frequenzen Deutschland')">Notfunk-Frequenzen DE</button>
        `;
      });
  }

  window.AppAI = {
    sendMessage: sendMessage,
    ask: (q) => sendMessage(q),
    loadSuggestions: loadSuggestions,
  };

  // Event Listener
  document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('ai-input');
    const sendBtn = document.getElementById('ai-send');
    const form = document.getElementById('ai-form');

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        sendMessage(input.value);
      });
    }

    if (sendBtn) {
      sendBtn.addEventListener('click', () => sendMessage(input.value));
    }

    if (input) {
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          sendMessage(input.value);
        }
      });
    }

    loadSuggestions();
  });
})();
