import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  get username(): string {
    return this.authService.currentUser?.username ?? '';
  }

  get roleName(): string {
    return this.authService.currentUser?.roleName ?? '';
  }

  get branchName(): string | null {
    return this.authService.currentUser?.branchName ?? null;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
