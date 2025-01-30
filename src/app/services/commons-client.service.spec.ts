import { TestBed } from '@angular/core/testing';

import { CommonsClientService } from './commons-client.service';

describe('CommonsClientService', () => {
  let service: CommonsClientService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CommonsClientService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
