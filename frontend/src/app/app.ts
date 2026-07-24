import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { registerLocaleData } from '@angular/common';
import localeEg from '@angular/common/locales/ar-EG';
import { LoadingComponent } from './components/loading/loading.component';

// Register the Egyptian Arabic locale data
registerLocaleData(localeEg);

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, LoadingComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('frontend');
}
