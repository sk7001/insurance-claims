import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { HttpService } from '../../services/http.service';

type ChatMsg = {
  from: 'user' | 'bot';
  text: string;
};

@Component({
  selector: 'app-chatbot',
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.scss']
})
export class ChatbotComponent implements OnInit {

  isOpen = false;

  inputText = '';
  messages: ChatMsg[] = [];

  loading = false;

  // ✅ init should be sent only once per open session
  private initSent = false;

  // ✅ queue/countdown state
  isQueued = false;
  retrySeconds = 0;
  private retryTimer: any = null;

  // ✅ store last user message for auto-retry
  private lastUserMessage: string | null = null;

  @ViewChild('chatBody') chatBody!: ElementRef<HTMLDivElement>;

  constructor(private http: HttpService) {}

  ngOnInit(): void {}

  toggleChat(): void {
    this.isOpen = !this.isOpen;

    // ✅ when closing: reset everything, next open starts fresh
    if (!this.isOpen) {
      this.resetChat();
      return;
    }

    // ✅ when opening first time in this session: send __INIT__
    if (!this.initSent) {
      this.initSent = true;
      this.sendInitialContext();
    }

    setTimeout(() => this.scrollToBottom(), 50);
  }

  private resetChat(): void {
    this.inputText = '';
    this.messages = [];
    this.loading = false;

    this.initSent = false;

    this.isQueued = false;
    this.retrySeconds = 0;
    this.lastUserMessage = null;

    if (this.retryTimer) {
      clearInterval(this.retryTimer);
      this.retryTimer = null;
    }
  }

  private sendInitialContext(): void {
    const policyholderId = localStorage.getItem('userId');

    const payload = {
      policyholderId: Number(policyholderId),
      message: '__INIT__'
    };

    this.loading = true;

    this.http.chatbotMessage(payload).subscribe({
      next: (res: any) => {
        this.messages.push({
          from: 'bot',
          text: res?.reply || 'Hi 👋 I am Claim Bot. Ask me anything about your claims.'
        });
        this.loading = false;
        this.scrollToBottom();
      },
      error: () => {
        this.messages.push({
          from: 'bot',
          text: 'Failed to start chatbot. Please close and open again.'
        });
        this.loading = false;
        this.scrollToBottom();
      }
    });
  }

  sendMessage(): void {
    const text = (this.inputText || '').trim();
    if (!text) return;

    // ✅ block sending while queued
    if (this.isQueued) {
      this.messages.push({
        from: 'bot',
        text: `⏳ You are in queue. Please wait ${this.retrySeconds}s...`
      });
      this.scrollToBottom();
      return;
    }

    const policyholderId = localStorage.getItem('userId');

    // show user message
    this.messages.push({ from: 'user', text });

    // store last message for retry
    this.lastUserMessage = text;

    // clear input
    this.inputText = '';
    this.loading = true;
    this.scrollToBottom();

    const payload = {
      policyholderId: Number(policyholderId),
      message: text
    };

    this.http.chatbotMessage(payload).subscribe({
      next: (res: any) => {
        this.loading = false;

        const reply = res?.reply || 'No response';

        // ✅ detect rate-limit retry seconds from reply
        const sec = this.extractRetrySeconds(reply);
        if (sec > 0) {
          this.messages.push({
            from: 'bot',
            text: `⏳ You are in queue. Retrying in ${sec}s...`
          });
          this.startQueue(sec);
        } else {
          this.messages.push({ from: 'bot', text: reply });
        }

        this.scrollToBottom();
      },
      error: (err: any) => {
        this.loading = false;

        // backend might return text error or json error
        const raw = err?.error?.reply || err?.error || 'Gemini is busy. Please try again later.';
        const replyText = typeof raw === 'string' ? raw : JSON.stringify(raw);

        const sec = this.extractRetrySeconds(replyText);
        if (sec > 0) {
          this.messages.push({
            from: 'bot',
            text: `⏳ You are in queue. Retrying in ${sec}s...`
          });
          this.startQueue(sec);
        } else {
          this.messages.push({
            from: 'bot',
            text: 'Sorry, I could not respond right now.'
          });
        }

        this.scrollToBottom();
      }
    });
  }

  onEnter(event: KeyboardEvent): void {
    // Enter = send, Shift+Enter = new line
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  private startQueue(seconds: number): void {
    this.isQueued = true;
    this.retrySeconds = seconds;

    if (this.retryTimer) {
      clearInterval(this.retryTimer);
      this.retryTimer = null;
    }

    this.retryTimer = setInterval(() => {
      this.retrySeconds--;

      if (this.retrySeconds <= 0) {
        clearInterval(this.retryTimer);
        this.retryTimer = null;
        this.isQueued = false;

        // ✅ auto retry last message once
        if (this.lastUserMessage) {
          const msg = this.lastUserMessage;
          this.lastUserMessage = null;

          this.messages.push({ from: 'bot', text: '✅ Retrying now...' });
          this.scrollToBottom();

          // resend same message
          this.inputText = msg;
          this.sendMessage();
        }
      }
    }, 1000);
  }

  // ✅ extracts retry seconds from common Gemini error messages
  // Supports:
  // "Please retry in 39.11651666s"
  // `"retryDelay":"39s"`
  private extractRetrySeconds(text: string): number {
    if (!text) return 0;

    const m1 = text.match(/retry in\s+([0-9]+(\.[0-9]+)?)s/i);
    if (m1 && m1[1]) return Math.ceil(Number(m1[1]));

    const m2 = text.match(/"retryDelay"\s*:\s*"(\d+)s"/i);
    if (m2 && m2[1]) return Number(m2[1]);

    const m3 = text.match(/retryDelay.*?(\d+)s/i);
    if (m3 && m3[1]) return Number(m3[1]);

    return 0;
  }

  private scrollToBottom(): void {
    try {
      const el = this.chatBody?.nativeElement;
      if (!el) return;
      el.scrollTop = el.scrollHeight;
    } catch {}
  }
}