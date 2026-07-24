import { Pipe, PipeTransform, inject } from '@angular/core';
import { TranslationService } from '../services/translation.service';

@Pipe({
  name: 'localizeName',
  standalone: true,
  pure: false // Impure so it reacts to signal changes in currentLang
})
export class LocalizeNamePipe implements PipeTransform {
  private translationService = inject(TranslationService);

  transform(enName: string | undefined | null, arName?: string | undefined | null): string {
    if (!enName && !arName) return '';
    const isAr = this.translationService.currentLang() === 'ar';
    
    if (isAr && arName && arName.trim()) {
      return arName.trim();
    }
    
    return (enName || '').trim();
  }
}
