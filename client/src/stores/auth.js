import { defineStore } from "pinia";
import { http } from "../api/http";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    accessToken: localStorage.getItem("accessToken") || "",
    user: JSON.parse(localStorage.getItem("user") || "null"),
    loading: false,
    error: "",
  }),
  getters: {
    isAuthed: (s) => !!s.accessToken,
  },
  actions: {
    async login(email, password) {
      this.loading = true;
      this.error = "";
      try {
        const { data } = await http.post("/auth/login", { email, password });
        this.accessToken = data.accessToken;
        this.user = data.user;
        localStorage.setItem("accessToken", this.accessToken);
        localStorage.setItem("user", JSON.stringify(this.user));
      } catch (e) {
        this.error = e?.response?.data?.message || "Login failed";
        throw e;
      } finally {
        this.loading = false;
      }
    },
    async register({ email, password, name }) {
      this.loading = true;
      this.error = "";
      try {
        const { data } = await http.post("/auth/register", {
          email,
          password,
          name,
        });

        // ✅ ถ้า server ส่ง accessToken กลับมา => auto-login
        if (data?.accessToken) {
          this.accessToken = data.accessToken;
          this.user = data.user;
          localStorage.setItem("accessToken", this.accessToken);
          localStorage.setItem("user", JSON.stringify(this.user));
        }

        // ✅ ถ้า server ไม่ส่ง token => ให้ caller ไป login ต่อเอง
        return data;
      } catch (e) {
        this.error = e?.response?.data?.message || "Register failed";
        throw e;
      } finally {
        this.loading = false;
      }
    },
    logout() {
      this.accessToken = "";
      this.user = null;
      this.error = "";
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
    },
    async fetchMe() {
      // ใช้ตรวจ token ว่ายัง valid ไหม
      const { data } = await http.get("/auth/me");
      return data.user;
    },
  },
});
