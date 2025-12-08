import axios, { AxiosInstance } from "axios";
import Cookies from "js-cookie";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

// Create axios instance
const axiosInstance: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor
axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      const accessToken = Cookies.get("accessToken");
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    } catch (error) {
      console.error("Error getting token:", error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for auto refresh token
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }
      originalRequest._retry = true;
      isRefreshing = true;
      const refreshToken = Cookies.get("refreshToken");
      const accessToken = Cookies.get("accessToken");
      try {
        const res = await axios.post(`${BASE_URL}/auth/verify`, {
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        const { access_token, refresh_token } = res.data;
        if (access_token) {
          Cookies.set("accessToken", access_token, {
            httpOnly: false,
            sameSite: "lax",
            path: "/",
            secure: false,
          });
          axiosInstance.defaults.headers[
            "Authorization"
          ] = `Bearer ${access_token}`;
        }
        if (refresh_token) {
          Cookies.set("refreshToken", refresh_token, {
            httpOnly: false,
            sameSite: "lax",
            path: "/",
            secure: false,
          });
        }
        processQueue(null, access_token);
        return axiosInstance(originalRequest);
      } catch (err) {
        processQueue(err, null);
        Cookies.remove("accessToken");
        Cookies.remove("refreshToken");
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

const jsonHeaders = {
  "Content-Type": "application/json",
  Accept: "application/json",
};

const formHeaders = {
  "Content-Type": "multipart/form-data",
  Accept: "*/*",
};

// API methods

export const api = {
  get: <T>(url: string, params?: any, config?: any) => {
    const requestConfig = { params, headers: jsonHeaders, ...config };
    return axiosInstance.get<T>(url, requestConfig).then((res) => res.data);
  },

  post: <T>(url: string, data?: any) =>
    axiosInstance
      .post<T>(url, data, { headers: jsonHeaders })
      .then((res) => res.data),

  postForm: <T>(url: string, data?: any) =>
    axiosInstance
      .post<T>(url, data, { headers: formHeaders })
      .then((res) => res.data),

  put: <T>(url: string, data?: any) =>
    axiosInstance
      .put<T>(url, data, { headers: jsonHeaders })
      .then((res) => res.data),

  delete: <T>(url: string) =>
    axiosInstance
      .delete<T>(url, { headers: jsonHeaders })
      .then((res) => res.data),

  patch: <T>(url: string, data?: any) =>
    axiosInstance
      .patch<T>(url, data, { headers: jsonHeaders })
      .then((res) => res.data),
};
