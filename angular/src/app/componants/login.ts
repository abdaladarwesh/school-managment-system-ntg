import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { 
  FormControl,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';


@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,CommonModule
  ],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})


export class Login {


  loginForm = new FormGroup({

    email: new FormControl('', [

      Validators.required,
      Validators.email

    ]),


    password: new FormControl('', [

      Validators.required,
      Validators.minLength(6)

    ])

  });



  get email(){

    return this.loginForm.get('email');

  }



  get password(){

    return this.loginForm.get('password');

  }



  submit(){


    if(this.loginForm.valid){

      console.log(this.loginForm.value);

    }

    else{

      this.loginForm.markAllAsTouched();

    }


  }



}