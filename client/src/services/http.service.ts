import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment.development';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  public serverName = environment.apiUrl;

  constructor(private http: HttpClient, private authService: AuthService) { }

  getInvestigations(): Observable<any> {
    const authToken = this.authService.getToken();
    let headers = new HttpHeaders();
    headers = headers.set('Content-Type', 'application/json');
    headers = headers.set('Authorization', `Bearer ${authToken}`);
    return this.http.get(this.serverName + `/api/investigator/investigations`, { headers: headers });
  }

  getClaimsByUnderwriter(id: any): Observable<any> {
    const authToken = this.authService.getToken();
    let headers = new HttpHeaders();
    headers = headers.set('Content-Type', 'application/json');
    headers = headers.set('Authorization', `Bearer ${authToken}`);
    return this.http.get(this.serverName + `/api/underwriter/claims?underwriterId=` + id, { headers: headers });
  }

  getClaimsByPolicyholder(policyholder: any): Observable<any> {
    const authToken = this.authService.getToken();
    let headers = new HttpHeaders();
    headers = headers.set('Content-Type', 'application/json');
    headers = headers.set('Authorization', `Bearer ${authToken}`);
    return this.http.get(this.serverName + `/api/policyholder/claims?policyholderId=` + policyholder, { headers: headers });
  }

  getAllClaims(): Observable<any> {
    const authToken = this.authService.getToken();
    let headers = new HttpHeaders();
    headers = headers.set('Content-Type', 'application/json');
    headers = headers.set('Authorization', `Bearer ${authToken}`);
    return this.http.get(this.serverName + `/api/adjuster/claims`, { headers: headers });
  }

  GetAllUnderwriter(): Observable<any> {
    const authToken = this.authService.getToken();
    let headers = new HttpHeaders();
    headers = headers.set('Content-Type', 'application/json');
    headers = headers.set('Authorization', `Bearer ${authToken}`);
    return this.http.get(this.serverName + `/api/adjuster/underwriters`, { headers: headers });
  }

  updateInvestigation(details: any, investigationId: any): Observable<any> {
    const authToken = this.authService.getToken();
    let headers = new HttpHeaders();
    headers = headers.set('Content-Type', 'application/json');
    headers = headers.set('Authorization', `Bearer ${authToken}`);
    return this.http.put(this.serverName + '/api/investigator/investigation/' + investigationId, details, { headers: headers });
  }

  createInvestigation(details: any): Observable<any> {
    const authToken = this.authService.getToken();
    let headers = new HttpHeaders();
    headers = headers.set('Content-Type', 'application/json');
    headers = headers.set('Authorization', `Bearer ${authToken}`);
    return this.http.post(this.serverName + '/api/investigator/investigation', details, { headers: headers });
  }

  createClaims(details: any, policyholderId: any): Observable<any> {
    const authToken = this.authService.getToken();
    let headers = new HttpHeaders();
    headers = headers.set('Content-Type', 'application/json');
    headers = headers.set('Authorization', `Bearer ${authToken}`);
    return this.http.post(this.serverName + '/api/policyholder/claim?policyholderId=' + policyholderId, details, { headers: headers });
  }

  updateClaims(details: any, claimId: any): Observable<any> {
    const authToken = this.authService.getToken();
    let headers = new HttpHeaders();
    headers = headers.set('Content-Type', 'application/json');
    headers = headers.set('Authorization', `Bearer ${authToken}`);
    return this.http.put(this.serverName + '/api/adjuster/claim/' + claimId, details, { headers: headers });
  }

  updateClaimsStatus(status: any, claimId: any): Observable<any> {
    const authToken = this.authService.getToken();
    let headers = new HttpHeaders();
    headers = headers.set('Content-Type', 'application/json');
    headers = headers.set('Authorization', `Bearer ${authToken}`);
    return this.http.put(this.serverName + '/api/underwriter/claim/' + claimId + '/review?status=' + status, {}, { headers: headers });
  }

  AssignClaim(details: any): Observable<any> {
    const authToken = this.authService.getToken();
    let headers = new HttpHeaders();
    headers = headers.set('Content-Type', 'application/json');
    headers = headers.set('Authorization', `Bearer ${authToken}`);

    // ✅ FIXED: &amp; -> &
    return this.http.put(
      this.serverName
      + '/api/adjuster/claim/' + details.claimId
      + '/assign?underwriterId=' + details.underwriterId
      + '&adjusterId=' + this.authService.getUserId(),
      details,
      { headers: headers }
    );
  }

  Login(details: any): Observable<any> {
    let headers = new HttpHeaders();
    headers = headers.set('Content-Type', 'application/json');
    return this.http.post(this.serverName + '/api/user/login', details, { headers: headers });
  }

  registerUser(details: any): Observable<any> {
    let headers = new HttpHeaders();
    headers = headers.set('Content-Type', 'application/json');
    return this.http.post(this.serverName + '/api/user/register', details, { headers: headers });
  }

  // ✅ Chatbot endpoint
  chatbotMessage(payload: any): Observable<any> {
    const authToken = this.authService.getToken();
    let headers = new HttpHeaders();
    headers = headers.set('Content-Type', 'application/json');
    if (authToken) headers = headers.set('Authorization', `Bearer ${authToken}`);

    return this.http.post(this.serverName + '/api/chatbot/message', payload, { headers });
  }

  /* =========================
     USER PROFILE
  ========================= */
  getUserProfile(id: any): Observable<any> {
    const authToken = this.authService.getToken();
    let headers = new HttpHeaders();
    headers = headers.set('Content-Type', 'application/json');
    headers = headers.set('Authorization', `Bearer ${authToken}`);
    return this.http.get(this.serverName + `/api/user/profile/${id}`, { headers });
  }

  updateProfile(id: any, data: any): Observable<any> {
    const authToken = this.authService.getToken();
    let headers = new HttpHeaders();
    headers = headers.set('Content-Type', 'application/json');
    headers = headers.set('Authorization', `Bearer ${authToken}`);
    return this.http.put(this.serverName + `/api/user/profile/${id}`, data, { headers });
  }

  /* =========================
     FORGOT PASSWORD (OTP FLOW)
  ========================= */
  requestOtp(email: string): Observable<any> {
    return this.http.post(this.serverName + `/api/user/forgot-password/request-otp/${email}`, {}, { responseType: 'text' });
  }

  verifyOtpOnly(email: string, otp: string): Observable<any> {
    return this.http.post(this.serverName + `/api/user/forgot-password/verify-otp?email=${email}&otp=${otp}`, {}, { responseType: 'text' });
  }

  verifyReset(payload: any): Observable<any> {
    return this.http.post(this.serverName + `/api/user/forgot-password/verify-reset`, payload, { responseType: 'text' });
  }

  getAllUsers() {
    const authToken = this.authService.getToken();
    let headers = new HttpHeaders();
    headers = headers.set('Content-Type', 'application/json');
    headers = headers.set('Authorization', `Bearer ${authToken}`);
    return this.http.get(this.serverName + `/api/admin/users`, { headers: headers });
  }
  rejectUser(userId: any) {
    const authToken = this.authService.getToken();    
    let headers = new HttpHeaders();
    headers = headers.set('Content-Type', 'application/json');
    headers = headers.set('Authorization', `Bearer ${authToken}`);
    return this.http.delete(this.serverName + `/api/admin/reject/${userId}`, { headers: headers });
  }
  getPendingUsers() {
    const authToken = this.authService.getToken();
    let headers = new HttpHeaders();
    headers = headers.set('Content-Type', 'application/json');
    headers = headers.set('Authorization', `Bearer ${authToken}`);
    return this.http.get(this.serverName + `/api/admin/pending`, { headers: headers });
  }
  approveUser(userId: any) {
    const authToken = this.authService.getToken();
    let headers = new HttpHeaders();
    headers = headers.set('Content-Type', 'application/json');
    headers = headers.set('Authorization', `Bearer ${authToken}`);
    return this.http.post(this.serverName + `/api/admin/approve/${userId}`, { headers: headers });
  }
}