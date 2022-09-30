<script setup>
import { useAuthStore } from "@/stores/auth";
import { useRouter } from "vue-router";
import { EchoImpl } from "../util/echo"
import { onActivated, onMounted, watch, ref } from "vue";
import { usePanoramaStore } from "../stores/panorama";
import { Timer } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import * as api from "../util/api";
import http from "@/util/http";


const authStore = useAuthStore();
const router = useRouter();
const panorama = usePanoramaStore();
const dialogFolderVisible = ref(false)
const dialogAssetVisible = ref(false)
const dialogTaskVisible = ref(false)
const taskList = ref([])
const taskCount = ref(0)

const props = defineProps({
    id: String,
});
const treeRef = ref()
let searchForm = ref({
    name: "",
});
const form = ref({
    name: "",
});

const filesystemProps = ref({
    label: 'name',
    children: 'childFiles',
})


function getCheckedNodes() {
    if (treeRef.value) {
        return treeRef.value.getCheckedNodes(false, false)
    } else {
        return []
    }
}
function goBack() {
    let len = panorama.history.length;
    if (len > 1) {
        router.push("/panorama-list/" + panorama.history[len - 2]);
    } else {
        router.push("/panorama-list/" + panorama.storehouse.data[0].hash_id);
    }
    panorama.history.pop();
}
function goToActive(row) {
    if (row.type == 1) {
        router.push("/panorama-list/" + row.hash_id);
    } else if (row.type == 0) {
        window.open(row.path, "_blank ");
    }
}

function search(name) {
    panorama.setFilterByName(name);
    panorama.getFolder();
}
function pageClick(page) {
    panorama.setPage(page);
    panorama.getFolder();
}

function listenTest() {
    EchoImpl.private('test')
        .listen('TestPrivateChannel', (e) => {
            console.log(e);
        });
    EchoImpl.private('panorama-task.' + authStore.user.id)
        .listen('PanoramaTaskStart', (res) => {
            taskList.value.push({
                status: 'working',
                hashId: res.data.hash_id,
                name: res.data.name
            })
            taskCount.value = taskCount.value + 1;
        })
        .listen('PanoramaTaskSuccess', (res) => {
            let hashId = res.data.hash_id
            for (let item in taskList.value) {
                if (taskList.value[item].hashId === hashId) {
                    taskList.value[item].status = 'success'
                    taskCount.value = taskCount.value - 1;
                    panorama.delWorkingList(hashId)
                }
            }
        })
        .listen('PanoramaTaskError', (res) => {
            let hashId = res.data.hash_id
            for (let item in taskList.value) {
                if (taskList.value[item].hashId === hashId) {
                    taskList.value[item].status = 'error'
                    deletePanorama(hashId)
                    panorama.delWorkingList(hashId)
                    taskCount.value = taskCount.value - 1;
                }
            }
        })
}

function storeFolder() {
    let formData = Object.assign(
        {},
        {
            user_id: authStore.user.id,
            parent_id: panorama.active,
            type: 1,
        },
        form.value
    );
    dialogFolderVisible.value = false;
    panorama.storeFolder(formData);
}

function storeAsset() {
    let list = getCheckedNodes()
    let fileList = []
    for (let item in list) {
        if (list[item].purpose === 1) {
            fileList.push({
                filesystem_id: list[item].hashId,
                name: list[item].name
            })
        }
    }
    if (fileList.length > 1) {
        panorama.storePanorama({
            parent_id: panorama.active,
            filesystem_list: fileList
        })
        dialogAssetVisible.value = false
    } else if (fileList.length > 0) {
        panorama.storePanorama({
            parent_id: panorama.active,
            filesystem_id: fileList[0].filesystem_id,
            name: fileList[0].name
        })
        dialogAssetVisible.value = false
    }
}

function getStatus(id) {
    if (panorama.workingList.has(id)) {
        return true;
    }
    return false;
}
function deletePanorama(id) {
    panorama.deletePanorama(id);
    setTimeout(function () {
        panorama.getFolder();
    }, 1000);
}
function showPanorama(id) {
    try {
        router.push('/panorama/' + id);
    } catch (e) {
        console.log(e)
    }
}

function loadFilesystem(node, resolve) {
    if (node.level === 0) {
        http()
            .get(api.host + api.filesystem + '?filter[type]=2')
            .then((res) => {
                let respond = res.data;
                if (respond.code == 200) {
                    let data = []
                    for (let item in respond.data.data) {
                        if (respond.data.data[item].type == 2) {
                            data.push({
                                name: respond.data.data[item].name,
                                hashId: respond.data.data[item].hash_id,
                                purpose: respond.data.data[item].purpose,
                                type: respond.data.data[item].type
                            })
                        }
                    }
                    return resolve(data)
                }
            });
    } else {
        http()
            .get(api.host + api.filesystem + '?filter[parent_id]=' + node.data.hashId)
            .then((res) => {
                let respond = res.data;
                if (respond.code == 200) {
                    let data = []
                    for (let item in respond.data.data) {
                        if (respond.data.data[item].type == 1 || respond.data.data[item].purpose == 1) {
                            data.push({
                                name: respond.data.data[item].name,
                                hashId: respond.data.data[item].hash_id,
                                purpose: respond.data.data[item].purpose,
                                type: respond.data.data[item].type
                            })
                        }
                    }
                    return resolve(data)
                }
            });
    }
}




onActivated(() => {
    panorama.getStorehouse()
});
onMounted(() => {
    panorama.getStorehouse()
})
watch(
    () => authStore.isAuth,
    (isAuth) => {
        if (!isAuth) {
            router.push("/login");
        } else {
            listenTest()
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
            panorama.setActive(id);
            panorama.getFolder();
        }
    },
    {
        immediate: true,
    }
);
watch(() => panorama.storehouse,
    (storeHouse) => {
        if (storeHouse) {
            panorama.setActive(storeHouse.data[0].hash_id);
            panorama.getFolder()
        }
    }
)

</script>
<template>
    <div class="w-screen h-screen flex flex-col">
        <el-card class="m-4 h-52">
            <template #header>
                <div class="flex flex-row justify-between">
                    <span class="text-2xl align-middle">全景管理器</span>
                    <el-badge :value="taskCount">
                        <el-button @click="dialogTaskVisible = true">任务列表</el-button>
                    </el-badge>
                </div>
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
                        <el-button type="primary" class="ml-2" @click="dialogFolderVisible = true">创建文件夹</el-button>
                        <el-button type="primary" class="ml-2" @click="dialogAssetVisible = true">创建全景</el-button>
                    </div>
                </template>
            </el-page-header>
        </el-card>

        <el-card class="mx-4">
            <el-table :data="panorama.folder.data" stripe style="width: 100%" height="calc(100vh - 22rem)">
                <el-table-column label="名称">
                    <template #default="scope">
                        <el-link target="_blank" type="primary" v-on:click.stop="goToActive(scope.row)">
                            {{ scope.row.name }}
                        </el-link>
                    </template>
                </el-table-column>
                <el-table-column label="创建日期" width="200">
                    <template #default="scope">
                        <div>
                            <el-icon>
                                <timer />
                            </el-icon>
                            {{
                              new Date(scope.row.created_at).format("yyyy-MM-dd hh:mm:ss")
                            }}
                        </div>
                    </template>
                </el-table-column>
                <el-table-column label="分享码" width="120">
                    <template #default="scope">
                        <div v-if="scope.row.type == 0">
                            {{ scope.row.hash_id }}
                        </div>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="150" fixed="right">
                    <template #default="scope">
                        <div class="flex flex-row flex-nowrap justify-end w-full">
                            <el-button type="primary" size="small" v-on:click.stop="showPanorama(scope.row.hash_id)"
                                v-show="!getStatus(scope.row.hash_id)">
                                查看
                            </el-button>
                            <el-button type="primary" size="small" disabled v-show="getStatus(scope.row.hash_id)">
                                处理中
                            </el-button>
                            <el-button type="danger" size="small" v-on:click.stop="deletePanorama(scope.row.hash_id)">
                                删除
                            </el-button>
                        </div>
                    </template>
                </el-table-column>
            </el-table>
            <el-pagination small :page-count="panorama.folder.last_page" background layout="prev, pager, next"
                :current-page="panorama.folder.current_page" @update:current-page="pageClick" class="mt-4" />
        </el-card>
        <el-dialog v-model="dialogFolderVisible" title="创建文件夹" width="300px">
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

        <el-dialog v-model="dialogAssetVisible" title="创建全景" width="300px">
            <el-tree :props="filesystemProps" :load="loadFilesystem" lazy show-checkbox ref="treeRef" />
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="dialogAssetVisible = false">取消</el-button>
                    <el-button type="primary" @click="storeAsset">确定</el-button>
                </span>
            </template>
        </el-dialog>
        <el-dialog v-model="dialogTaskVisible" title="任务列表" width="300px">
            <div class="flex flex-col justify-start">
                <div class="flex flex-row justify-between m-2" v-for="task in taskList" :key="task">
                    <div>{{task.name}}</div>
                    <div v-if="task.status == 'working'">正在处理</div>
                    <div v-if="task.status == 'success'">已完成</div>
                    <div v-if="task.status == 'error'">处理失败</div>
                </div>
            </div>
            <template #footer>
                <span class="dialog-footer">
                    <el-button type="primary" @click="dialogTaskVisible = false">确定</el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>