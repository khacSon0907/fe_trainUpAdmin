import axiosClient from '../config/axios/axiosClient'


const authService = {

  register: (data) => {
    return axiosClient.post("/auth/sign-up", data);
  },

  resendEmail: ({email}) => {
    return axiosClient.post(`/auth/resend-verification?email=${email}`);
  },

  login: (data) => {
    return axiosClient.post("/auth/sign-in", data);
  },

  logout: () => {
    return axiosClient.post("/auth/logout");
  },

  // lấy thông tin user hiện tại
  getCurrentUser: () => {
    return axiosClient.get("/auth/me");
  },
  
  loginWithGoogle: (data) => {
    return axiosClient.post("/auth/firebase-sign-in", data);
  },



};

export default authService;
