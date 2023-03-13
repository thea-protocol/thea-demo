import { toast } from "react-toastify";
import axios from "axios";
import { ErrorMessage } from "@/services/models";

axios.defaults.baseURL = "https://127.0.0.1:8078";
axios.defaults.headers.post["Content-Type"] = "application/json";
axios.defaults.withCredentials = true;
axios.defaults.timeout = 10000;

const getErrorMessage = (error: string, errorMessage: string): string => {
  switch (error) {
    case "NO_AUTH":
      return "User must be logged in for this operation.";
    case "BAD_CREDS":
      return "Invalid credentials provided for authentication.";
    default:
      return errorMessage + ".";
  }
};

axios.interceptors.response.use(
  (value) => {
    const { result, errorMessage, error } = value.data;
    if (result === null && error) {
      if (error === "NO_AUTH" && value.config.url?.includes("whoami")) {
        return Promise.resolve(value);
      }
      const err: ErrorMessage = {
        error: error + "! ",
        errorMessage: getErrorMessage(error, errorMessage),
      };
      toast.error(`${err.error}${err.errorMessage}`);
      return Promise.reject(value);
    }

    return Promise.resolve({
      ...value,
      response: { data: value.data, status: value.status },
    });
  },
  (error) => {
    let err: ErrorMessage = null!;
    console.log("http error => ", error);

    if (!error.response) {
      const { baseURL, url } = error.config;

      err = {
        error: `Resource: ${baseURL + url}`,
        errorMessage: " is not available.",
      };
      toast.error(`${err.error}${err.errorMessage}`);
      return Promise.reject(error);
    }

    const { data, status } = error.response;

    switch (status) {
      case 412:
        err = {
          error: data.result + "! ",
          errorMessage: data.details,
        };
        break;
      case 500:
        err = {
          error: "Internal error! ",
          errorMessage: "Error occurred on the server",
        };
        break;
      case 401:
        err = {
          error: "Authentication required! ",
          errorMessage: "Failed to authenticate with the server",
        };
        break;
      case 400:
        err = {
          error: "Bad Request! ",
          errorMessage: "Sent an invalid request",
        };
        break;
      case 404:
        err = {
          error: "Not Found! ",
          errorMessage: "Requested resource does not exist",
        };
        break;
      case 408:
        err = {
          error: `Request Timeout! `,
          errorMessage: "Server did not respond within a given time.",
        };
        break;
    }
    if (err) {
      console.log(error.config);
      toast.error(`${err.error}${err.errorMessage}`);
    }

    return Promise.reject(error);
  }
);

const axiosConfig = {
  get: axios.get,
  post: axios.post,
  put: axios.put,
  delete: axios.delete,
};

export default axiosConfig;
