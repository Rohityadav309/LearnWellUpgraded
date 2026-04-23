import axios from "axios";

import { endpoints } from "./apis";

const TOKEN_STORAGE_KEY = "token";

const getStoredToken = () => {
  try {
    const savedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
    return savedToken ? JSON.parse(savedToken) : null;
  } catch {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    return null;
  }
};

const setStoredToken = (token) => {
  if (token) {
    localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(token));
    return;
  }

  localStorage.removeItem(TOKEN_STORAGE_KEY);
};

export const axiosInstance = axios.create({
  withCredentials: true,
});

let refreshPromise = null;

const refreshAccessToken = async () => {
  if (!refreshPromise) {
    refreshPromise = axiosInstance
      .post(endpoints.REFRESH_TOKEN_API)
      .then((response) => {
        const refreshedToken = response?.data?.token;

        if (!response?.data?.success || !refreshedToken) {
          throw new Error(response?.data?.message || "Unable to refresh token");
        }

        setStoredToken(refreshedToken);
        return refreshedToken;
      })
      .catch((error) => {
        setStoredToken(null);
        throw error;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};

axiosInstance.interceptors.request.use((config) => {
  const nextConfig = { ...config };
  const token = getStoredToken();
  const hasAuthorizationHeader = Boolean(nextConfig.headers?.Authorization);

  if (token && !hasAuthorizationHeader) {
    nextConfig.headers = {
      ...(nextConfig.headers || {}),
      Authorization: `Bearer ${token}`,
    };
  }

  return nextConfig;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error?.config;
    const statusCode = error?.response?.status;
    const requestUrl = originalRequest?.url || "";
    const isRefreshRequest = requestUrl.includes("/auth/refresh-token");

    if (
      statusCode === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isRefreshRequest
    ) {
      originalRequest._retry = true;

      try {
        const refreshedToken = await refreshAccessToken();
        originalRequest.headers = {
          ...(originalRequest.headers || {}),
          Authorization: `Bearer ${refreshedToken}`,
        };

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export const apiConnector = (method, url, bodyData, headers, params) => {
  return axiosInstance({
    method: `${method}`,
    url: `${url}`,
    data: bodyData ? bodyData : null,
    headers: headers ? headers : null,
    params: params ? params : null,
  });
};
