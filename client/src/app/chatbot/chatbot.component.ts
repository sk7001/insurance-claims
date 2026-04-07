import { Component, ElementRef, OnInit, ViewChild, AfterViewChecked, OnDestroy } from '@angular/core';
import { HttpService } from '../../services/http.service';
import { AuthService } from '../../services/auth.service';
import { SpeechService } from '../../services/speech.service';
import { Subscription } from 'rxjs';

type ChatMsg = {
  from: 'user' | 'bot';
  text: string;
};

@Component({
  selector: 'app-chatbot',
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.scss']
})
export class ChatbotComponent implements OnInit, AfterViewChecked, OnDestroy {

  private shouldScroll = false;

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

  isRecording = false;
  private speechSub: Subscription | null = null;

  @ViewChild('chatBody') chatBody!: ElementRef<HTMLDivElement>;

  constructor(
    private http: HttpService,
    private authService: AuthService,
    public speechService: SpeechService
  ) {}

  ngOnInit(): void {
    const userId = this.authService.getUserId();
    if (userId) {
      this.loadHistory(userId);
    }

    // ✅ Sync with all possible trigger points (Dashboard header, Sidebar, etc.)
    ['open-chat', 'open-chat-bot', 'toggle-chat-nexus'].forEach(evtName => {
      window.addEventListener(evtName, () => {
        if (!this.isOpen) this.toggleChat();
      });
    });

    // ✅ Listen for speech transcripts
    this.speechSub = this.speechService.getTranscript().subscribe((text: string) => {
      this.inputText += (this.inputText ? ' ' : '') + text;
    });
  }

  ngOnDestroy(): void {
    if (this.speechSub) {
      this.speechSub.unsubscribe();
    }
    this.speechService.stop();
  }

  toggleChat(): void {
    this.isOpen = !this.isOpen;

    // ✅ when closing: just hide, don't reset (preserves history)
    if (!this.isOpen) {
      return;
    }

    // ✅ when opening first time in this session: send __INIT__
    if (!this.initSent) {
      this.initSent = true;
      this.sendInitialContext();
    }

    setTimeout(() => this.scrollToBottom(), 50);
  }

  toggleSpeechRecording(): void {
    if (!this.speechService.isSupported()) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    if (this.isRecording) {
      this.speechService.stop();
      this.isRecording = false;
    } else {
      this.speechService.start();
      this.isRecording = true;
    }
  }

  clearChatLogs(): void {
    if (confirm('Are you sure you want to clear your chat history?')) {
      this.messages = [];
      this.initSent = false;
      const userId = this.authService.getUserId();
      if (userId) {
        localStorage.removeItem(`chat_nexus_${userId}`);
      }
      this.toggleChat(); // Close and reopen to trigger fresh __INIT__
      setTimeout(() => this.toggleChat(), 100);
    }
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
    const policyholderId = this.authService.getUserId();

    const payload = {
      policyholderId: Number(policyholderId),
      message: '__INIT__'
    };

    this.loading = true;

    this.http.chatbotMessage(payload).subscribe({
      next: (res: any) => {
        this.messages.push({
          from: 'bot',
          text: res?.reply || 'Hi! I am Nexus AI, your dedicated claims specialist. How can I assist you with your insurance today?'
        });
        this.saveHistory();
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

    const policyholderId = this.authService.getUserId();
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
        this.saveHistory();
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
        this.saveHistory();
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

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.doScroll();
      this.shouldScroll = false;
    }
  }

  private scrollToBottom(): void {
    this.shouldScroll = true;
    // Also fire with a small delay as a fallback
    setTimeout(() => this.doScroll(), 50);
  }

  private doScroll(): void {
    try {
      const el = this.chatBody?.nativeElement;
      if (el) {
        el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
      }
    } catch {}
  }

  public formatText(text: string): string {
    if (!text) return '';
    let f = text.replace(/\*\*(.*?)\*\*/g, '<strong style="color: #fff; font-weight: 800;">$1</strong>');
    f = f.replace(/\n/g, '<br>');
    return f;
  }

  // ✅ HISTORY SYNC
  private saveHistory(): void {
    const userId = this.authService.getUserId();
    if (!userId) return;
    const data = {
      messages: this.messages,
      initSent: this.initSent
    };
    localStorage.setItem(`chat_nexus_${userId}`, JSON.stringify(data));
  }

  private loadHistory(userId: string): void {
    const raw = localStorage.getItem(`chat_nexus_${userId}`);
    if (raw) {
      try {
        const data = JSON.parse(raw);
        this.messages = data.messages || [];
        this.initSent = data.initSent || false;
      } catch {
        this.messages = [];
        this.initSent = false;
      }
    }
  }
}
