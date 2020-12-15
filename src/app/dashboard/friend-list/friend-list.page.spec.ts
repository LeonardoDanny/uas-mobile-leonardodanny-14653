import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { FriendListPage } from './friend-list.page';

describe('FriendListPage', () => {
  let component: FriendListPage;
  let fixture: ComponentFixture<FriendListPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FriendListPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(FriendListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
