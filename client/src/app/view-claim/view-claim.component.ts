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
  showError: boolean = false;
  errorMessage: any;
  searchFilter: any[] = [];

  constructor(
    public httpService: HttpService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.getClaimsById();
  }

  /** ✅ helper: sort by date DESC (latest first) */
  private sortByDateDesc(list: any[]): any[] {
    return list.sort((a, b) => {
      const dateA = new Date(a.date).getTime();   // assumes claim.date exists
      const dateB = new Date(b.date).getTime();
      return dateB - dateA; // DESC
    });
  }

  getClaimsById() {
    this.httpService.getClaimsByPolicyholder(localStorage.getItem('userId')).subscribe({
      next: (res: any) => {
        // ✅ store and sort by date desc
        this.claimList = this.sortByDateDesc(res || []);
        this.searchFilter = [...this.claimList]; // keep same sorted order
        console.log(this.claimList);
      },
      error: (err) => {
        this.showError = true;
        this.errorMessage = "No claims found";
      }
    });
  }

  searchByDescId(event: any) {
    const searchInput = (event.target.value || '').toLowerCase().trim();

    const filtered = this.claimList.filter((claim) => {
      return (
        claim.id?.toString().toLowerCase().includes(searchInput) ||
        claim.status?.toString().toLowerCase().includes(searchInput) ||
        claim.description?.toString().toLowerCase().includes(searchInput)
      );
    });

    // ✅ keep filtered list also sorted by date desc
    this.searchFilter = this.sortByDateDesc(filtered);
  }
}