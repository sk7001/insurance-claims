import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment.development';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class HttpService {
  public serverName=environment.apiUrl;
  constructor(private http: HttpClient, private authService:AuthService) {

   }
 

  //addd
  getInvestigations():Observable<any> {
   
    const authToken = this.authService.getToken();
    let headers = new HttpHeaders();
    headers = headers.set('Content-Type', 'application/json');
    headers = headers.set('Authorization', `Bearer ${authToken}`)
    return this.http.get(this.serverName+`/api/investigator/investigations`,{headers:headers});
  }
//addedd
getClaimsByUnderwriter(id:any):Observable<any> {
   
  const authToken = this.authService.getToken();
  let headers = new HttpHeaders();
  headers = headers.set('Content-Type', 'application/json');
  headers = headers.set('Authorization', `Bearer ${authToken}`)
  return this.http.get(this.serverName+`/api/underwriter/claims?underwriterId=`+id,{headers:headers});
}

 //added
  getClaimsByPolicyholder(policyholder:any):Observable<any> {
   
    const authToken = this.authService.getToken();
    let headers = new HttpHeaders();
    headers = headers.set('Content-Type', 'application/json');
    headers = headers.set('Authorization', `Bearer ${authToken}`)
    return this.http.get(this.serverName+`/api/policyholder/claims?policyholderId=`+policyholder,{headers:headers});
  }
  //add
  getAllClaims():Observable<any> {
   
    const authToken = this.authService.getToken();
    let headers = new HttpHeaders();
    headers = headers.set('Content-Type', 'application/json');
    headers = headers.set('Authorization', `Bearer ${authToken}`)
    return this.http.get(this.serverName+`/api/adjuster/claims`,{headers:headers});
  }
  GetAllUnderwriter():Observable<any> {
   
    const authToken = this.authService.getToken();
    let headers = new HttpHeaders();
    headers = headers.set('Content-Type', 'application/json');
    headers = headers.set('Authorization', `Bearer ${authToken}`)
    return this.http.get(this.serverName+`/api/adjuster/underwriters`,{headers:headers});
  }
  ///
  updateInvestigation(details:any,investigationId:any):Observable<any> {
  
    const authToken = this.authService.getToken();
    let headers = new HttpHeaders();
    headers = headers.set('Content-Type', 'application/json');
    headers = headers.set('Authorization', `Bearer ${authToken}`);
    return this.http.put(this.serverName+'/api/investigator/investigation/'+investigationId,details,{headers:headers});
  }
///
  createInvestigation(details:any):Observable<any> {
  
    const authToken = this.authService.getToken();
    let headers = new HttpHeaders();
    headers = headers.set('Content-Type', 'application/json');
    headers = headers.set('Authorization', `Bearer ${authToken}`);
    return this.http.post(this.serverName+'/api/investigator/investigation',details,{headers:headers});
  }

  //added
  createClaims(details:any, policyholderId:any):Observable<any> {
  
    const authToken = this.authService.getToken();
    let headers = new HttpHeaders();
    headers = headers.set('Content-Type', 'application/json');
    headers = headers.set('Authorization', `Bearer ${authToken}`);
    return this.http.post(this.serverName+'/api/policyholder/claim?policyholderId='+policyholderId,details,{headers:headers});
  }
  //addd
  updateClaims(details:any, claimId:any):Observable<any> {
  
    const authToken = this.authService.getToken();
    let headers = new HttpHeaders();
    headers = headers.set('Content-Type', 'application/json');
    headers = headers.set('Authorization', `Bearer ${authToken}`);
    return this.http.put(this.serverName+'/api/adjuster/claim/'+claimId,details,{headers:headers});
  }
    //addd
    updateClaimsStatus(status:any, claimId:any):Observable<any> {
  
      const authToken = this.authService.getToken();
      let headers = new HttpHeaders();
      headers = headers.set('Content-Type', 'application/json');
      headers = headers.set('Authorization', `Bearer ${authToken}`);
      return this.http.put(this.serverName+'/api/underwriter/claim/'+claimId+'/review?status='+status,{},{headers:headers});
    }


  AssignClaim(details:any):Observable<any> {
  
    const authToken = this.authService.getToken();
    let headers = new HttpHeaders();
    headers = headers.set('Content-Type', 'application/json');
    headers = headers.set('Authorization', `Bearer ${authToken}`);
    return this.http.put(this.serverName+'/api/adjuster/claim/'+details.claimId+' /assign?underwriterId='+details.underwriterId,details,{headers:headers});
  }
  Login(details:any):Observable<any> {
    
    let headers = new HttpHeaders();
    headers = headers.set('Content-Type', 'application/json');
    return this.http.post(this.serverName+'/api/user/login',details,{headers:headers});
  }
  registerUser(details:any):Observable<any> {
    let headers = new HttpHeaders();
    headers = headers.set('Content-Type', 'application/json');
    return this.http.post(this.serverName+'/api/user/register',details,{headers:headers});
  }
 
  
  
}
