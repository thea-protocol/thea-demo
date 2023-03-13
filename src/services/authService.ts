import axiosConfig from "./axiosConfig";
import { loginApi, loginChallengeApi, logoutApi } from "./constants";
import { HttpResponse, LoginRequest } from "./models";

export const requestLoginService = async (ethAddr: string): Promise<string> => {
  try {
    const { data } = await axiosConfig.post<HttpResponse<string>>(
      loginChallengeApi,
      { ethAddr }
    );
    return Promise.resolve(data.result);
  } catch (error) {
    console.log("Error : ", error);
    return Promise.resolve(null!);
  }
};

export const loginService = async (
  loginRequest: LoginRequest
): Promise<boolean> => {
  try {
    await axiosConfig.post<HttpResponse>(loginApi, loginRequest);
    return Promise.resolve(true);
  } catch (error) {
    console.log("Error : ", error);
    return Promise.resolve(false);
  }
};

export const logoutService = async (): Promise<boolean> => {
  try {
    await axiosConfig.post<HttpResponse>(logoutApi);
    return Promise.resolve(true);
  } catch (error) {
    console.log("Error : ", error);
    return Promise.resolve(false);
  }
};
