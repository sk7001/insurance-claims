import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { HttpService } from '../../services/http.service';

@Component({
  selector: 'app-view-claim',
  templateUrl: './view-claim.component.html',
  styleUrls: ['./view-claim.component.scss']
})
export class ViewClaimComponent implements OnInit {

  claimList: any[] = [];
  searchFilter: any[] = [];

  activeClaimsList: any[] = [];
  resolvedClaimsList: any[] = [];

  activeTab: 'pending' | 'completed' = 'pending';

  showError = false;
  errorMessage: any;

  constructor(
    public httpService: HttpService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.getClaimsById();
  }

  private sortByDateDesc(list: any[]): any[] {
    return (list || []).sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  getClaimsById() {
    this.httpService.getClaimsByPolicyholder(this.authService.getUserId()).subscribe({
      next: (res: any) => {
        this.claimList = this.sortByDateDesc(res || []);
        this.searchFilter = [...this.claimList];
        this.updateLists();
      },
      error: () => {
        this.showError = true;
        this.errorMessage = "No claims found";
      }
    });
  }

  /** 🔥 SAME LOGIC AS OTHER COMPONENTS */
  updateLists() {
    this.activeClaimsList = this.searchFilter.filter(c =>
      c.status === 'Initiated' ||
      c.status === 'In progress' ||
      c.status === 'Pending'
    );

    this.resolvedClaimsList = this.searchFilter.filter(c =>
      c.status === 'Approved' ||
      c.status === 'Rejected'
    );
  }

  searchByDescId(event: any) {
    const q = (event.target.value || '').toLowerCase().trim();

    const filtered = this.claimList.filter((claim) => {
      const id = String(claim?.id || '').toLowerCase();
      const desc = claim?.description?.toLowerCase() || '';
      const status = claim?.status?.toLowerCase() || '';

      return (
        id.includes(q) ||
        desc.includes(q) ||
        status.includes(q)
      );
    });

    this.searchFilter = this.sortByDateDesc(filtered);
    this.updateLists();
  }

  setTab(tab: 'pending' | 'completed') {
    this.activeTab = tab;
  }
}