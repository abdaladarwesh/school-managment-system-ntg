import {
  Component,
  input,
  output,
  computed,
  signal,
  HostListener,
  ElementRef,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ParentResponse } from '../../pages/student-page/service/student-service';

@Component({
  selector: 'app-parent-search',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './parent-search.component.html',
  styleUrl: './parent-search.component.css',
})
export class ParentSearchComponent {
  parents = input<ParentResponse[]>([]);
  parentSelected = output<ParentResponse>();

  searchQuery = signal('');
  isOpen = signal(false);
  selectedParent = signal<ParentResponse | null>(null);

  filteredParents = computed(() => {
    const query = this.searchQuery().toLowerCase();
    if (!query) {
      return this.parents();
    }
    return this.parents().filter((p) => {
      const fullName = `${p.user.firstName} ${p.user.lastName}`.toLowerCase();
      const nationalId = p.user.nationalNumber?.toString() || '';
      return fullName.includes(query) || nationalId.includes(query);
    });
  });

  constructor(private elementRef: ElementRef) {}

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
    }
  }

  selectParent(parent: ParentResponse) {
    this.selectedParent.set(parent);
    this.searchQuery.set(`${parent.user.firstName} ${parent.user.lastName}`);
    this.parentSelected.emit(parent);
    this.isOpen.set(false);
  }

  onInputClick() {
    this.isOpen.set(true);
    this.selectedParent.set(null);
  }
}
