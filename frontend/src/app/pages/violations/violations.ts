


import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ViolationRecord {
  date: string;
  studentName: string;
  class: string;
  violation: string;
  parentalSummons: boolean;
  status: 'Pending' | 'Resolved';
}

@Component({
  selector: 'app-violations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './violations.html',
  styleUrls: ['./violations.css']
})
export class ViolationsComponent implements OnInit {

  isModalOpen: boolean = false;
  isSuccessModalOpen: boolean = false; 

  classesList: string[] = ['1A', '1B', '2A', '2B', '3A', '3B'];
  violationTypesList: string[] = ['Late Arrival', 'Uniform Violation', 'Classroom Misconduct', 'Missing Homework', 'Excessive Absence', 'Phone Use in Class'];

  newViolation = {
    date: '03/07/2026',
    studentName: '',
    class: '',
    violation: '',
    description: '',
    sendToParent: false,
    sendToStudent: false
  };

  violations: ViolationRecord[] = [
    { date: '05/06/2026', studentName: 'Ahmed Mohamed', class: '1A', violation: 'Late Arrival', parentalSummons: true, status: 'Pending' },
    { date: '04/06/2026', studentName: 'Sara Ali', class: '1B', violation: 'Uniform Violation', parentalSummons: false, status: 'Resolved' },
    { date: '03/06/2026', studentName: 'Omar Hassan', class: '2A', violation: 'Classroom Misconduct', parentalSummons: true, status: 'Pending' },
    { date: '03/06/2026', studentName: 'Mariam Ahmed', class: '2B', violation: 'Missing Homework', parentalSummons: false, status: 'Resolved' },
    { date: '02/06/2026', studentName: 'Youssef Khaled', class: '3A', violation: 'Excessive Absence', parentalSummons: true, status: 'Pending' },
    { date: '02/06/2026', studentName: 'Nour Ibrahim', class: '3B', violation: 'Phone Use in Class', parentalSummons: true, status: 'Resolved' }
  ];

  constructor() { }

  ngOnInit(): void {}

  openModal() { this.isModalOpen = true; }
  closeModal() { this.isModalOpen = false; this.resetForm(); }


  triggerSuccessMessage() { this.isSuccessModalOpen = true; }
  closeSuccessModal() { this.isSuccessModalOpen = false; }

  saveViolation() {
    if (!this.newViolation.studentName || !this.newViolation.class || !this.newViolation.violation) {
      alert('Please fill all required fields!');
      return;
    }

    const recordToSave: ViolationRecord = {
      date: this.newViolation.date,
      studentName: this.newViolation.studentName,
      class: this.newViolation.class,
      violation: this.newViolation.violation,
      parentalSummons: this.newViolation.sendToParent,
      status: 'Pending'
    };

    this.violations.unshift(recordToSave);
    this.closeModal();
    
    if (this.newViolation.sendToParent || this.newViolation.sendToStudent) {
      setTimeout(() => { this.triggerSuccessMessage(); }, 100);
    }
  }

  resetForm() {
    this.newViolation = {
      date: '03/07/2026',
      studentName: '',
      class: '',
      violation: '',
      description: '',
      sendToParent: false,
      sendToStudent: false
    };
  }

  getInitials(name: string): string {
    const parts = name.split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  }
}