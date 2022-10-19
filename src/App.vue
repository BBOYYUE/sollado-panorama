<script setup>
import { Picture, Files } from "@element-plus/icons-vue";
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
const route = useRoute();
const router = useRouter();
const showMenu = computed(() => {
  let unshow = new Set(["login", "panorama", "home"]);
  return !unshow.has(route.name);
});

function goTo (url) {
  router.push(url);
}
</script>

<template>
  <div class="flex flex-col w-screen h-screen">
    <div class="shadow-lg" v-show="showMenu">
      <el-menu default-active="1" mode="horizontal">
        <el-menu-item index="0" class="mx-4">Sollado</el-menu-item>
        <el-menu-item index="1" @click="goTo('/panorama-list')">
          <el-icon>
            <Picture />
          </el-icon>
          <template #title>全景管理器</template>
        </el-menu-item>
        <el-menu-item index="2" @click="goTo('/storehouse')">
          <el-icon>
            <Files />
          </el-icon>
          <template #title>文件管理器</template>
        </el-menu-item>
      </el-menu>
    </div>
    <RouterView class="flex-grow overflow-auto" />
  </div>
</template>
<style>
.el-menu {
  border-right: none;
}
</style>
