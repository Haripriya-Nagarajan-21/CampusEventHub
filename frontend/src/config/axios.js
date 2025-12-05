import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === "ECONNABORTED") {
      return Promise.reject({
        message: "Server is not responding. Please try again later.",
      });
    }
    if (!error.response) {
      return Promise.reject({
        message: "Network error. Please check your internet connection.",
      });
    }
    return Promise.reject(error.response.data);
  }
);

export default api;
