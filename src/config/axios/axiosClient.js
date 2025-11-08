import axios from "axios";

const API_BASE_URL = "http://localhost:3000/api";
const REFRESH_ENDPOINT = "/auth/refresh-token"; // match your backend
const MAX_RETRY = 1;

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  withCredentials: true, 
  headers: {
    "Content-Type": "application/json",
  },
});

// dùng EventTarget thay vì EventEmitter (browser-compatible)
const emitter = new EventTarget();

let isRefreshing = false;
let refreshSubscribers = [];

function subscribeTokenRefresh(cb) {
  refreshSubscribers.push(cb);
}

function onRefreshed() {
  refreshSubscribers.forEach((cb) => cb());
  refreshSubscribers = [];
}

function notifyLogout() {
  emitter.dispatchEvent(new Event("logout"));
}

// public API để UI có thể nghe sự kiện logout (vd: redirect về /signin)
export function onLogout(handler) {
  emitter.addEventListener("logout", handler);
}

// Response interceptor
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // network error (no response)
    if (!error.response) {
      return Promise.reject({
        response: {
          data: {
            status: 500,
            message: "Không thể kết nối đến máy chủ!",
          },
        },
      });
    }

    const status = error.response.status;
    const requestUrl = originalRequest.url || "";

    // do not try refresh for forbidden or auth endpoints
    if (status === 403) {
      return Promise.reject(error); // forbidden — user not allowed
    }

    if (status === 401 && !originalRequest._retry) {
      // do not attempt refresh for sign-in or refresh endpoints themselves
      if (requestUrl.includes("/auth/sign-in") || requestUrl.includes(REFRESH_ENDPOINT)) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // queue request until refresh is done
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh(() => {
            // after refresh completes, retry original request
            axiosClient(originalRequest).then(resolve).catch(reject);
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // call refresh endpoint; server should validate refresh cookie and set new access cookie
        await axiosClient.post(REFRESH_ENDPOINT, {}, { withCredentials: true });
        isRefreshing = false;
        onRefreshed();
        return axiosClient(originalRequest);
      } catch (refreshErr) {
        isRefreshing = false;
        // notify UI to perform logout flow (clear redux, redirect, show modal, etc.)
        notifyLogout();
        return Promise.reject(refreshErr);
      }
    }

    // other statuses
    return Promise.reject(error);
  }
);

export default axiosClient;
