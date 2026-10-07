import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [RouterModule],
  template: `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:60vh;text-align:center;gap:12px;">
      <h2>Access denied</h2>
      <p>You don't have permission to view this page.</p>
      <a routerLink="/dashboard">Back to dashboard</a>
    </div>
  `
})
export class UnauthorizedComponent {}
