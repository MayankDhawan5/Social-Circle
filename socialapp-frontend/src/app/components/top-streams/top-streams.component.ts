import { Router } from '@angular/router';
import { TokenService } from './../../services/token.service';
import { PostService } from './../../services/post.service';
import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import io from 'socket.io-client';
import * as _ from 'lodash';

interface Post {
  _id: string;
  message: string;
  createdAt: string;
  likes: any[];
  comments: any[];
  totalLikes: number;
  // Add other properties as needed

  // Add the missing 'created' and 'post' properties
  created: string; // Assuming this is the correct property name
  post: string; // Replace 'string' with the actual type if different
}

@Component({
  selector: 'app-top-streams',
  templateUrl: './top-streams.component.html',
  styleUrls: ['./top-streams.component.css'],
})
export class TopStreamsComponent implements OnInit {
  socket: any;
  topPosts: Post[] = []; // Define the type as Post[] here
  user: any;

  constructor(
    private postService: PostService,
    private tokenService: TokenService,
    private router: Router
  ) {
    this.socket = io('http://localhost:3000');
  }

  ngOnInit() {
    this.user = this.tokenService.GetPayload();
    this.AllPosts();

    this.socket.on('refreshPage', (data: any) => {
      this.AllPosts();
    });
  }

  AllPosts() {
    this.postService.getAllPosts().subscribe(
      (data) => {
        this.topPosts = data.top;
      },
      (err) => {
        if (err.error.token === null) {
          this.tokenService.DeleteToken();
          this.router.navigate(['']);
        }
      }
    );
  }

  LikePost(post: any) {
    this.postService.addLike(post).subscribe(
      (data) => {
        this.socket.emit('refresh', {});
      },
      (err) => console.log(err)
    );
  }

  CheckInLikesArray(arr: any, username: any) {
    return _.some(arr, { username: username });
  }

  TimeFromNow(time: moment.MomentInput) {
    return moment(time).fromNow();
  }

  OpenCommentBox(post: { _id: any }) {
    this.router.navigate(['post', post._id]);
  }
}
