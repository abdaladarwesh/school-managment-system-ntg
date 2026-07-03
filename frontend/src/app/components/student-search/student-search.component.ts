import { Component, input, output, computed, signal, HostListener, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StudentResponse } from '../../pages/student-page/service/student-service';

@Component({
  selector: 'app-student-search',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './student-search.component.html',
  styleUrl: './student-search.component.css'
})
export class StudentSearchComponent {
  students = input<StudentResponse[]>([]);
  studentSelected = output<StudentResponse>();

  searchQuery = signal('');
  isOpen = signal(false);
  selectedStudent = signal<StudentResponse | null>(null);

  filteredStudents = computed(() => {
    const query = this.searchQuery().toLowerCase();
    if (!query) {
      return this.students();
    }
    return this.students().filter(s => {
      const fullName = `${s.user.firstName} ${s.user.lastName}`.toLowerCase();
      return fullName.includes(query);
    });
  });

  constructor(private elementRef: ElementRef) {}

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
    }
  }

  selectStudent(student: StudentResponse) {
    this.selectedStudent.set(student);
    this.searchQuery.set(`${student.user.firstName} ${student.user.lastName}`);
    this.studentSelected.emit(student);
    this.isOpen.set(false);
  }

  onInputClick() {
    this.isOpen.set(true);
    // clear selected so user can search again if they want
    this.selectedStudent.set(null);
  }
}
