import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslationService } from '../../core/services/translation.service';
import { TranslatePipe } from '../../core/pipes/translate.pipe';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, TranslatePipe],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  private translationService = inject(TranslationService);

  currentLang = this.translationService.currentLang;

  isEn(): boolean {
    return this.currentLang() === 'en';
  }

  isAr(): boolean {
    return this.currentLang() === 'ar';
  }

  toggleLanguage(lang: 'en' | 'ar'): void {
    this.translationService.setLanguage(lang);
  }

  isSidebarOpen = false;

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  // Closes the sidebar when a user clicks a link (only matters on mobile)
  closeSidebar() {
    if (window.innerWidth <= 768) {
      this.isSidebarOpen = false;
    }
  }
}
