import { Component, OnInit } from '@angular/core';
import { io } from 'socket.io-client';
import { TokenService } from 'src/app/services/token.service';
import { UsersService } from 'src/app/services/users.service';
import * as moment from 'moment';

interface Notification {
  message: string;
  created: string;
  read: boolean; // Add the read property

  // Add other properties specific to a notification
}

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css'],
})
export class NotificationsComponent implements OnInit {
  socket: any;
  user: any;
  notifications: Notification[] = [];

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
    this.usersService.GetUserByName(this.user.username).subscribe((data) => {
      this.notifications = data.result.notifications.reverse();
    });
  }

  TimeFromNow(time: moment.MomentInput) {
    return moment(time).fromNow();
  }

  MarkNotification(data: any) {
    this.usersService.MarkNotification(data._id).subscribe((value) => {
      this.socket.emit('refresh', {});
    });
  }

  DeleteNotification(data: any) {
    this.usersService.MarkNotification(data._id, true).subscribe((value) => {
      this.socket.emit('refresh', {});
    });
  }
}
