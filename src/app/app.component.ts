import { Component } from '@angular/core';
import { PermissionService } from './permissions.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor(
    private permissionService: PermissionService
  ) { }

  title = 'app';
}
