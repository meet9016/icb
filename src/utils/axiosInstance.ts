import axios from 'axios'

const baseURL = process.env.NEXT_PUBLIC_APP_URL;

const apiAdminInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Optional: Add token automatically if available
// apiAdminInstance.interceptors.request.use(config => {
//   const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`
//   }
//   return config
// })

export const api = apiAdminInstance;

apiAdminInstance.interceptors.request.use(
  async config => {
    const token = localStorage.getItem('auth_token');
    // const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    config.headers['ngrok-skip-browser-warning'] = 'true'
    return config;
  },
  error => Promise.reject(error)
);

apiAdminInstance.interceptors.response.use(
  function (response) {
    return response;
  },
  error => {
    const { response } = error;
  
    if (response.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }else if (response.status === 406) {
      localStorage.setItem('continue', 1);
    }
    return Promise.reject(error);
  }
);


// import axios from 'axios';

// apiAdminInstance.interceptors.request.use(config => {
//   const token = localStorage.getItem('auth_token');
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// let isRefreshing = false;
// let failedQueue: { resolve: (value: unknown) => void; reject: (reason?: any) => void; }[] = [];

// const processQueue = (error: unknown, token = null) => {
//   failedQueue.forEach(prom => {
//     if (error) {
//       prom.reject(error);
//     } else {
//       prom.resolve(token);
//     }
//   });
//   failedQueue = [];
// };

// const refreshToken = async () => {
//   const expiredAccessToken = localStorage.getItem('auth_token');
//   if (!expiredAccessToken) throw new Error('No access token to refresh');

  // const res = await axios.post(
  //   `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
  //   {}, // No body data
  //   {
  //     headers: {
  //       Authorization: `Bearer ${expiredAccessToken}`
  //     }
  //   }
//   );

//   const newAccessToken = res.data.access_token;
//   localStorage.setItem('auth_token', newAccessToken);

//   // Optionally store refresh_token if returned
//   if (res.data.refresh_token) {
//     localStorage.setItem('refresh_token', res.data.refresh_token);
//   }

//   return newAccessToken;
// };

// apiAdminInstance.interceptors.response.use(
//   res => res,
//   async error => {
//     const originalRequest = error.config;

//     if (error.response?.status === 401 && !originalRequest._retry) {
//       if (isRefreshing) {
//         return new Promise((resolve, reject) => {
//           failedQueue.push({ resolve, reject });
//         }).then(token => {
//           originalRequest.headers.Authorization = 'Bearer ' + token;
//           return apiAdminInstance(originalRequest);
//         });
//       }

//       originalRequest._retry = true;
//       isRefreshing = true;
      
//       try {
//         const newToken = await refreshToken();

//         processQueue(null, newToken);
//         originalRequest.headers.Authorization = 'Bearer ' + newToken;
        
//         return apiAdminInstance(originalRequest);
//       } catch (err) {
//         processQueue(err, null);
//         localStorage.removeItem('auth_token');
//         // localStorage.removeItem('refresh_token');
//         window.location.href = '/login';
//         return Promise.reject(err);
//       } finally {
//         isRefreshing = false;
//       }
//     }

//     return Promise.reject(error);
//   }
// );

// export const api = apiAdminInstance;
