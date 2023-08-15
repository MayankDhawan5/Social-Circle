import { HttpClient, HttpClientJsonpModule } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';

const BASEURL = 'http://localhost:3000/api/chatapp';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  constructor(private http: HttpClient) {}

  GetAllUsers(): Observable<any> {
    return this.http.get(`${BASEURL}/users`);
  }
  FollowUser(id: any): Observable<any> {
    return this.http.post(`${BASEURL}/follow-user`, {
      userFollowed: id,
    });
  }
  GetUserById(id: any): Observable<any> {
    return this.http.get(`${BASEURL}/user/${id}`);
  }

  GetUserByName(username: any): Observable<any> {
    return this.http.get(`${BASEURL}/username/${username}`);
  }
  UnFollowUser(userFollowed: any): Observable<any> {
    return this.http.post(`${BASEURL}/unfollow-user`, {
      userFollowed,
    });
  }
  MarkNotification(id: any, deleteValue?: any): Observable<any> {
    return this.http.post(`${BASEURL}/mark/${id}`, {
      id,
      deleteValue,
    });
  }
  MarkAllAsRead(): Observable<any> {
    return this.http.post(`${BASEURL}/mark-all`, {
      all: true,
    });
  }
}
