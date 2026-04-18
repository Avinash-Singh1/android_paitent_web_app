import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeoContentComponent } from './seo-content.component';

describe('SeoContentComponent', () => {
  let component: SeoContentComponent;
  let fixture: ComponentFixture<SeoContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SeoContentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SeoContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
