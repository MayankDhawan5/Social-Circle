import { Component, OnInit } from '@angular/core';
import { TokenService } from 'src/app/services/token.service';
import { UsersService } from 'src/app/services/users.service';
import { io } from 'socket.io-client';
@Component({
  selector: 'app-following',
  templateUrl: './following.component.html',
  styleUrls: ['./following.component.css'],
})
export class FollowingComponent implements OnInit {
  following: any[] = []; // Make sure to type 'following' array properly if possible
  user: any = {};
  socket: any; // Initialize user with an empty object

  constructor(
    private tokenService: TokenService,
    private userService: UsersService
  ) {
    this.socket = io('http://localhost:3000');
  }

  ngOnInit() {
    this.user = this.tokenService.GetPayload();
    this.GetUser();
    this.socket.on('refreshPage', () => {
      this.GetUser();
    });
  }

  GetUser() {
    if (this.user && this.user._id) {
      this.userService.GetUserById(this.user._id).subscribe(
        (data) => {
          console.log(data);
          this.following = data.result.following;
        },
        (err) => console.log(err)
      );
    } else {
      console.log('User is not authenticated.');
    }
  }
  UnFollowUser(user: any) {
    this.userService.UnFollowUser(user._id).subscribe((data) => {
      this.socket.emit('refresh', {});
    });
  }
}
