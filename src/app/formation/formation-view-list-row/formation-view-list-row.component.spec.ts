import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormationViewListRowComponent } from './formation-view-list-row.component';

describe('FormationViewListRowComponent', () => {
  let component: FormationViewListRowComponent;
  let fixture: ComponentFixture<FormationViewListRowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormationViewListRowComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormationViewListRowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
