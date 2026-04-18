import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchDoctorsComponent } from './search-doctors.component';

describe('SearchDoctorsComponent', () => {
  let component: SearchDoctorsComponent;
  let fixture: ComponentFixture<SearchDoctorsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SearchDoctorsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SearchDoctorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
