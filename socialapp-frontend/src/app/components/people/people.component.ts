import { Component, OnInit } from '@angular/core';
import { UsersService } from 'src/app/services/users.service';
import * as _ from 'lodash';
import { TokenService } from 'src/app/services/token.service';
import { io } from 'socket.io-client';

interface User {
  username: string;
  _id: string;
  // Add other properties as needed
}

@Component({
  selector: 'app-people',
  templateUrl: './people.component.html',
  styleUrls: ['./people.component.css'],
})
export class PeopleComponent implements OnInit {
  users: User[] = [];
  socket: any;
  loggedInUser: any;
  userArr = []; // Initialize as an empty array of User objects

  constructor(
    private usersService: UsersService,
    private tokenService: TokenService
  ) {
    this.socket = io('http://localhost:3000');
  }

  ngOnInit() {
    this.loggedInUser = this.tokenService.GetPayload();
    this.getUsers();
    this.GetUser();
    this.socket.on('refreshPage', () => {
      this.getUsers();
      this.GetUser();
    });
    // Use camelCase for method names
  }

  getUsers() {
    this.usersService.GetAllUsers().subscribe((data) => {
      _.remove(data.result, { username: this.loggedInUser.username });
      this.users = data.result;
    });
  }
  GetUser() {
    this.usersService.GetUserById(this.loggedInUser._id).subscribe((data) => {
      this.userArr = data.result.following;
      // console.log(data);
    });
  }
  FollowUser(user: any) {
    console.log('FollowUser method called with user:', user);
    this.usersService.FollowUser(user._id).subscribe((data) => {
      this.socket.emit('refresh', {});
    });
  }

  CheckInArray(arr: any, id: any | string) {
    const result = _.find(arr, ['userFollowed._id', id]);
    if (result) {
      return true;
    } else {
      return false;
    }
  }
}
