import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

const BASEURL = 'http://localhost:3000/api/chatapp';

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  constructor(private http: HttpClient) {}
  SendMessage(
    senderId: any,
    receiverId: any,
    receiverName: any,
    message: any
  ): Observable<any> {
    return this.http.post(
      `${BASEURL}/chat-messages/${senderId}/${receiverId}`,
      {
        receiverId,
        receiverName,
        message,
      }
    );
  }
  GetAllMessages(senderId: any, receiverId: any): Observable<any> {
    return this.http.get(`${BASEURL}/chat-messages/${senderId}/${receiverId}`);
  }
}
