import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeoSectionComponent } from './seo-section.component';

describe('SeoSectionComponent', () => {
  let component: SeoSectionComponent;
  let fixture: ComponentFixture<SeoSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeoSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SeoSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
