import { Component, OnInit } from '@angular/core';
import { HttpService } from '../../services/http.service';

@Component({
  selector: 'app-admin-claims',
  templateUrl: './admin-claims.component.html',
  styleUrls: ['./admin-claims.component.scss']
})
export class AdminClaimsComponent implements OnInit {
  allClaims: any[] = [];
  filteredClaims: any[] = [];
  searchTerm: string = '';
  statusFilter: string = 'all';

  constructor(private httpService: HttpService) {}

  ngOnInit(): void {
    this.loadAllClaims();
  }

  loadAllClaims() {
    this.httpService.getAllClaims().subscribe((res: any) => {
      this.allClaims = res;
      this.applyFilters();
    });
  }

  applyFilters() {
    this.filteredClaims = this.allClaims.filter(c => {
      const matchesSearch = c.id.toString().includes(this.searchTerm) || 
                           (c.description && c.description.toLowerCase().includes(this.searchTerm.toLowerCase()));
      const matchesStatus = this.statusFilter === 'all' || c.status.toLowerCase() === this.statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }

  getStatusClass(status: string): string {
    const s = status.toLowerCase();
    if (s.includes('approved')) return 'status-approved';
    if (s.includes('pending')) return 'status-pending';
    if (s.includes('rejected')) return 'status-rejected';
    return '';
  }
}
