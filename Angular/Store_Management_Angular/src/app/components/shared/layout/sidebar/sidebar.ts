import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';
import { FEATURE_ROLES, FeatureKey, AppRole } from '../../../../model/role-permissions.model';

@Component({
  selector: 'app-sidebar',
  imports: [RouterModule, CommonModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  private readonly authService = inject(AuthService);

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  // Single check the template uses for every menu item:
  // *ngIf="canSee('purchases')" etc. Keeps sidebar.html and app.routes.ts
  // reading from the exact same FEATURE_ROLES config, so a role's access
  // only ever needs to change in one place.
  canSee(feature: FeatureKey): boolean {
    const allowedRoles = FEATURE_ROLES[feature] as AppRole[];
    return this.authService.hasRole(...allowedRoles);
  }
}
