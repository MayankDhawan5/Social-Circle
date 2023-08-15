import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from 'src/app/services/message.service';
import { TokenService } from 'src/app/services/token.service';
import { UsersService } from 'src/app/services/users.service';

// Define the type for an individual message
type MessageType = {
  senderId: string;
  receiverId: string;
  sendername: string;
  receivername: string; // Add this property
  body: string;
};

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.css'],
})
export class MessageComponent implements OnInit {
  reciever: string | any;
  user: any;
  message: string | any;
  recieverData: any;
  messagesArray: MessageType[] = []; // Initialize as an array of MessageType
  constructor(
    private tokenService: TokenService,
    private msgService: MessageService,
    private route: ActivatedRoute,
    private userService: UsersService
  ) {}

  ngOnInit() {
    this.user = this.tokenService.GetPayload();
    this.route.params.subscribe((params) => {
      this.reciever = params['name'];
      this.GetUserByUsername(this.reciever);
    });
  }

  GetUserByUsername(name: any) {
    this.userService.GetUserByName(name).subscribe((data) => {
      this.recieverData = data.result;
      this.GetMessages(this.user._id, data.result._id); // Use data.result._id
    });
  }

  GetMessages(senderId: any, receiverId: any) {
    this.msgService.GetAllMessages(senderId, receiverId).subscribe((data) => {
      this.messagesArray = data.messages.message;
    });
  }

  SendMessage() {
    if (this.message) {
      this.msgService
        .SendMessage(
          this.user._id,
          this.recieverData._id,
          this.recieverData.username,
          this.message
        )
        .subscribe(
          (data: { message: MessageType }) => {
            // Explicitly type data
            console.log('Message sent successfully:', data);
            this.messagesArray.push(data.message);
            this.message = ''; // Clear the input field after sending
          },
          (error) => {
            console.log('Error sending message:', error);
          }
        );
    }
  }
}
