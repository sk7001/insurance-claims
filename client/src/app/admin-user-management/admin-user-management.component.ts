import { Component, OnInit } from '@angular/core';
import { HttpService } from '../../services/http.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-user-management',
  templateUrl: './admin-user-management.component.html',
  styleUrls: ['./admin-user-management.component.scss']
})
export class AdminUserManagementComponent implements OnInit {
  pendingUsers: any[] = [];
  allUsers: any[] = [];
  filteredUsers: any[] = [];
  currentTab: string = 'pending'; // 'pending', 'policyholders', 'adjusters', 'underwriters'

  constructor(private httpService: HttpService, private authService: AuthService) {}

  ngOnInit(): void {
    this.loadPendingUsers();
    this.loadAllUsers();
  }

  loadPendingUsers() {
    this.httpService.getPendingUsers().subscribe((res: any) => {
      this.pendingUsers = res;
    });
  }

  loadAllUsers() {
    this.httpService.getAllUsers().subscribe((res: any) => {
      this.allUsers = res;
      this.filterByRole(this.currentTab);
    });
  }

  setTab(tab: string) {
    this.currentTab = tab;
    if (tab === 'pending') {
      this.loadPendingUsers();
    } else {
      this.filterByRole(tab);
    }
  }

  filterByRole(tab: string) {
    const roleMap: any = {
      'policyholders': 'POLICYHOLDER',
      'adjusters': 'ADJUSTER',
      'underwriters': 'UNDERWRITER'
    };
    const role = roleMap[tab];
    if (role) {
      this.filteredUsers = this.allUsers.filter(u => u.role === role);
    }
  }

  approveUser(userId: any) {
    this.httpService.approveUser(userId).subscribe(() => {
      this.loadPendingUsers();
      this.loadAllUsers();
    });
  }

  rejectUser(userId: any) {
    if (confirm('Are you sure you want to reject and delete this request?')) {
      this.httpService.rejectUser(userId).subscribe(() => {
        this.loadPendingUsers();
        this.loadAllUsers();
      });
    }
  }
}
