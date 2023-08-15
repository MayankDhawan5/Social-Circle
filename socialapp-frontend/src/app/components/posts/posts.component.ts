import { Component, OnInit } from '@angular/core';
import { PostService } from 'src/app/services/post.service';
import * as moment from 'moment';
import { io } from 'socket.io-client';
import * as _ from 'lodash';
import { TokenService } from 'src/app/services/token.service';
import { Router } from '@angular/router';

interface Comment {
  _id: string;
  userId: string;
  username: string;
  comment: string;
  createdAt: Date;
}

interface Post {
  _id: string;
  username: string;
  created: Date;
  post: string;
  totalLikes: number;
  comments: Comment[];
  likes: { username: string }[]; // Add the 'likes' property
}

@Component({
  selector: 'app-posts',
  templateUrl: './posts.component.html',
  styleUrls: ['./posts.component.css'],
})
export class PostsComponent implements OnInit {
  socket: any;
  posts: Post[] = [];
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
  }

  init() {
    this.socket.on('refreshPage', (data: any) => {
      this.AllPosts();
    });
  }

  AllPosts() {
    this.postService.getAllPosts().subscribe(
      (data) => {
        this.posts = data.posts;
        console.log(this.posts);
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
        console.log(data);
        this.socket.emit('refresh', {});
      },
      (err) => console.log(err)
    );
  }

  CheckInLikesArray(likes: { username: string }[], username: string) {
    return _.some(likes, { username: username });
  }

  TimeFromNow(time: moment.MomentInput) {
    return moment(time).fromNow();
  }

  OpenCommentBox(post: { _id: any }) {
    this.router.navigate(['post', post._id]);
  }
}
