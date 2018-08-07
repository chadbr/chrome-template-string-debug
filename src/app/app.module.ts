import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';


import { AppComponent } from './app.component';
import { UserService } from './user.service';
import { PermissionService } from './permissions.service';


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule
  ],
  providers: [PermissionService, UserService, HttpClient],
  bootstrap: [AppComponent]
})
export class AppModule { }
