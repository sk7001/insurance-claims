import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { HttpService } from '../../services/http.service';

@Component({
  selector: 'app-dashbaord',
  templateUrl: './dashbaord.component.html',
  styleUrls: ['./dashbaord.component.scss']
})
export class DashbaordComponent implements OnInit {

  role!: string | null;
  userId!: string | null;

  stats = {
    total: 0,
    approved: 0,
    rejected: 0,
    inProgress: 0,
    initiated: 0
  };

  constructor(
    private authService: AuthService,
    private httpService: HttpService
  ) { }

  ngOnInit(): void {
    this.role = this.authService.getRole;
    this.userId = localStorage.getItem('userId');

    this.loadDashboardStats();
  }

  loadDashboardStats() {

    if (this.role === 'ADJUSTER') {
      this.httpService.getAllClaims().subscribe(claims => {
        this.calculateStats(claims);
      });
    }

    if (this.role === 'POLICYHOLDER') {
      this.httpService.getClaimsByPolicyholder(this.userId).subscribe(claims => {
        this.calculateStats(claims);
      });
    }

    if (this.role === 'UNDERWRITER') {
      this.httpService.getClaimsByUnderwriter(this.userId).subscribe(claims => {
        this.calculateStats(claims);
      });
    }
  }

  /* ✅ FINAL STATUS LOGIC */
  calculateStats(claims: any[]) {

    this.stats.total = claims.length;

    this.stats.approved = claims.filter(
      c => c.status === 'Approved'
    ).length;

    this.stats.rejected = claims.filter(
      c => c.status === 'Rejected'
    ).length;

    this.stats.inProgress = claims.filter(
      c => c.status === 'In progress'
    ).length;

    this.stats.initiated = claims.filter(
      c => c.status === 'Initiated'
    ).length;
  }
}