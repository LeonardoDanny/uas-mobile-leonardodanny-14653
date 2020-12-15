import { Component, OnInit } from '@angular/core';
import {AuthService,ProfileService} from '../../services/auth.service';
import {NavController} from '@ionic/angular';

@Component({
  selector: 'app-friend-list',
  templateUrl: './friend-list.page.html',
  styleUrls: ['./friend-list.page.scss'],
})
export class FriendListPage implements OnInit {
  contacts: any;
  userEmail: string;
  search_contacts :string = "Use Form Above To Add Friends";
  user_key: string;
  show : boolean = false;

  constructor(
    private profileSrv : ProfileService,
    private authSrv: AuthService,
    private navCtrl: NavController,

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
      res.forEach((ele) => {
        console.log("ada orangnya",ele.payload.val())
        temp = ele.payload.key
        this.user_key = temp
      });
      this.get_friends()
    }, err => {
      console.log(err);
    });
  }

  get_friends(){
    this.profileSrv.getAllFriends(this.user_key).snapshotChanges().subscribe(data => {
      data = data.map(c => (
        {
        key: c.payload.key,
        data: c.payload.val()
      }))
      console.log("ini yang dari get friends",data)
      this.contacts = data;
      console.log(data);
    });
  }
  
  delete(event, key) {
    this.profileSrv.delete(this.user_key,key).then(res => {
      console.log(res);
    });
  }

  update() {
    this.profileSrv.addFriend(this.userEmail,"danny2@gmail.com").then(res => {
      console.log(res);
    });
  }

  search(event) {
    console.log("masuk search",event.target.value)

    this.profileSrv.searchUser(event.target.value)
    .then(res => {
      console.log(res,"ini dah balik ke search",res.length);
      if (res.length>0){
        var temp
        res.forEach((ele) => {
          console.log("ada orangnya",ele.payload.val())
          temp = ele.payload.val()
          this.search_contacts = temp.email
        });
        this.show = false
        if (this.search_contacts == this.userEmail){
          console.log("masuk 1")
          this.search_contacts = "Anda tidak dapat menambahkan diri sendiri"
        }
        else{
          var found = false
          this.contacts.forEach((ele) => {
            console.log(ele)
            if(ele.data == this.search_contacts){
              found = true
            }
          });
          if (found){
            this.search_contacts = event.target.value+" sudah menjadi teman anda"
          }
          else{
            this.show = true
          }
        }
      }
      else{
        this.search_contacts = "User '"+event.target.value+"' tidak ditemukan"
      }
     
    }, err => {
      console.log(err,"err kalo di search");
    });
  }

  addFriend(user,target){
    this.profileSrv.addFriend(this.user_key,target)
    this.show = false

  }

  // update(event, key) {
  //   this.router.navigateByUrl('/' + key);
  // }
}
