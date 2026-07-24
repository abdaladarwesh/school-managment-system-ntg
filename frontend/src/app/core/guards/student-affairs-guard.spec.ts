import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { studentAffairsGuard } from './student-affairs-guard';

describe('studentAffairsGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => studentAffairsGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
