import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Com } from './complaints';

describe('Com', () => {
  let component: Com;
  let fixture: ComponentFixture<Com>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Com]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Com);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
