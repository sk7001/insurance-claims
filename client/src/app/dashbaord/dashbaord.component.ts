import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { HttpService } from '../../services/http.service';

@Component({
  selector: 'app-dashbaord',
  templateUrl: './dashbaord.component.html',
  styleUrls: ['./dashbaord.component.scss']
})
export class DashbaordComponent implements OnInit, OnDestroy, AfterViewChecked {
  // ───────── USER & DATA ─────────
  role!: string | null;
  userId!: string | null;
  userName = 'User';
  currentTime = '';
  private timerInt: any;
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
  donutSegments: any[] = [];

  constructor(private authService: AuthService, private httpService: HttpService, private router: Router) {}

  ngOnInit(): void {
    this.role = this.authService.getRole;
    this.userId = this.authService.getUserId();
    this.userName = this.authService.getFullName || this.authService.getUsername || '';

    this.updateClock();
    this.timerInt = setInterval(() => this.updateClock(), 1000);
    this.loadDashboardData();
  }

  ngOnDestroy(): void { clearInterval(this.timerInt); }

  ngAfterViewChecked(): void { }

  // ───────── NAVIGATION ─────────
  goToProfile() {
    this.router.navigate(['/profile']);
  }

  // ───────── API & DATA ─────────
  loadDashboardData() {
    if (this.role === 'ADJUSTER' || this.role === 'ADMIN') { this.httpService.getAllClaims().subscribe((res: any) => this.processClaims(res)); }
    else if (this.role === 'POLICYHOLDER') { this.httpService.getClaimsByPolicyholder(this.userId).subscribe((res: any) => this.processClaims(res)); }
    else if (this.role === 'UNDERWRITER') { this.httpService.getClaimsByUnderwriter(this.userId).subscribe((res: any) => this.processClaims(res)); }
    else if (this.role === 'INVESTIGATOR') { this.httpService.getInvestigations().subscribe((res: any) => this.processClaims(res)); }
  }

  processClaims(data: any[]) {
    if (!data) return;
    let initiated = 0, approved = 0, pending = 0, rejected = 0;

    this.claims = data.map(c => {
      const status = c.status || 'Initiated';
      if (status === 'Initiated') initiated++; else if (status === 'Approved') approved++; else if (status === 'Rejected') rejected++; else pending++;
      return { id: 'CLM-' + c.id, desc: c.description || c.insuranceType || 'Claim Detail', status, cssClass: status.toLowerCase().split(' ').join('-'), date: new Date(c.date).toLocaleDateString(), severity: status === 'Rejected' ? 'high' : (status === 'Approved' ? 'low' : 'med'), val: '$' + (Math.floor(Math.random() * 1000) + 100) };
    });

    this.metrics = { totalClaims: data.length, claimsInitiated: initiated, approved, pending, rejected };
    this.kpiCards.forEach((k, i) => { k.value = Object.values(this.metrics)[i]; });

    // Calculate Donut Segments
    const total = data.length || 1;
    let cumulative = 0;
    const statuses = [
      { key: 'Approved', count: approved, color: '#10b981' },
      { key: 'Pending', count: pending, color: '#f59e0b' },
      { key: 'Initiated', count: initiated, color: '#3b82f6' },
      { key: 'Rejected', count: rejected, color: '#ef4444' }
    ];

    this.donutSegments = statuses
      .filter(s => s.count > 0)
      .map(s => {
        const percentage = s.count / total;
        const length = percentage * 502.65;
        const segment = {
          label: s.key,
          count: s.count,
          color: s.color,
          dasharray: `${length} 502.65`,
          dashoffset: -cumulative
        };
        cumulative += length;
        return segment;
      });
  }



  // ───────── UTILS ─────────
  updateClock() { const n = new Date(); let h = n.getHours(); const m = String(n.getMinutes()).padStart(2, '0'); const s = String(n.getSeconds()).padStart(2, '0'); const ap = h >= 12 ? 'PM' : 'AM'; h = h % 12 || 12; this.currentTime = `${h}:${m}:${s} ${ap}`; }
  getGreeting(): string { const h = new Date().getHours(); return h < 12 ? 'Good Morning' : h < 18 ? 'Good Afternoon' : 'Good Evening'; }
  getTimeStr(): string { const n = new Date(); let h = n.getHours(); const m = String(n.getMinutes()).padStart(2, '0'); const ap = h >= 12 ? 'PM' : 'AM'; h = h % 12 || 12; return `${h}:${m} ${ap}`; }
  toggleViewAll() { this.showViewAllMenu = !this.showViewAllMenu; }
}
