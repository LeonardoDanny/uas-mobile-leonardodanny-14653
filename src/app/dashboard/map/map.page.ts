import {AuthService,ProfileService,MapService} from '../../services/auth.service';
import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import {NavController} from '@ionic/angular';
import { getLocaleCurrencyCode } from '@angular/common';
import {map} from 'rxjs/operators';

declare var google: any;

@Component({
  selector: 'app-map',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss'],
})
 
export class MapPage implements OnInit {
  map: any;
  userEmail: any;
  user_key :any;
  friend_location: any;
  friends: [];
  markers: [];

  infoWindow: any = new google.maps.InfoWindow();
  @ViewChild('map', {read: ElementRef, static: false}) mapRef: ElementRef;
  umnPos: any = {
    lat: -6.256687,
    lng: 106.618324
  };
  constructor(
    private profileSrv: ProfileService,
    private mapServ : MapService,
    private navCtrl: NavController,
    private authSrv: AuthService,

  ) { }

  ngOnInit() {
    this.authSrv.userDetail().subscribe( res => {
      if (res !== null) {
        this.userEmail = res.email;
      } else {
        this.navCtrl.navigateBack('');
      }
      this.init_key()
    }, err => {
      console.log(err);
    });

    
  }

  init_key(){
    console.log("init user email",this.userEmail)
    this.profileSrv.get_key(this.userEmail).then(res => {
      console.log(res,"ini dah balik ke search");
      var temp
      res.forEach((ele:any) => {
        console.log("ada orangnya",ele.payload.val())
        temp = ele.payload.key
        this.user_key = temp
      });
      this.get_friends()
    }, err => {
      console.log(err);
    });
    setInterval(() => {this.showCurrentLoc()},600000);
  }

  get_friends(){
    this.profileSrv.getAllFriends(this.user_key).snapshotChanges().subscribe(data => {
      data = data.map(c => (
        {
        key: c.payload.key,
        data: c.payload.val()
      }))
      console.log("ini yang dari get friends",data)
      this.friends = data;
      console.log(data);
    });
  }

  ionViewDidEnter(){
    this.showMap(this.umnPos);
  }
  showCurrentLoc() {
    console.log("this.map",this.map)

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position: any) => {
        console.log(position,"ini position lengkap")
        const pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        console.log("this.map",this.map)
        
        console.log(pos);
        // this.infoWindow.setPosition(pos);
        // this.infoWindow.setContent('Your Current Location.');
        // this.infoWindow.open(this.map);
        this.map.setCenter(pos);
        // The Marker, Positioned at UMN
        

        const marker = new google.maps.Marker({
          position: pos,
          map: this.map
        });


        console.log("ini setiap temen 1",this.friends)
        this.friends.forEach((ele:any) => {
          this.profileSrv.getFriendsLocation(ele.data).then(res => {
              var temp_pointer = {
                lat: res.lat,
                lng: res.lng
              }
              console.log(res,"ini lokasi temen terakhir", res.lat);
              new google.maps.Marker({
                position: temp_pointer,
                map: this.map
              });
            }, err => {
              console.log(err);
            });
        });

        // const marker2 = new google.maps.Marker({
        //   position: this.umnPos,
        //   map: this.map
        // });
       

        this.mapServ.addHistory(this.user_key,pos)
        
        // https://maps.googleapis.com/maps/api/geocode/json?latlng=40.714224,-73.961452&sensor=true&key=AIzaSyCM_PMUZ7INWfq-Ehdolhz2AaSfnwLN4Ts
        
        
        
      });
    }
    
  }

  showMap(pos: any) {
    console.log('test', pos);
    const location = new google.maps.LatLng(pos.lat, pos.lng);
    const options = {
      center: location,
      zoom: 13,
      disableDefaultUI: true
    };
    this.map = new google.maps.Map(this.mapRef.nativeElement, options);

  }

}
