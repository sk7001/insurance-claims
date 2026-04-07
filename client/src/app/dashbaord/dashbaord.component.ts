import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { HttpService } from '../../services/http.service';

@Component({
  selector: 'app-dashbaord',
  templateUrl: './dashbaord.component.html',
  styleUrls: ['./dashbaord.component.scss']
})
export class DashbaordComponent implements OnInit, OnDestroy, AfterViewInit {
  role!: string | null;
  userId!: string | null;

  userName = 'User';
  currentTime = '';
  private timerInt: any;

  // ✅ donut animation trigger
  animateDonut = false;

  // ✅ FAST count-up (petrol meter)
  private readonly FAST_DURATION = 600;

  // ✅ Wait until card animations finish, then start counting
  private readonly COUNT_AFTER_ANIM_DELAY = 1200; // ms (based on your CSS)

  // ✅ gates
  private animationsDone = false;
  private dataReady = false;

  // ✅ UI shows these (animated)
  metrics = {
    totalClaims: 0,
    claimsInitiated: 0,
    approved: 0,
    pending: 0,
    rejected: 0
  };

  // ✅ final backend values stored here
  actualMetrics = {
    totalClaims: 0,
    claimsInitiated: 0,
    approved: 0,
    pending: 0,
    rejected: 0
  };

  // ✅ KPI order SAME as metricKeys
  kpiCards = [
    { label: 'Total Claims', value: 0, color: 'blue', icon: 'bi-stack' },
    { label: 'Initiated', value: 0, color: 'purple', icon: 'bi-file-earmark-plus' },
    { label: 'Approved', value: 0, color: 'green', icon: 'bi-check-circle-fill' },
    { label: 'Pending', value: 0, color: 'amber', icon: 'bi-hourglass-split' },
    { label: 'Rejected', value: 0, color: 'red', icon: 'bi-x-circle-fill' }
  ];

  private readonly metricKeys: (keyof typeof this.metrics)[] = [
    'totalClaims',
    'claimsInitiated',
    'approved',
    'pending',
    'rejected'
  ];

  claims: any[] = [];
  donutSegments: any[] = [];
  showViewAllMenu = false;

  constructor(
    private authService: AuthService,
    private httpService: HttpService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.role = this.authService.getRole;
    this.userId = this.authService.getUserId();
    this.userName = this.authService.getFullName || this.authService.getUsername || 'User';

    // reset gates when page loads
    this.animationsDone = false;
    this.dataReady = false;

    this.updateClock();
    this.timerInt = setInterval(() => this.updateClock(), 1000);

    this.loadDashboardData();
  }

  ngAfterViewInit(): void {
    // ✅ After cards finish animating, allow counting to start
    setTimeout(() => {
      this.animationsDone = true;
      this.tryStartCounting();
    }, this.COUNT_AFTER_ANIM_DELAY);
  }

  ngOnDestroy(): void {
    clearInterval(this.timerInt);
  }

  // ✅ petrol-bunk count up engine
  private animateNumber(from: number, to: number, duration: number, setter: (v: number) => void) {
    const startTime = performance.now();
    const diff = to - from;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // easeOutCubic => fast + smooth
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(from + diff * eased);

      setter(value);

      if (progress < 1) requestAnimationFrame(tick);
      else setter(to);
    };

    requestAnimationFrame(tick);
  }

  onKpiCardClick(): void {
    if (this.role === 'POLICYHOLDER') {
      this.router.navigate(['/view-claim-status']);
    }
  }

  loadDashboardData() {
    // reset donut animation so it replays
    this.animateDonut = false;

    if (this.role === 'ADJUSTER' || this.role === 'ADMIN') {
      this.httpService.getAllClaims().subscribe((res: any) => this.processClaims(res));
    } else if (this.role === 'POLICYHOLDER') {
      this.httpService.getClaimsByPolicyholder(this.userId).subscribe((res: any) => this.processClaims(res));
    } else if (this.role === 'UNDERWRITER') {
      this.httpService.getClaimsByUnderwriter(this.userId).subscribe((res: any) => this.processClaims(res));
    } else if (this.role === 'INVESTIGATOR') {
      this.httpService.getInvestigations().subscribe((res: any) => this.processClaims(res));
    } else {
      this.httpService.getAllClaims().subscribe((res: any) => this.processClaims(res));
    }
  }

  processClaims(data: any[]) {
    if (!data) return;

    let initiated = 0, approved = 0, pending = 0, rejected = 0;

    // Map claims for list
    this.claims = data.map((c) => {
      const status = c.status || 'Initiated';

      if (status === 'Initiated') initiated++;
      else if (status === 'Approved') approved++;
      else if (status === 'Rejected') rejected++;
      else pending++;

      return {
        id: 'CLM-' + c.id,
        status,
        cssClass: status.toLowerCase().split(' ').join('-'),
        date: c.date ? new Date(c.date).toLocaleDateString() : ''
      };
    });

    // ✅ Final values from backend (store only, don't animate yet)
    this.actualMetrics = {
      totalClaims: data.length,
      claimsInitiated: initiated,
      approved,
      pending,
      rejected
    };

    // ✅ Donut segments compute (store now, animate later)
    const circumference = 502.65;
    const total = data.length || 1;
    let cumulative = 0;

    const statuses = [
      { key: 'Approved', count: approved, color: '#10b981', icon: 'bi-check-circle-fill' },
      { key: 'Pending', count: pending, color: '#f59e0b', icon: 'bi-hourglass-split' },
      { key: 'Initiated', count: initiated, color: '#3b82f6', icon: 'bi-file-earmark-plus' },
      { key: 'Rejected', count: rejected, color: '#ef4444', icon: 'bi-x-circle-fill' }
    ];

    this.donutSegments = statuses
      .filter(s => s.count > 0)
      .map(s => {
        const pct = s.count / total;
        const len = pct * circumference;

        const seg = {
          label: s.key,
          count: s.count,
          color: s.color,
          icon: s.icon,
          dasharray: `${len} ${circumference}`,
          dashoffset: -cumulative
        };

        cumulative += len;
        return seg;
      });

    // ✅ data is ready, now wait for animationsDone
    this.dataReady = true;
    this.tryStartCounting();
  }

  // ✅ Start counting ONLY when:
  // 1) data is ready
  // 2) card animations are finished
  private tryStartCounting() {
    if (!this.dataReady || !this.animationsDone) return;

    // ✅ Linked animation: Overview + KPI update together
    this.metricKeys.forEach((key, index) => {
      const to = this.actualMetrics[key];

      // overview metrics
      this.animateNumber(this.metrics[key], to, this.FAST_DURATION, (v) => {
        this.metrics[key] = v;
      });

      // KPI cards linked in same order
      if (this.kpiCards[index]) {
        this.animateNumber(this.kpiCards[index].value, to, this.FAST_DURATION, (v) => {
          this.kpiCards[index].value = v;
        });
      }
    });

    // ✅ Start donut AFTER counting begins (small delay looks premium)
    setTimeout(() => {
      this.animateDonut = true;
    }, 80);
  }

  updateClock() {
    const n = new Date();
    let h = n.getHours();
    const m = String(n.getMinutes()).padStart(2, '0');
    const s = String(n.getSeconds()).padStart(2, '0');
    const ap = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    this.currentTime = `${h}:${m}:${s} ${ap}`;
  }

  getGreeting(): string {
    const h = new Date().getHours();
    return h < 12 ? 'Good Morning' : h < 18 ? 'Good Afternoon' : 'Good Evening';
  }

  toggleViewAll() {
    this.showViewAllMenu = !this.showViewAllMenu;
  }
}