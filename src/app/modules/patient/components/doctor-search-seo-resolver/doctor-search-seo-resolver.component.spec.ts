import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorSearchSeoResolver } from './doctor-search-seo-resolver.component';

describe('DoctorSearchSeoResolverComponent', () => {
  let component: DoctorSearchSeoResolver;
  let fixture: ComponentFixture<DoctorSearchSeoResolver>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoctorSearchSeoResolver]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoctorSearchSeoResolver);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
