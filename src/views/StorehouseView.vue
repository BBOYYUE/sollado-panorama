<script setup>
import { useAuthStore } from "@/stores/auth";
import { useFilesystemStore } from "@/stores/filesystem";
import { watch, onActivated } from "vue";
import { useRouter } from "vue-router";
import { Timer } from "@element-plus/icons-vue";
const authStore = useAuthStore();
const router = useRouter();
const filesystem = useFilesystemStore();

onActivated(() => {
  filesystem.getStorehouse();
});

watch(
  () => authStore.isAuth,
  (isAuth) => {
    if (!isAuth) {
      router.push("/login");
    }
  },
  {
    immediate: true,
  }
);

watch(
  () => authStore.user,
  (user) => {
    if (user) {
      filesystem.getStorehouse();
    }
  },
  {
    immediate: true,
  }
);
</script>

<template>
  <div class="w-wull h-full">
    <el-card class="m-4">
      <div><span class="text-2xl align-middle">文件管理器</span></div>
    </el-card>
    <el-card class="m-4">
      <el-table :data="filesystem.storehouse.data" stripe style="width: 100%">
        <el-table-column label="名称" width="180">
          <template #default="scope">
            <el-link target="_blank" type="primary" size="small" @click="router.push('/folder/' + scope.row.hash_id)">{{
            scope.row.name }}</el-link>
          </template>
        </el-table-column>
        <el-table-column label="创建日期">
          <template #default="scope">
            <div>
              <el-icon>
                <timer />
              </el-icon>
              {{ new Date(scope.row.created_at).format("yyyy-MM-dd hh:mm:ss") }}
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>
