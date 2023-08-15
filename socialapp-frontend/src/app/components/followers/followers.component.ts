import { UsersService } from './../../services/users.service';
import { Component, OnInit } from '@angular/core';
import { TokenService } from '../../services/token.service';
import io from 'socket.io-client';

interface Follower {
  follower: {
    username: string;
    // Other properties related to follower
  };
  // Other properties related to the follower entry
}

@Component({
  selector: 'app-followers',
  templateUrl: './followers.component.html',
  styleUrls: ['./followers.component.css'],
})
export class FollowersComponent implements OnInit {
  followers: Follower[] = []; // Initialize followers as an array of the defined type
  user: any;

  socket: any;

  constructor(
    private tokenService: TokenService,
    private usersService: UsersService
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
    this.usersService.GetUserById(this.user._id).subscribe(
      (data) => {
        this.followers = data.result.followers;
      },
      (err) => console.log(err)
    );
  }
}
