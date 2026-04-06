import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RegistrationComponent } from './registration/registration.component';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { HttpService } from '../services/http.service';
import { DashbaordComponent } from './dashbaord/dashbaord.component';
import { CreateClaimComponent } from './create-claim/create-claim.component';

import { UpdateClaimComponent } from './update-claim/update-claim.component';
import { AssignClaimComponent } from './assign-claim/assign-claim.component';
import { CreateInvestigatorComponent } from './create-investigator/create-investigator.component';
import { UpdateClaimInvestigatorComponent } from './update-claim-investigator/update-claim-investigator.component';
import { NavbarComponent } from './navbar/navbar.component';
import { ViewClaimComponent } from './view-claim/view-claim.component';
import { ChatbotComponent } from './chatbot/chatbot.component';
import { ProfileComponent } from './profile/profile.component';
import { SpeechService } from '../services/speech.service';
import { AdminUserManagementComponent } from './admin-user-management/admin-user-management.component'; 
import { AdminClaimsComponent } from './admin-claims/admin-claims.component'; 

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegistrationComponent,
    DashbaordComponent,
    CreateClaimComponent,
    UpdateClaimComponent,
    AssignClaimComponent,
    CreateInvestigatorComponent,
    UpdateClaimInvestigatorComponent,
    NavbarComponent,
    ViewClaimComponent,
    ChatbotComponent,
    ProfileComponent,
    AdminUserManagementComponent,
    AdminClaimsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
  ],
  providers: [HttpService, HttpClientModule, SpeechService],
  bootstrap: [AppComponent],
})
export class AppModule { }
