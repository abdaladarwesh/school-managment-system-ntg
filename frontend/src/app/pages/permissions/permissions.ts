import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-permission',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './permission.html',
  styleUrl: './permission.css'
})
export class PermissionComponent {
  showPopup = false;

  searchQuery = '';
  selectedGrade = '';
  selectedClass = '';

  newRequest = { student: '', grade: '', class: '', day: '', reason: '', status: 'Pending' };

  permission = [
    {
      student: 'Rodina Mohamed',
      grade: 'Grade 10',
      class: 'A',
      day: 'Monday',
      reason: 'Medical Appointment',
      status: 'Approved'
    },
    {
      student: 'Celia Moataz',
      grade: 'Grade 11',
      class: 'B',
      day: 'Tuesday',
      reason: 'Family Emergency',
      status: 'Pending'
    },
    {
      student: 'Omar Hassan',
      grade: 'Grade 12',
      class: 'A',
      day: 'Wednesday',
      reason: 'Academic Competition',
      status: 'Approved'
    },
    {
      student: 'Mariam Ahmed',
      grade: 'Grade 10',
      class: 'C',
      day: 'Thursday',
      reason: 'Sports Event',
      status: 'Pending'
    },
    {
      student: 'Jana Ahmed',
      grade: 'Grade 12',
      class: 'C',
      day: 'Thursday',
      reason: 'Academic Competition',
      status: 'Pending'
    },
    {
      student: 'Sara Mohamed',
      grade: 'Grade 10',
      class: 'C',
      day: 'Thursday',
      reason: 'Religious Occasion',
      status: 'Pending'
    },
    {
      student: 'Laila Abdullah',
      grade: 'Grade 10',
      class: 'C',
      day: 'Thursday',
      reason: 'Sports Event',
      status: 'Cancel'
    },
    {
      student: 'Habiba Ahmed',
      grade: 'Grade 10',
      class: 'C',
      day: 'Sunday',
      reason: 'Family Emargency',
      status: 'Approved'
    },
    {
      student: 'Tota Ahmed',
      grade: 'Grade 10',
      class: 'C',
      day: 'Sunday',
      reason: 'Family Emargency',
      status: 'Approved'
    }
  
  ];

  get filteredPermission() {
    return this.permission.filter(item => {
      const matchesSearch = item.student.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchesGrade = this.selectedGrade ? item.grade === this.selectedGrade : true;
      const matchesClass = this.selectedClass ? item.class === this.selectedClass : true;
      return matchesSearch && matchesGrade && matchesClass;
    });
  }

  get totalRequest()
   { return this.permission.length; }
  get approvedRequest() 
  { return this.permission.filter(x => x.status === 'Approved').length; }
  get pendingRequest() 
  { return this.permission.filter(x => x.status === 'Pending').length; }
   get cancelRequest() 
  { return this.permission.filter(x => x.status === 'Cancel').length; }

  saveRequest() {
    if (this.newRequest.student && this.newRequest.grade && this.newRequest.class) {
      this.permission.unshift({ ...this.newRequest });
      this.showPopup = false;
      this.newRequest = { student: '', grade: '', class: '', day: '', reason: '', status: '' };
    }
  }
}