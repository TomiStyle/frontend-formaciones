import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormationViewListComponent } from './formation-view-list.component';

describe('FormationViewListComponent', () => {
  let component: FormationViewListComponent;
  let fixture: ComponentFixture<FormationViewListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormationViewListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormationViewListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
