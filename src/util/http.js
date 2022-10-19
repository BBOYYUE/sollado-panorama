import axios from "axios";
import { useAuthStore } from "@/stores/auth";

const authStore = useAuthStore();
const http = () => {
  let instance = axios.create({
    timeout: 1000 * 12,
  });

  instance.interceptors.request.use((req) => {
    // if (Object.keys(this.loadingAPI).length === 0) {
    //   store.commit('SHOW_LOADING')
    // }
    req.headers.Authorization =
      authStore.tokenType + " " + authStore.accessToken;
    return req;
  });
  instance.interceptors.response.use((res) => {
    // if (Object.keys[this.loadingAPI].length === 0) {
    //   store.commit('HIDE_LOADING')
    // }
    return res;
  });
  return instance;
};
export default http;
