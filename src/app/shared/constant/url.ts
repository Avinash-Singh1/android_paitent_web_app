import { environment } from "src/environments/environment";

export const ApiUrl = {
  login:`${environment.baseUrl}/auth/login`,
  signup:`${environment.baseUrl}/auth/signup`,
  verifyOtp:`${environment.baseUrl}/verify-otp`,

};
