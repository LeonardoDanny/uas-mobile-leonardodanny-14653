import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {NavController} from '@ionic/angular';
import {AuthService,ProfileService} from '../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {

  // tslint:disable-next-line:variable-name
  validations_form: FormGroup;
  errorMessage = '';
  successMessage = '';

  // tslint:disable-next-line:variable-name
  validation_messages = {
    first_name: [
      { type: 'required', message: 'Name is required.' },
    ],
    last_name: [
      { type: 'required', message: 'Last Name is required.' },
    ],
    email: [
      { type: 'required', message: 'Email is required.' },
      { type: 'pattern', message: 'Enter a valid email.' }
    ],
    password: [
      { type: 'required', message: 'Password is required.' },
      { type: 'minLength', message: 'Password must be at least 6 characters long.' }
    ],
    confirm_password: [
      { type: 'required', message: 'Confirm Password is required.' }
    ]
  };

  constructor(
      private navCtrl: NavController,
      private authSrv: AuthService,
      private formBuilder: FormBuilder,
      private profileSrv: ProfileService,
  ) { }

  ngOnInit() {
    this.validations_form = this.formBuilder.group( {
      first_name: new FormControl('', Validators.compose([
        Validators.required,
      ])),
      last_name: new FormControl('', Validators.compose([
        Validators.required,
      ])),
      email: new FormControl('', Validators.compose([
          Validators.required,
          Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')
      ])),
      password: new FormControl('', Validators.compose([
          Validators.minLength(5),
          Validators.required
      ])),
      check_box: new FormControl(false, Validators.compose([
        Validators.required
      ])),
      confirm_password: new FormControl('', Validators.compose([
        Validators.minLength(5),
        Validators.required
      ])),
    }, { 
      validators: this.password.bind(this) && this.checked.bind(this)
    });
  }

  password(formGroup: FormGroup) {
    const { value: password } = formGroup.get('password');
    const { value: confirmPassword } = formGroup.get('confirm_password');
    return password === confirmPassword ? null : { passwordNotMatch: true };
  }

  checked(formGroup: FormGroup) {
    const { value: check_box } = formGroup.get('check_box');
    console.log("ini checkbox",check_box)
    return check_box === true ? null : { notaccepted: true };
  }

  tryRegister(value) {
    console.log(value)
    this.authSrv.registerUser(value)
        .then(res => {
          console.log(res);

          this.profileSrv.create(value).then(res => {
            console.log(res);
          }).catch(error => console.log(error));
          
          this.errorMessage = '';
          this.successMessage = 'Your Account Has Been Created. Please Log in.';
        }, err => {
          console.log(err);
          this.errorMessage = err.message;
          this.successMessage = '';
      });

    

    // this.router.navigateByUrl('/contacts-index');
  }

  goLoginPage() {
    this.navCtrl.navigateBack('/login');
  }

}
