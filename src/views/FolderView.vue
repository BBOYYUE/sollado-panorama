<script setup>
import { ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useFilesystemStore } from "@/stores/filesystem";
import { ElMessage } from "element-plus";
import * as api from "../util/api";
import * as purpose from "../common/purpose";
import { Timer, UploadFilled } from "@element-plus/icons-vue";

const authStore = useAuthStore();
const router = useRouter();
const filesystem = useFilesystemStore();
const props = defineProps({
  id: String,
});
let dialogVisible = ref(false);
let dialogFileVisible = ref(false);
let searchForm = ref({
  name: "",
});
const form = ref({
  name: "",
});
const errorMsg = (msg) => {
  ElMessage({
    message: msg,
    type: "error",
  });
};
const successMsg = (msg) => {
  ElMessage({
    message: msg,
    type: "success",
  });
};

function onFileUploadSuccess (respond) {
  if (respond.code == 200) {
    successMsg("上传成功!");
    filesystem.addFile(respond.data);
  } else {
    errorMsg("上传失败!");
  }
}
function getPurposeInfo (val) {
  for (let item in purpose) {
    if (purpose[item].val == val) {
      return purpose[item].key;
    }
  }
}

function downloadFile (id) {
  filesystem.downloadFile(id);
}

function deleteFile (id) {
  filesystem.deleteFile(id);
  setTimeout(function () {
    filesystem.getFolder();
  }, 1000);
}
function goToActive (row) {
  if (row.type == 1) {
    router.push("/folder/" + row.hash_id);
  } else if (row.type == 0) {
    window.open(row.path, "_blank ");
  }
}

function storeFolder () {
  let formData = Object.assign(
    {},
    {
      user_id: authStore.user.id,
      parent_id: filesystem.active,
      type: 1,
    },
    form.value
  );
  dialogVisible.value = false;
  filesystem.storeFolder(formData);
}

function goBack () {
  let len = filesystem.history.length;
  if (len > 1) {
    router.push("/folder/" + filesystem.history[len - 2]);
  } else {
    router.push("/storehouse");
  }
  filesystem.history.pop();
}
function search (name) {
  filesystem.setFilterByName(name);
  filesystem.getFolder();
}
function pageClick (page) {
  filesystem.setPage(page);
  filesystem.getFolder();
}
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
  () => props.id,
  (id) => {
    if (id) {
      filesystem.setActive(id);
      filesystem.getFolder();
    }
  },
  {
    immediate: true,
  }
);
</script>

<template>
  <div class="w-wull h-full flex flex-col">
    <el-card class="m-4 h-44">
      <template #header>
        <div><span class="text-2xl align-middle">文件管理器</span></div>
      </template>
      <el-page-header @back="goBack">
        <template #content>
          <div class="flex items-center">
            <span class="text-large font-600">
              {{ authStore.user.name }}
            </span>
          </div>
        </template>
        <template #extra>
          <div class="flex items-center">
            <el-input v-model="searchForm.name" placeholder="按名称搜索" @input="search" />
            <el-button type="primary" class="ml-2" @click="dialogVisible = true">创建文件夹</el-button>
            <el-button type="primary" class="ml-2" @click="dialogFileVisible = true">上传文件</el-button>
          </div>
        </template>
      </el-page-header>
    </el-card>
    <el-card class="mx-4">
      <el-table :data="filesystem.folder.data" stripe style="width: 100%" height="calc(100vh - 22rem)">
        <el-table-column label="名称" width="280">
          <template #default="scope">
            <el-link target="_blank" type="primary" v-on:click.stop="goToActive(scope.row)">{{ scope.row.name }}
            </el-link>
          </template>
        </el-table-column>
        <el-table-column label="分享码" width="120">
          <template #default="scope">
            <div v-if="scope.row.type == 0">
              {{ scope.row.hash_id }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="创建日期" width="200">
          <template #default="scope">
            <div>
              <el-icon>
                <timer />
              </el-icon>
              {{ new Date(scope.row.created_at).format("yyyy-MM-dd hh:mm:ss") }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="用途">
          <template #default="scope">
            {{ getPurposeInfo(scope.row.purpose) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="scope">
            <div class="flex flex-row flex-nowrap justify-end w-full">
              <el-button type="primary" size="small" v-on:click.stop="downloadFile(scope.row.hash_id)"
                v-if="scope.row.type == 0">下载</el-button>
              <el-button type="danger" size="small" v-on:click.stop="deleteFile(scope.row.hash_id)"
                v-if="scope.row.purpose != 14">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination small :page-count="filesystem.folder.last_page" background layout="prev, pager, next"
        :current-page="filesystem.folder.current_page" @update:current-page="pageClick" class="mt-4" />
    </el-card>
    <el-dialog v-model="dialogVisible" title="创建文件夹" width="300px">
      <el-form :model="form">
        <el-form-item label="文件夹名称:">
          <el-input v-model="form.name"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="storeFolder">确定</el-button>
        </span>
      </template>
    </el-dialog>
    <el-dialog v-model="dialogFileVisible" title="上传文件" width="500px">
      <div class="w-full h-full overflow-auto" style="height: 300px">
        <el-upload drag :action="api.host + api.filesystem" multiple :data="{
          parent_id: props.id,
          type: 0,
        }" :headers="{
            Authorization: authStore.tokenType + ' ' + authStore.accessToken,
          }" :on-success="onFileUploadSuccess" class="mx-4">
          <el-icon class="el-icon--upload" style="height: 150px">
            <upload-filled />
          </el-icon>
          <div class="el-upload__text">
            将文件拖动到这里或者<em>点击上传</em>
          </div>
          <template #tip>
            <div class="el-upload__tip">文件不能超过100MB</div>
          </template>
        </el-upload>
      </div>
    </el-dialog>
  </div>
</template>
