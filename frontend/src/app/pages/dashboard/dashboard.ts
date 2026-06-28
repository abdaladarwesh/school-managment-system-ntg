import { Component } from '@angular/core';
import { AttendanceChartComponent } from "./components/attendance-chart/attendance-chart";

@Component({
  selector: 'app-dashboard',
  imports: [AttendanceChartComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {}
