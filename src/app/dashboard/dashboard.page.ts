import { Component, OnInit } from '@angular/core';
import {NavController} from '@ionic/angular';
import {AuthService} from '../services/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {

  userEmail: string;
  userID: string;

  constructor(
      private navCtrl: NavController,
      private authSrv: AuthService
  ) { }

  ngOnInit() {
    this.authSrv.userDetail().subscribe( res => {
      if (res !== null) {
        this.userEmail = res.email;
      } else {
        this.navCtrl.navigateBack('');
      }
    }, err => {
      console.log(err);
    });
  }

  logout(){
    this.authSrv.logoutUser()
        .then(res => {
          console.log(res);
          this.navCtrl.navigateBack('');
        }).catch(err => {
        console.log(err);
      });
  }

}
