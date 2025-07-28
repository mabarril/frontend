import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RelatorioOnibus } from './relatorio-onibus';

describe('RelatorioOnibus', () => {
  let component: RelatorioOnibus;
  let fixture: ComponentFixture<RelatorioOnibus>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RelatorioOnibus]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RelatorioOnibus);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
