import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import {AuthService,ProfileService} from '../../services/auth.service';
import {map, switchMap} from 'rxjs/operators';
import {NavController, Platform} from '@ionic/angular';

import {Camera,CameraResultType,CameraSource,Capacitor, Filesystem} from '@capacitor/core'
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/storage';
import { from, Observable } from 'rxjs';


@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})

export class ProfilePage implements OnInit {
  @ViewChild('filepicker',{static:false}) filePickerRef: ElementRef<HTMLInputElement>;

  photo: SafeResourceUrl;
  isDesktop: Boolean;

  history: any;
  userEmail: string;
  user_key: string;

  file=[]

  constructor(
    private profileSrv : ProfileService,
    private authSrv: AuthService,
    private navCtrl: NavController,

    private platform: Platform,
    private sanitizer: DomSanitizer,

    private readonly storage: AngularFireStorage
  ) { }

  ngOnInit() {
    if( (this.platform.is('mobile') && this.platform.is('hybrid'))|| this.platform.is('desktop')){
      this.isDesktop = true
    }

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
      this.get_history()
      this.init_photo()
    }, err => {
      console.log(err);
    });
  }

  get_history(){
    this.profileSrv.getAllHistory(this.user_key).snapshotChanges().subscribe(data => {
      data = data.map(c => (
        {
        key: c.payload.key,
        data: c.payload.val()
      }))
      console.log("ini yang dari get friends",data)
      this.history = data;
      console.log(data);
    });
  }

  init_photo(){
    var path = this.user_key+"/profile_picture"
    this.storage.ref(path).getDownloadURL().subscribe( res => {
      console.log('downloaded image', res);
        this.photo = res
      }, err => {
        console.log(err);
      }
    )
  }
  delete(event, key) {
    this.profileSrv.deleteHistory(this.user_key,key).then(res => {
      console.log(res);
    });
  }
  
  async getPicture(type:String) {
    console.log("get picture")
    if(!Capacitor.isPluginAvailable('Camera')|| (this.isDesktop && type === 'gallery')){
      this.filePickerRef.nativeElement.click();
      return;
    }


    const image = await Camera.getPhoto({
      quality:100,
      width:300,
      allowEditing:false,
      resultType: CameraResultType.Base64,
      source: CameraSource.Prompt
    })
    // this.photo = this.sanitizer.bypassSecurityTrustResourceUrl(image && (image.dataUrl))

    console.log(image.path)
    const rawData = atob(image.base64String);
    const bytes = new Array(rawData.length);
    for (var x = 0; x < rawData.length; x++) {
        bytes[x] = rawData.charCodeAt(x);
    }
    const arr = new Uint8Array(bytes);
    const blob:any = new Blob([arr], {type: 'image/png'});

    
    await this.uploadFileAndGetMetadata("asdasdas",blob )

    // const path = this.user_key+"/profile_picture"
    // const temp = this.storage.ref(path).getDownloadURL().subscribe( res => {
    //     console.log('downloaded image', res);
    //     this.photo = res
    //   }, err => {
    //     console.log(err);
    //   }
    // )
    
    // console.log("downloadUrl", temp )

  } 

  onFileChoose(event:Event){
    const file = (event.target as HTMLInputElement).files[0];
    const pattern = /image-*/;
    const reader = new FileReader();


    if (!file.type.match(pattern)){
      console.log('File Format Not Suppported');
      return
    }

    reader.onload= () => {
      this.photo = reader.result.toString();
    }
    reader.readAsDataURL(file)

    // this.uploadFileAndGetMetadata("asdasdas",file)

  }

  logout(){
    console.log("masuk ke logout")
    this.authSrv.logoutUser()
        .then(res => {
          this.navCtrl.navigateBack('/login');
        }).catch(err => {
        console.log(err);
      });
  }

  uploadFileAndGetMetadata(
    mediaFolderPath: string,
    fileToUpload: File,
    ) {
      console.log("masuk ke upload gambar")
    const { name } = fileToUpload;
    const filePath = `${this.user_key}/profile_picture`;
    const uploadTask: AngularFireUploadTask = this.storage.upload(
      filePath,
      fileToUpload,
    );
    
    uploadTask.then(async res => {
      const path = this.user_key+"/profile_picture"
      const temp = this.storage.ref(path).getDownloadURL().subscribe( res => {
          console.log('downloaded image', res);
          this.photo = res
        }, err => {
          console.log(err);
        }
      )
      
      console.log("downloadUrl", temp )
    });

    
    return {  
      uploadProgress$: uploadTask.percentageChanges(),
      downloadUrl$: this.getDownloadUrl$(uploadTask, filePath),
    };
  }
 
  private getDownloadUrl$(
    uploadTask: AngularFireUploadTask,
    path: string,
  ): Observable<string> {
    return from(uploadTask).pipe(
      switchMap((_) => this.storage.ref(path).getDownloadURL()),
    );
  }
}
