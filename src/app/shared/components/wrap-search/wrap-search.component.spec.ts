import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WrapSearchComponent } from './wrap-search.component';

describe('WrapSearchComponent', () => {
  let component: WrapSearchComponent;
  let fixture: ComponentFixture<WrapSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WrapSearchComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WrapSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
