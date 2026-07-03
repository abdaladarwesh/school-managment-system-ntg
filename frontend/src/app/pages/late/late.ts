import { Component, HostListener, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface LateRecord {
  name: string;
  class: string;
  date: string;
  arrivalTime: string;
  reason: string;
  notes: string;
  status: 'Very Late' | 'Late';
}

@Component({
  selector: 'app-late',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './late.html',
  styleUrls: ['./late.css']
})
export class LateComponent {
  searchText = signal('');
  selectedClass = signal('All Classes');

  showLateArrivalModal = false;
  showEditModal = false;
  activeDropdownIndex: number | null = null;
  currentEditIndex = -1;

  currentRecord: LateRecord = {
    name: '', class: '1A', date: '02/07/2026', arrivalTime: '', reason: '', notes: '', status: 'Late'
  };

  students: LateRecord[] = [
    { name: 'Ahmed Mohamed Ali', class: '1A', date: '06/06/2026', arrivalTime: '08:45', reason: 'Traffic congestion', notes: 'Student informed teacher upon arrival', status: 'Very Late' },
    { name: 'Sara Hassan Khalil', class: '1A', date: '06/06/2026', arrivalTime: '08:30', reason: 'Bus delay', notes: 'Provided doctor note', status: 'Late' },
    { name: 'Omar Farouk Nasser', class: '2A', date: '07/06/2026', arrivalTime: '08:20', reason: 'Bus delay', notes: 'Arrived safely', status: 'Late' }
  ];
  @HostListener('document:click')
  onDocumentClick() {
    this.activeDropdownIndex = null;
  }

  toggleDropdown(index: number, event: Event) {
    event.stopPropagation();
    this.activeDropdownIndex = this.activeDropdownIndex === index ? null : index;
  }

  openLateArrivalModal() {
    this.currentRecord = { name: '', class: '1A', date: '02/07/2026', arrivalTime: '', reason: '', notes: '', status: 'Late' };
    this.showLateArrivalModal = true;
  }

  closeLateArrivalModal() {
    this.showLateArrivalModal = false;
  }

  onSaveLateArrival() {
    if (this.currentRecord.name.trim()) {
      this.students.push({ ...this.currentRecord });
    }
    this.closeLateArrivalModal();
  }

  openEditModal(student: LateRecord, index: number, event: Event) {
    event.stopPropagation();
    this.activeDropdownIndex = null;
    this.currentEditIndex = index;
    this.currentRecord = { ...student };
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
  }

  onUpdateLateArrival() {
    if (this.currentEditIndex !== -1) {
      this.students[this.currentEditIndex] = { ...this.currentRecord };
    }
    this.closeEditModal();
  }

  deleteRecord(index: number, event: Event) {
    event.stopPropagation();
    this.students.splice(index, 1);
    this.activeDropdownIndex = null;
  }

  get totalRecords(): number { return this.students.length; }
  get todayCount(): number { return this.students.filter(s => s.date === '02/07/2026').length; }
  get thisWeekCount(): number { return this.students.length; } 
  get classesAffectedCount(): number { 
    return new Set(this.students.map(s => s.class)).size; 
  }

  get filteredStudents() {
    return this.students.filter(s => {
      const matchSearch = s.name.toLowerCase().includes(this.searchText().toLowerCase()) || 
                          s.reason.toLowerCase().includes(this.searchText().toLowerCase());
      const matchClass = this.selectedClass() === 'All Classes' || s.class === this.selectedClass();
      return matchSearch && matchClass;
    });
  }

  getInitials(name: string): string {
    if (!name) return '??';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
  }
}