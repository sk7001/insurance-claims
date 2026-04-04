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

  ngOnInit(): void {
    // ✅ Sync with all possible trigger points (Dashboard header, Sidebar, etc.)
    ['open-chat', 'open-chat-bot', 'toggle-chat-nexus'].forEach(evtName => {
      window.addEventListener(evtName, () => {
        if (!this.isOpen) this.toggleChat();
      });
    });
  }

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
          text: res?.reply || 'Hi 👋 I am Nexus AI. How can I help you with your claims today?'
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

    if (this.isQueued) {
      this.messages.push({
        from: 'bot',
        text: `⏳ You are in queue. Please wait ${this.retrySeconds}s...`
      });
      this.scrollToBottom();
      return;
    }

    const policyholderId = localStorage.getItem('userId');
    this.messages.push({ from: 'user', text });
    this.lastUserMessage = text;
    this.inputText = '';
    this.loading = true;
    this.scrollToBottom();

    this.http.chatbotMessage({ policyholderId: Number(policyholderId), message: text }).subscribe({
      next: (res: any) => {
        this.loading = false;
        const reply = res?.reply || 'No response';
        const sec = this.extractRetrySeconds(reply);
        if (sec > 0) {
          this.messages.push({ from: 'bot', text: `⏳ Rate limit hit. Retrying in ${sec}s...` });
          this.startQueue(sec);
        } else {
          this.messages.push({ from: 'bot', text: reply });
        }
        this.scrollToBottom();
      },
      error: (err: any) => {
        this.loading = false;
        const raw = err?.error?.reply || err?.error || 'Busy. Try later.';
        const replyText = typeof raw === 'string' ? raw : JSON.stringify(raw);
        const sec = this.extractRetrySeconds(replyText);
        if (sec > 0) {
          this.messages.push({ from: 'bot', text: `⏳ Rate limit hit. Retrying in ${sec}s...` });
          this.startQueue(sec);
        } else {
          this.messages.push({ from: 'bot', text: 'Sorry, I encountered an error.' });
        }
        this.scrollToBottom();
      }
    });
  }

  onEnter(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  private startQueue(seconds: number): void {
    this.isQueued = true;
    this.retrySeconds = seconds;
    if (this.retryTimer) clearInterval(this.retryTimer);
    this.retryTimer = setInterval(() => {
      this.retrySeconds--;
      if (this.retrySeconds <= 0) {
        clearInterval(this.retryTimer);
        this.retryTimer = null;
        this.isQueued = false;
        if (this.lastUserMessage) {
          const msg = this.lastUserMessage;
          this.lastUserMessage = null;
          this.inputText = msg;
          this.sendMessage();
        }
      }
    }, 1000);
  }

  private extractRetrySeconds(text: string): number {
    if (!text) return 0;
    const m1 = text.match(/retry in\s+([0-9]+(\.[0-9]+)?)s/i);
    if (m1 && m1[1]) return Math.ceil(Number(m1[1]));
    const m2 = text.match(/"retryDelay"\s*:\s*"(\d+)s"/i);
    const m3 = text.match(/retryDelay.*?(\d+)s/i);
    return m2 ? Number(m2[1]) : (m3 ? Number(m3[1]) : 0);
  }

  private scrollToBottom(): void {
    try {
      const el = this.chatBody?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    } catch {}
  }
}
