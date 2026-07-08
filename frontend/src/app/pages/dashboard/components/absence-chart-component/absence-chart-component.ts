import { Component, Input } from '@angular/core';
export interface AbsenceClass {
  name: string;
  value: number;
  color?: string;
}
@Component({
  selector: 'app-absence-chart-component',
  imports: [],
  templateUrl: './absence-chart-component.html',
  styleUrl: './absence-chart-component.css',
})
export class AbsenceChartComponent {

  @Input() title = 'Avg. Absence per Grade';
  @Input() subtitle = 'Days absent per student — Today';

  @Input({ required: true })
  data: AbsenceClass[] = [];

  @Input() schoolAverage = 0;

  @Input() bestClass = '';
  @Input() bestValue = 0;

  /**
   * Largest value used for scaling bars.
   * If omitted it is calculated automatically.
   */
  @Input() maxValue?: number;

  getMax(): number {
    if (this.maxValue) return this.maxValue;

    if (!this.data.length) return 1;

    return Math.max(...this.data.map(x => x.value));
  }

  percentage(value: number): number {
    return value / this.getMax() * 100;
  }
}
