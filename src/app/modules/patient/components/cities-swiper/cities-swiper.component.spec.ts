import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CitiesSwiperComponent } from './cities-swiper.component';

describe('CitiesSwiperComponent', () => {
  let component: CitiesSwiperComponent;
  let fixture: ComponentFixture<CitiesSwiperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CitiesSwiperComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CitiesSwiperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
