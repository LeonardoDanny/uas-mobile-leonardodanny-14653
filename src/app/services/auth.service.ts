import { Component, Injectable } from '@angular/core';
import {AngularFireAuth} from '@angular/fire/auth';
import {Profile} from './auth';
import {AngularFireDatabase, AngularFireList} from '@angular/fire/database';
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private fireAuth: AngularFireAuth) { }

  registerUser(value) {
    return new Promise<any>((resolve, reject) => {
      this.fireAuth.createUserWithEmailAndPassword(value.email, value.password)
          .then(
            res => resolve(res),
            err => reject(err)
          );
    });
  }

  loginUser(value) {
    return new Promise<any>((resolve, reject) => {
      this.fireAuth.signInWithEmailAndPassword(value.email, value.password)
          .then(
            res => resolve(res),
            err => reject(err)
          );
    });
  }

  logoutUser() {
    return new Promise<void>((resolve, reject) => {
      if (this.fireAuth.currentUser) {
        this.fireAuth.signOut()
            .then(() => {
              console.log('Log Out');
              resolve();
            }).catch((error) => {
              reject();
        });
      }
    });
  }

  userDetail() {
    return this.fireAuth.user;
  }

}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private databasePath = '/profiles';
  contactRef: AngularFireList<Profile> = null;
  constructor(public db: AngularFireDatabase) {
    this.contactRef = db.list(this.databasePath);
  }
  getAll(): AngularFireList<Profile>{
    return this.contactRef;
  }

  getAllFriends(user_key): any{
    return this.db.list('/profiles/'+user_key+"/friendlist")
  }

  getAllHistory(user_key): any{
    return this.db.list('/profiles/'+user_key+"/history")
  }

  getFriendsLocation(user_email):any{
    return new Promise<any>((resolve, reject) => {
      this.db.list('/profiles', ref => ref.orderByChild('email').equalTo(user_email)).snapshotChanges().subscribe((res) => {
        res.forEach((ele) => {
          console.log("ada orangnya",ele.payload.val())
          let temp:any = ele.payload.val()
          console.log("ada lokasinya",temp.history)
          console.log("ada lokasinya terakhir",temp.history[Object.keys(temp.history)[Object.keys(temp.history).length - 1]])
          // let last = temp.history[temp.length-1]; 
          resolve(temp.history[Object.keys(temp.history)[Object.keys(temp.history).length - 1]])

        });

        
      })
    })
  }

  create(contact: Profile): any{
    console.log("ini contact",contact)
    return this.contactRef.push(contact);
  }

  get_key(user_email):any{
    return new Promise<any>((resolve, reject) => {
      this.db.list('/profiles', ref => ref.orderByChild('email').equalTo(user_email)).snapshotChanges().subscribe((res) => {

        resolve(res)
        
      })
    })
  }


  addFriend(user_key,friend_email): any{
    this.db.list('/profiles/'+user_key+"/friendlist").push(friend_email)
    return true
  }

  searchUser(user_email): any{
    return new Promise<any>((resolve, reject) => {
      this.db.list('/profiles', ref => ref.orderByChild('email').equalTo(user_email)).snapshotChanges().subscribe((res) => {
        resolve(res)
      })
    })
  }


  delete(user_key,key): Promise<void>{
    return this.db.list('/profiles/'+user_key+"/friendlist").remove(key)
  }

  deleteHistory(user_key,key): Promise<void>{
    return this.db.list('/profiles/'+user_key+"/history").remove(key)
  }
}

@Injectable({
  providedIn: 'root'
})
export class MapService {
  constructor(public db: AngularFireDatabase) {}


  addHistory(user_key,coordinate): any{
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();

    var today_str = dd + '/' + mm + '/' + yyyy;
    coordinate["created_at"]= today_str

    console.log(coordinate,"ini coordinate")
    this.db.list('/profiles/'+user_key+"/history").push(coordinate)
    return true
  }
}