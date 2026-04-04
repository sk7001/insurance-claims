import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { HttpService } from '../../services/http.service';

@Component({
  selector: 'app-dashbaord',
  templateUrl: './dashbaord.component.html',
  styleUrls: ['./dashbaord.component.scss']
})
export class DashbaordComponent implements OnInit, OnDestroy, AfterViewChecked {

  @ViewChild('chatBody') chatBodyRef!: ElementRef;

  // ───────── USER & DATA ─────────
  role!: string | null;
  userId!: string | null;
  userName = 'User';
  currentTime = '';
  private timerInt: any;
  private shouldScroll = false;

  metrics = {
    totalClaims: 0,
    claimsInitiated: 0,
    approved: 0,
    pending: 0,
    rejected: 0
  };

  kpiCards = [
    { label: 'Total Claims', value: 0, color: 'blue' },
    { label: 'Initiated', value: 0, color: 'purple' },
    { label: 'Approved', value: 0, color: 'green' },
    { label: 'Pending', value: 0, color: 'amber' },
    { label: 'Rejected', value: 0, color: 'red' }
  ];

  claims: any[] = [];
  showViewAllMenu = false;

  // ───────── AI CHATBOT STATE ─────────
  chatOpen = false;
  chatInput = '';
  isTyping = false;
  chatMessages: { from: 'user' | 'bot'; text: string; time: string }[] = [];
  quickReplies: string[] = ['Show pending claims', 'Show approved claims', 'Total claims summary'];
  
  private initSent = false;
  isQueued = false;
  retrySeconds = 0;
  private retryTimer: any = null;
  private lastUserMessage: string | null = null;

  constructor(private authService: AuthService, private httpService: HttpService) {}

  ngOnInit(): void {
    this.role = this.authService.getRole;
    this.userId = localStorage.getItem('userId');
    this.userName = localStorage.getItem('name') || 'User';

    this.updateClock();
    this.timerInt = setInterval(() => this.updateClock(), 1000);
    this.loadDashboardData();

    // Listen for global triggers (Sidebar/Header)
    window.addEventListener('open-chat', () => { if (!this.chatOpen) this.toggleChat(); });
  }

  ngOnDestroy(): void { clearInterval(this.timerInt); if (this.retryTimer) clearInterval(this.retryTimer); }

  ngAfterViewChecked(): void { if (this.shouldScroll) { this.scrollBottom(); this.shouldScroll = false; } }

  // ───────── API & DATA ─────────
  loadDashboardData() {
    if (this.role === 'ADJUSTER' || this.role === 'ADMIN') { this.httpService.getAllClaims().subscribe(res => this.processClaims(res)); }
    else if (this.role === 'POLICYHOLDER') { this.httpService.getClaimsByPolicyholder(this.userId).subscribe(res => this.processClaims(res)); }
    else if (this.role === 'UNDERWRITER') { this.httpService.getClaimsByUnderwriter(this.userId).subscribe(res => this.processClaims(res)); }
    else if (this.role === 'INVESTIGATOR') { this.httpService.getInvestigations().subscribe(res => this.processClaims(res)); }
  }

  processClaims(data: any[]) {
    if (!data) return;
    let initiated = 0, approved = 0, pending = 0, rejected = 0;

    this.claims = data.map(c => {
      const status = c.status || 'Initiated';
      if (status === 'Initiated') initiated++; else if (status === 'Approved') approved++; else if (status === 'Rejected') rejected++; else pending++;
      return { id: 'CLM-' + c.id, desc: c.description || c.insuranceType || 'Claim Detail', status, date: new Date(c.date).toLocaleDateString(), severity: status === 'Rejected' ? 'high' : (status === 'Approved' ? 'low' : 'med'), val: '$' + (Math.floor(Math.random() * 1000) + 100) };
    });

    this.metrics = { totalClaims: data.length, claimsInitiated: initiated, approved, pending, rejected };
    this.kpiCards.forEach((k, i) => { k.value = Object.values(this.metrics)[i]; });
  }

  // ───────── AI CHATBOT LOGIC ─────────
  toggleChat() {
    this.chatOpen = !this.chatOpen;
    this.shouldScroll = true;
    if (this.chatOpen && !this.initSent) { this.initSent = true; this.sendInitialContext(); }
  }

  private sendInitialContext() {
    this.isTyping = true;
    this.httpService.chatbotMessage({ policyholderId: Number(this.userId), message: '__INIT__' }).subscribe({
      next: (res: any) => {
        this.isTyping = false;
        this.chatMessages.push({ from: 'bot', text: res?.reply || `Hey ${this.userName}! 👋 How can I help?`, time: this.getTimeStr() });
        this.shouldScroll = true;
      },
      error: () => { this.isTyping = false; }
    });
  }

  sendMessage() {
    const text = (this.chatInput || '').trim();
    if (!text || this.isQueued) return;

    this.chatMessages.push({ from: 'user', text, time: this.getTimeStr() });
    this.lastUserMessage = text; this.chatInput = ''; this.isTyping = true; this.shouldScroll = true;

    this.httpService.chatbotMessage({ policyholderId: Number(this.userId), message: text }).subscribe({
      next: (res: any) => {
        this.isTyping = false;
        const reply = res?.reply || 'No response';
        const sec = this.extractRetrySeconds(reply);
        if (sec > 0) { this.chatMessages.push({ from: 'bot', text: `⏳ Rate limit. Retrying in ${sec}s...`, time: this.getTimeStr() }); this.startQueue(sec); } 
        else { this.chatMessages.push({ from: 'bot', text: reply, time: this.getTimeStr() }); }
        this.shouldScroll = true;
      },
      error: (err: any) => {
        this.isTyping = false;
        const raw = err?.error?.reply || 'Busy. Try later.';
        const sec = this.extractRetrySeconds(typeof raw === 'string' ? raw : JSON.stringify(raw));
        if (sec > 0) { this.startQueue(sec); } else { this.chatMessages.push({ from: 'bot', text: 'Error contacting AI.', time: this.getTimeStr() }); }
      }
    });
  }

  sendQuickReply(q: string) { this.chatInput = q; this.sendMessage(); }

  private startQueue(seconds: number) {
    this.isQueued = true; this.retrySeconds = seconds;
    this.retryTimer = setInterval(() => {
      this.retrySeconds--;
      if (this.retrySeconds <= 0) { clearInterval(this.retryTimer); this.isQueued = false; if (this.lastUserMessage) { this.chatInput = this.lastUserMessage; this.lastUserMessage = null; this.sendMessage(); } }
    }, 1000);
  }

  private extractRetrySeconds(text: string): number {
    const m = text.match(/retry in\s+([0-9]+)s/i) || text.match(/"retryDelay"\s*:\s*"(\d+)s"/i);
    return m ? Number(m[1]) : 0;
  }

  // ───────── UTILS ─────────
  updateClock() { const n = new Date(); let h = n.getHours(); const m = String(n.getMinutes()).padStart(2, '0'); const s = String(n.getSeconds()).padStart(2, '0'); const ap = h >= 12 ? 'PM' : 'AM'; h = h % 12 || 12; this.currentTime = `${h}:${m}:${s} ${ap}`; }
  getGreeting(): string { const h = new Date().getHours(); return h < 12 ? 'Good Morning' : h < 18 ? 'Good Afternoon' : 'Good Evening'; }
  getTimeStr(): string { const n = new Date(); let h = n.getHours(); const m = String(n.getMinutes()).padStart(2, '0'); const ap = h >= 12 ? 'PM' : 'AM'; h = h % 12 || 12; return `${h}:${m} ${ap}`; }
  toggleViewAll() { this.showViewAllMenu = !this.showViewAllMenu; }
  private scrollBottom() { try { const el = this.chatBodyRef?.nativeElement; if (el) el.scrollTop = el.scrollHeight; } catch {} }
}
