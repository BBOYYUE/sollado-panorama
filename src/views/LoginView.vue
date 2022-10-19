<script setup>
import { useAuthStore } from "@/stores/auth";
import { ref, watch } from "vue";
import { useRouter } from "vue-router";
const authStore = useAuthStore();

const form = ref({
  username: "",
  password: "",
});

const router = useRouter();

const rules = ref({
  username: [
    {
      required: true,
      message: "请输入用户名",
      trigger: "blur",
    },
  ],
  password: [
    {
      required: true,
      message: "请输入密码",
      trigger: "blur",
    },
  ],
});
const loginFormRef = ref(null);

watch(
  () => authStore.isAuth,
  (isAuth) => {
    if (isAuth) {
      router.push("/panorama-list");
    } else {
      let accessToken = localStorage.getItem("accessToken");
      let tokenType = localStorage.getItem("tokenType");
      if (accessToken && tokenType) {
        authStore.relogin({
          accessToken,
          tokenType,
        });
      }
    }
  },
  {
    immediate: true,
  }
);
function login () {
  loginFormRef.value.validate((valid) => {
    if (!valid) return;
    authStore.login(form.value);
  });
}
</script>

<template>
  <div class="flex flex-row justify-center w-screen h-screen absolute top-0" style="background: #1f2937">
    <div class="flex flex-col justify-center">
      <el-card class="w-96">
        <div class="flex flex-col space-y-5">
          <div>
            <h1 class="text-3xl font-bold">登录页</h1>
          </div>
          <div>
            <el-form label-position="top" :model="form" :rules="rules" ref="loginFormRef">
              <el-form-item label="邮箱:" prop="username">
                <el-input v-model="form.username"></el-input>
              </el-form-item>
              <el-form-item label="密码:" prop="password">
                <el-input type="password" v-model="form.password"></el-input>
              </el-form-item>
            </el-form>
            <el-form-item>
              <el-button type="primary" class="w-full" @click="login()">登录</el-button>
            </el-form-item>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>
