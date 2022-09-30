import { defineStore } from "pinia";
import http from "@/util/http";
import * as api from "../util/api";
import queryBuilder from "../util/queryBuilder";

export const usePanoramaStore = defineStore('panorama', {
    state: () => {
        return {
            active: {},
            storehouse: {},
            folder: {},
            history: [],
            workingList: new Set(),
            queryBuilder: {
                filter: {
                    id: undefined,
                    type: undefined,
                    parent_id: undefined,
                    name: undefined,
                },
                sort: {
                    type: -1,
                    updated_at: -1,
                },
                page: 1,
            }
        }
    },
    actions: {
        getStorehouse() {
            this.queryBuilder.filter.type = 2;
            this.queryBuilder.filter.parent_id = undefined;
            this.queryBuilder.filter.name = undefined;
            http()
                .get(api.host + api.panorama + queryBuilder(this.queryBuilder))
                .then((res) => {
                    let respond = res.data;
                    if (respond.code == 200) {
                        this.storehouse = respond.data;
                        this.queryBuilder.filter.type = undefined;
                    }
                });
        },
        getFolder() {
            this.queryBuilder.filter.parent_id = this.active;
            http()
                .get(api.host + api.panorama + queryBuilder(this.queryBuilder))
                .then((res) => {
                    let respond = res.data;
                    if (respond.code == 200) {
                        this.folder = respond.data;
                    }
                });
        },
        setFilterByName(name) {
            this.queryBuilder.filter.name = name;
        },
        setActive(active) {
            if (this.history[this.history.length - 1] != active) {
                this.history.push(active);
            }
            this.active = active;
        },
        setPage(page) {
            this.queryBuilder.page = page;
        },
        storeFolder(form) {
            http()
                .post(api.host + api.panorama, form)
                .then((res) => {
                    let respond = res.data;
                    if (respond.code == 200) {
                        this.folder.data.unshift(respond.data);
                    }
                });
        },
        addWorkingList(id) {
            this.workingList.add(id)
        },
        delWorkingList(id) {
            this.workingList.delete(id)
        },
        storePanorama(form) {
            http()
                .post(api.host + api.panorama, form)
                .then((res) => {
                    let respond = res.data;
                    let that = this
                    if (respond.code == 200) {
                        if (respond.data instanceof Array) {
                            respond.data.map((arr) => {
                                that.folder.data.unshift(arr);
                                this.workingList.add(arr.hash_id)
                            })
                        } else {
                            this.folder.data.unshift(respond.data);
                            this.workingList.add(respond.data.hash_id)
                        }
                    }
                })
        },
        deletePanorama(id) {
            http().delete(
                api.host + api.panorama + id
            );
        }

    }
})