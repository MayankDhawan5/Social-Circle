import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { TokenService } from './token.service';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  constructor(private tokenService: TokenService) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const headersConfig: { [key: string]: string | string[] } = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    const token = this.tokenService.GetToken();
    if (token) {
      headersConfig['Authorization'] = `Bearer ${token}`; // Fix the typo here
    }

    const _req = req.clone({ setHeaders: headersConfig });
    return next.handle(_req);
  }
}
