import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { Header } from './components/shared/layout/header/header';
import { Footer } from './components/shared/layout/footer/footer';
import { Sidebar } from './components/shared/layout/sidebar/sidebar';
import { AuthService } from './services/auth.service';

// Routes that are public and should render WITHOUT the header/sidebar/footer.
const CHROME_FREE_ROUTES = ['/login', '/unauthorized'];

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, Header, Footer, Sidebar],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Store_Management');

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  // Track the current URL reactively so the app shell (header/sidebar/footer)
  // can hide itself on the login screen and show up everywhere else once
  // there's a logged-in user.
  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map(e => e.urlAfterRedirects)
    ),
    { initialValue: this.router.url }
  );

  private readonly isLoggedIn = toSignal(
    this.authService.currentUser$.pipe(map(user => !!user)),
    { initialValue: this.authService.isLoggedIn() }
  );

  get showAppChrome(): boolean {
    const url = this.currentUrl();
    const isChromeFreeRoute = CHROME_FREE_ROUTES.some(route => url.startsWith(route));
    return this.isLoggedIn() && !isChromeFreeRoute;
  }
}
