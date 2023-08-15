import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { TokenService } from 'src/app/services/token.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
})
export class SignupComponent implements OnInit {
  signupForm: FormGroup | any;
  errorMessage: string | any;
  showSpinner: boolean | any;

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router,
    private tokenService: TokenService
  ) {}

  ngOnInit() {
    this.init();
  }

  init() {
    this.signupForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.email, Validators.required]],
      password: ['', Validators.required],
    });
  }

  signupUser() {
    this.showSpinner = true;
    console.log(this.signupForm.value);
    this.authService.registerUser(this.signupForm.value).subscribe({
      next: (data) => {
        this.tokenService.SetToken(data.token);
        this.signupForm.reset();
        setTimeout(() => {
          // Reset the form and navigate to the streams component
          this.router.navigate(['streams']);
        });
      },
      error: (err) => {
        this.showSpinner = false;
        if (err.error.msg) {
          this.errorMessage = err.error.msg[0].message;
        }
        if (err.error.message) {
          this.errorMessage = err.error.message;
        }
      },
      complete: () => {
        // You can include logic here if needed
      },
    });
  }
}
