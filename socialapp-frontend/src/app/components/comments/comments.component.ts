import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { PostService } from 'src/app/services/post.service';
import io from 'socket.io-client';
import * as moment from 'moment';

// Interface for comment objects
interface Comment {
  username: string;
  createdAt: string; // You can use a different data type if needed
  comment: string;
}

@Component({
  selector: 'app-comments',
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.css'],
})
export class CommentsComponent implements OnInit, AfterViewInit {
  toolbarElement: any;
  socket: any;
  commentForm: FormGroup | any;
  postId: any;
  commentsArray: Comment[] = [];
  post: string | any; // Use the Comment interface here
  constructor(
    private fb: FormBuilder,
    private postService: PostService,
    private route: ActivatedRoute
  ) {
    this.socket = io('http://localhost:3000');
  }

  ngOnInit() {
    this.toolbarElement = document.querySelector('.nav-content');
    this.init();
    this.postId = this.route.snapshot.paramMap.get('id');
    this.GetPost();
    this.socket.on('refreshPage', (data: any) => {
      this.GetPost();
    });
  }
  init() {
    this.commentForm = this.fb.group({
      comment: ['', Validators.required],
    });
  }
  ngAfterViewInit() {
    this.toolbarElement.style.display = 'none';
  }
  AddComment() {
    this.postService
      .addComment(this.postId, this.commentForm.value.comment)
      .subscribe((data) => {
        this.socket.emit('refresh', {});
        console.log(data);
        this.commentForm.reset();
      });
  }
  TimeFromNow(time: moment.MomentInput) {
    return moment(time).fromNow();
  }
  GetPost() {
    this.postService.getPost(this.postId).subscribe((data) => {
      console.log(data);
      this.post = data.post.post;
      this.commentsArray = data.post.comments.reverse();
    });
  }
}
