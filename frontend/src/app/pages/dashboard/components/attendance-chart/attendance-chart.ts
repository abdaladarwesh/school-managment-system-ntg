import {
  Component,
  AfterViewInit,
  OnDestroy,
  ElementRef,
  ViewChild,
  input,
  effect
} from '@angular/core';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-attendance-chart',
  template: `<canvas #attendanceCanvas></canvas>`,
  styles: [`canvas { width: 100% !important; }`]
})
export class AttendanceChartComponent implements AfterViewInit, OnDestroy {

  @ViewChild('attendanceCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  // Signal inputs — the parent passes computed() signals directly
  readonly weeks = input<string[]>(['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4', 'Wk 5', 'Wk 6', 'Wk 7', 'Wk 8']);
  readonly data  = input<number[]>([91, 93, 92.5, 94, 95, 94.5, 95.5, 94.2]);

  private chart!: Chart;
  private viewReady = false;

  constructor() {
    // Re-render whenever the signal data changes (runs after view init too)
    effect(() => {
      const labels  = this.weeks();
      const dataset = this.data();
      if (this.viewReady && this.chart) {
        this.chart.data.labels             = labels;
        this.chart.data.datasets[0].data   = dataset;
        this.chart.update();
      }
    });
  }

  ngAfterViewInit(): void {
    const ctx = this.canvasRef.nativeElement.getContext('2d')!;
    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.weeks(),
        datasets: [{
          label: 'Attendance',
          data: this.data(),
          borderColor: '#e67e22',
          backgroundColor: 'rgba(230,126,34,0.10)',
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
              label: (ctx) => ` ${ctx.parsed.y}`
            }
          }
        },
        scales: {
          y: {
            min: 0,
            ticks: { font: { size: 11 } },
            grid: { color: '#f0f0f0' }
          },
          x: {
            ticks: { font: { size: 11 } },
            grid: { display: false }
          }
        }
      }
    });
    this.viewReady = true;
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }
}