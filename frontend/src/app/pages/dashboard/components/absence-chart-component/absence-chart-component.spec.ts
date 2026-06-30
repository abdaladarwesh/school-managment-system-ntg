import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AbsenceChartComponent } from './absence-chart-component';

describe('AbsenceChartComponent', () => {
  let component: AbsenceChartComponent;
  let fixture: ComponentFixture<AbsenceChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AbsenceChartComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AbsenceChartComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
