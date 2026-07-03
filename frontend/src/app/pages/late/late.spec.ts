import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Late } from './late';

describe('Late', () => {
  let component: Late;
  let fixture: ComponentFixture<Late>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Late]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Late);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
