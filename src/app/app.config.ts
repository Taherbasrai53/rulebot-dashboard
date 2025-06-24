import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

export const appConfig = [provideHttpClient(withInterceptorsFromDi()),
  
  provideRouter(routes),
  provideAnimations(),
  provideHttpClient()
];
