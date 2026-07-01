import { HttpInterceptorFn } from '@angular/common/http';


export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.includes("/api/v1/auth/login")){
    return next(req)
  }
  const token = localStorage.getItem('token');
  console.log(req);
  

  if (!token) {
    
    return next(req);
  }

  const clonedRequest = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });
  

  return next(clonedRequest);
};
