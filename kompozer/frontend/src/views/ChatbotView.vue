<script setup lang="ts">
/** Chatbot view handling session lifecycle, realtime events, and message exchange. */
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { chatbotService } from '@/services/chatbotService';
import { chatbotSocket } from '@/services/chatbotSocket';
import { ApiError } from '@/types/api';
import type { ChatMessageDto, ChatSessionDto } from '@/types/chatbot';

const route = useRoute();

const session = ref<ChatSessionDto | null>(null);
const messages = ref<ChatMessageDto[]>([]);
const loading = ref(false);
const sending = ref(false);
const closing = ref(false);
const error = ref('');
const draft = ref('');
const botTyping = ref(false);
let removeNewMessageListener: (() => void) | null = null;
let removeSocketErrorListener: (() => void) | null = null;
let removeTypingListener: (() => void) | null = null;
const MIN_TYPING_VISIBLE_MS = 450;
let typingVisibleSince = 0;
let typingHideTimer: ReturnType<typeof setTimeout> | null = null;

const configurationId = computed(() => {
  const raw = route.query['configurationId'];
  return typeof raw === 'string' && raw.trim() ? raw : undefined;
});

const isClosed = computed(() => session.value?.status === 'CLOSED');

/** Immediately hides typing state and clears any delayed hide timers. */
function resetTypingIndicator(): void {
  if (typingHideTimer) {
    clearTimeout(typingHideTimer);
    typingHideTimer = null;
  }
  botTyping.value = false;
  typingVisibleSince = 0;
}

/**
 * Updates bot typing UI while enforcing a minimum visible duration.
 * @param active True when the typing indicator should be shown.
 */
function setTypingIndicator(active: boolean): void {
  if (active) {
    if (typingHideTimer) {
      clearTimeout(typingHideTimer);
      typingHideTimer = null;
    }
    if (!botTyping.value) {
      botTyping.value = true;
      typingVisibleSince = Date.now();
    }
    return;
  }

  if (!botTyping.value) {
    return;
  }

  const elapsed = Date.now() - typingVisibleSince;
  const wait = Math.max(0, MIN_TYPING_VISIBLE_MS - elapsed);

  if (typingHideTimer) {
    clearTimeout(typingHideTimer);
  }

  typingHideTimer = setTimeout(() => {
    botTyping.value = false;
    typingVisibleSince = 0;
    typingHideTimer = null;
  }, wait);
}

/** Formats ISO timestamps for the chat timeline. */
function formatTime(iso: string): string {
  return new Intl.DateTimeFormat('it-IT', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(iso));
}

/** Opens a brand-new chat session, optionally scoped to a configuration. */
async function openFreshSession(): Promise<void> {
  loading.value = true;
  error.value = '';
  resetTypingIndicator();
  try {
    session.value = await chatbotService.createSession(configurationId.value);
    messages.value = [];
  } catch (e) {
    error.value = e instanceof ApiError ? e.message : 'Errore apertura chat';
  } finally {
    loading.value = false;
  }
}

/** Restores chat from route session id or starts a new one when absent. */
async function initializeChat(): Promise<void> {
  const sessionId = typeof route.query['sessionId'] === 'string' ? route.query['sessionId'] : '';
  if (!sessionId) {
    await openFreshSession();
    return;
  }

  loading.value = true;
  error.value = '';
  resetTypingIndicator();
  try {
    const [sessionData, messageData] = await Promise.all([
      chatbotService.getSession(sessionId),
      chatbotService.listMessages(sessionId),
    ]);
    session.value = sessionData;
    messages.value = messageData.items;
  } catch (e) {
    error.value = e instanceof ApiError ? e.message : 'Errore caricamento chat';
  } finally {
    loading.value = false;
  }
}

/** Sends current draft text and appends resulting user/bot messages. */
async function sendMessage(): Promise<void> {
  const content = draft.value.trim();
  if (!content || !session.value || isClosed.value) {
    return;
  }

  sending.value = true;
  error.value = '';
  try {
    const result = await chatbotSocket.sendMessage(session.value.id, content);
    pushMessageIfMissing(result.userMessage);
    pushMessageIfMissing(result.botMessage);
    draft.value = '';
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Errore invio messaggio';
  } finally {
    sending.value = false;
  }
}

/** Appends a message only if it belongs to the active session and is new. */
function pushMessageIfMissing(message: ChatMessageDto): void {
  if (!session.value || message.sessionId !== session.value.id) {
    return;
  }

  if (messages.value.some((existing) => existing.id === message.id)) {
    return;
  }

  messages.value = [...messages.value, message];

  if (message.role === 'BOT') {
    setTypingIndicator(false);
  }
}

/** Closes active chat session and prevents further message submissions. */
async function closeChat(): Promise<void> {
  if (!session.value || isClosed.value) {
    return;
  }

  closing.value = true;
  error.value = '';
  try {
    session.value = await chatbotService.closeSession(session.value.id);
  } catch (e) {
    error.value = e instanceof ApiError ? e.message : 'Errore chiusura chat';
  } finally {
    closing.value = false;
  }
}

onMounted(() => {
  chatbotSocket.connect();

  removeNewMessageListener = chatbotSocket.onNewMessage((message) => {
    pushMessageIfMissing(message);
  });

  removeSocketErrorListener = chatbotSocket.onError((payload) => {
    error.value = payload.message;
    resetTypingIndicator();
  });

  removeTypingListener = chatbotSocket.onTyping((payload) => {
    if (!session.value || payload.sessionId !== session.value.id) {
      return;
    }

    setTypingIndicator(payload.active);
  });

  void initializeChat();
});

onUnmounted(() => {
  removeNewMessageListener?.();
  removeSocketErrorListener?.();
  removeTypingListener?.();
  resetTypingIndicator();
  removeNewMessageListener = null;
  removeSocketErrorListener = null;
  removeTypingListener = null;
  chatbotSocket.disconnect();
});
</script>

<template>
  <div class="view-container chatbot-view">
    <header class="chatbot-header">
      <div>
        <h1>Chatbot</h1>
        <p class="subtitle">Fai domande sul catalogo e ricevi risposte contestuali ai componenti disponibili.</p>
      </div>
      <div class="chatbot-header__actions">
        <button class="btn btn--light" :disabled="loading || sending || closing" @click="openFreshSession">Nuova chat</button>
        <button class="btn btn--light" :disabled="!session || isClosed || closing" @click="closeChat">
          {{ closing ? 'Chiusura...' : 'Chiudi chat' }}
        </button>
      </div>
    </header>

    <p v-if="session" class="session-meta">
      Sessione {{ session.status === 'ACTIVE' ? 'attiva' : 'chiusa' }}
      <span v-if="session.configurationId"> · Configurazione: {{ session.configurationId }}</span>
    </p>

    <p v-if="error" class="error" role="alert" aria-live="assertive">{{ error }}</p>
    <p v-if="loading" class="placeholder">Preparazione chat...</p>

    <template v-else>
      <section class="chat-window">
        <p v-if="messages.length === 0" class="placeholder">Nessun messaggio ancora. Prova a chiedere prezzo, disponibilita' o SKU di un componente.</p>

        <article
          v-for="message in messages"
          :key="message.id"
          :class="['chat-message', message.role === 'USER' ? 'chat-message--user' : 'chat-message--bot']"
        >
          <div class="chat-message__meta">
            <strong>{{ message.role === 'USER' ? 'Tu' : 'KompozeR Bot' }}</strong>
            <span>{{ formatTime(message.createdAt) }}</span>
          </div>
          <p class="chat-message__content">{{ message.content }}</p>
        </article>

        <div v-if="botTyping" class="chatbot-typing" aria-live="polite">
          <span>KompozeR Bot sta scrivendo</span>
          <span class="chatbot-typing__dots" aria-hidden="true">
            <span class="chatbot-typing__dot"></span>
            <span class="chatbot-typing__dot"></span>
            <span class="chatbot-typing__dot"></span>
          </span>
        </div>
      </section>

      <form class="chat-compose" @submit.prevent="sendMessage">
        <textarea
          v-model="draft"
          class="chat-compose__input"
          rows="4"
          :disabled="!session || isClosed || sending"
          placeholder="Es. prezzo SKU-001, disponibilita ripiano 80, componenti per montante..."
        />
        <button class="btn btn--primary chat-compose__submit" type="submit" :disabled="!session || isClosed || sending || !draft.trim()">
          {{ sending ? 'Invio...' : 'Invia' }}
        </button>
      </form>
    </template>
  </div>
</template>

<style scoped>
.view-container {
  max-width: var(--content-max-width);
  margin: 0 auto;
  padding: var(--space-8) var(--space-6);
}

.chatbot-view {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.chatbot-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--space-4);
}

.chatbot-header__actions {
  display: flex;
  gap: var(--space-3);
}

.subtitle,
.session-meta,
.placeholder {
  color: var(--color-text-muted);
}

.error {
  color: var(--color-error);
  background: var(--color-error-subtle);
  border: 1px solid #f0cccc;
  border-radius: var(--radius-md);
  padding: var(--space-3);
}

.chat-window {
  min-height: 360px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.chat-message {
  max-width: 80%;
  padding: var(--space-3);
  border-radius: var(--radius-lg);
  white-space: pre-wrap;
}

.chat-message--user {
  align-self: flex-end;
  background: #dde8d7;
}

.chat-message--bot {
  align-self: flex-start;
  background: var(--color-surface-raised);
  border: 1px solid var(--color-border);
}

.chat-message__meta {
  display: flex;
  justify-content: space-between;
  gap: var(--space-3);
  margin-bottom: var(--space-2);
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.chat-message__content {
  margin: 0;
}

.chatbot-typing {
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}

.chatbot-typing__dots {
  display: inline-flex;
  gap: 4px;
}

.chatbot-typing__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-text-muted);
  opacity: 0.3;
  animation: chatbotTypingPulse 1s infinite ease-in-out;
}

.chatbot-typing__dot:nth-child(2) {
  animation-delay: 0.2s;
}

.chatbot-typing__dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes chatbotTypingPulse {
  0%,
  80%,
  100% {
    opacity: 0.3;
    transform: translateY(0);
  }
  40% {
    opacity: 1;
    transform: translateY(-2px);
  }
}

.chat-compose {
  display: grid;
  gap: var(--space-3);
}

.chat-compose__input {
  width: 100%;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  padding: var(--space-3);
  font: inherit;
  resize: vertical;
}

.chat-compose__input:focus {
  outline: none;
  border-color: var(--color-accent);
}

.chat-compose__submit {
  justify-self: end;
}

.btn {
  border: none;
  border-radius: var(--radius-md);
  padding: var(--space-2) var(--space-4);
  cursor: pointer;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn--primary {
  background: var(--color-accent);
  color: #fff;
}

.btn--light {
  background: var(--color-surface-raised);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
}

@media (max-width: 900px) {
  .chatbot-header {
    flex-direction: column;
  }

  .chatbot-header__actions {
    width: 100%;
    flex-wrap: wrap;
  }

  .chat-message {
    max-width: 100%;
  }

  .chat-compose__submit {
    justify-self: stretch;
  }
}
</style>