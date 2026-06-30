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
  selector: 'app-violation-chart',
  template: `<canvas #violationCanvas></canvas>`,
  styles: [`canvas { width: 100% !important; }`]
})
export class ViolationChartComponent implements AfterViewInit, OnDestroy {

  @ViewChild('violationCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  readonly labels = input<string[]>([]);
  readonly data   = input<number[]>([]);

  private chart!: Chart;
  private viewReady = false;

  constructor() {
    effect(() => {
      const lbl = this.labels();
      const dat = this.data();
      if (this.viewReady && this.chart) {
        this.chart.data.labels           = lbl;
        this.chart.data.datasets[0].data = dat;
        this.chart.update();
      }
    });
  }

  ngAfterViewInit(): void {
    const ctx = this.canvasRef.nativeElement.getContext('2d')!;
    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: this.labels(),
        datasets: [{
          label: 'Violations',
          data: this.data(),
          backgroundColor: 'rgba(231,76,60,0.75)',
          borderColor: '#e74c3c',
          borderWidth: 1.5,
          borderRadius: 4,
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: { label: (c) => ` ${c.parsed.y} violations` }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { font: { size: 11 }, stepSize: 1 },
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
