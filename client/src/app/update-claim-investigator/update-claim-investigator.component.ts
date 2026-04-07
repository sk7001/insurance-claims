import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { HttpService } from '../../services/http.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-update-claim-investigator',
  templateUrl: './update-claim-investigator.component.html',
  styleUrls: ['./update-claim-investigator.component.scss']
})
export class UpdateClaimInvestigatorComponent implements OnInit {

  claimList: any[] = [];
  searchFilter: any[] = [];

  activeClaimsList: any[] = [];
  resolvedClaimsList: any[] = [];

  activeTab: 'pending' | 'completed' = 'pending';
  
  showError: boolean = false;
  errorMessage: any;

  constructor(
    private httpService: HttpService,
    private authService: AuthService,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
    this.getClaims();
  }

  private sortByDateDesc(list: any[]): any[] {
    return (list || []).sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  getClaims() {
    const userId = this.authService.getUserId();
    if (!userId) return;

    this.httpService.getClaimsByUnderwriter(userId).subscribe({
      next: (res: any) => {
        this.claimList = this.sortByDateDesc(res || []);
        this.searchFilter = [...this.claimList];
        this.updateLists();
      },
      error: (err: any) => {
        this.showError = true;
        this.errorMessage = err;
      }
    });
  }

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
      return (
        String(claim?.id || '').toLowerCase().includes(q) ||
        claim?.description?.toLowerCase().includes(q) ||
        claim?.status?.toLowerCase().includes(q) ||
        claim?.insuranceType?.toLowerCase().includes(q) ||
        claim?.policyholder?.username?.toLowerCase().includes(q) ||
        claim?.policyholder?.email?.toLowerCase().includes(q)
      );
    });

    this.searchFilter = this.sortByDateDesc(filtered);
    this.updateLists();
  }

  setTab(tab: 'pending' | 'completed') {
    this.activeTab = tab;
  }

  // ✅ MAIN LOGIC for Approve/Reject using correct Underwriter API
  updateStatus(claim: any, status: string) {
    const originalStatus = claim.status;
    claim.status = status;

    this.httpService.updateClaimsStatus(status, claim.id).subscribe({
      next: () => {
        this.toastService.show(`Claim ${status}`, 'success');

        // Move to completed list instantly
        this.activeClaimsList = this.activeClaimsList.filter(c => c.id !== claim.id);
        this.resolvedClaimsList.unshift(claim);
        
        // Ensure reflected in original list
        const index = this.claimList.findIndex(c => c.id === claim.id);
        if (index !== -1) {
          this.claimList[index].status = status;
        }
      },
      error: () => {
        claim.status = originalStatus; // revert on failure
        this.toastService.show('Error updating claim status', 'error');
      }
    });
  }
}