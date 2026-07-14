import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'regulateText',
})
export class RegulateTextPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';

    // 1. Replace all underscores with spaces
    // 2. Convert everything to lowercase
    const withSpaces = value.replace(/_/g, ' ').toLowerCase();

    // 3. Capitalize the first letter of each word (Title Case)
    return withSpaces.replace(/\b\w/g, (char) => char.toUpperCase());
  }
}
