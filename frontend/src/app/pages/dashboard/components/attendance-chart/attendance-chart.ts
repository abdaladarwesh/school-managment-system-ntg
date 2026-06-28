import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ElementRef,
  ViewChild,
  Input
} from '@angular/core';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-attendance-chart',
  template: `
    <canvas #attendanceCanvas></canvas>
  `,
  styles: [`
    canvas { width: 100% !important; }
  `]
})
export class AttendanceChartComponent implements AfterViewInit, OnDestroy {

  @ViewChild('attendanceCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  @Input() weeks: string[] = ['Wk 1','Wk 2','Wk 3','Wk 4','Wk 5','Wk 6','Wk 7','Wk 8'];
  @Input() data: number[]  = [91, 93, 92.5, 94, 95, 94.5, 95.5, 94.2];

  private chart!: Chart;

  ngAfterViewInit(): void {
    const ctx = this.canvasRef.nativeElement.getContext('2d')!;

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.weeks,
        datasets: [{
          label: 'Attendance %',
          data: this.data,
          borderColor: '#e67e22',
          backgroundColor: 'rgba(230,126,34,0.1)',
          fill: true,
          tension: 0.45,
          pointBackgroundColor: '#e67e22',
          pointRadius: 4,
          pointHoverRadius: 6,
          borderWidth: 2.5,
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${ctx.parsed.y}%`
            }
          }
        },
        scales: {
          y: {
            min: 0, max: 100,
            ticks: {
              callback: (v) => v + '%',
              font: { size: 11 }
            },
            grid: { color: '#f0f0f0' }
          },
          x: {
            ticks: { font: { size: 11 } },
            grid: { display: false }
          }
        }
      }
    });
  }

  ngOnDestroy(): void {
    // prevent memory leak when component is removed
    this.chart?.destroy();
  }
}