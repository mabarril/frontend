import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConviteAfilhado } from './convite-afilhado';

describe('ConviteAfilhado', () => {
  let component: ConviteAfilhado;
  let fixture: ComponentFixture<ConviteAfilhado>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConviteAfilhado]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConviteAfilhado);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
