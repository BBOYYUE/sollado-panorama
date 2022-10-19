import { defineStore } from "pinia";
import http from "@/util/http";
import * as api from "../util/api";
import queryBuilder from "../util/queryBuilder";

export const useFilesystemStore = defineStore("filesystem", {
  state: () => {
    return {
      active: {},
      storehouse: {},
      folder: {},
      history: [],
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
      },
    };
  },
  actions: {
    getStorehouse () {
      this.queryBuilder.filter.type = 2;
      this.queryBuilder.filter.parent_id = undefined;
      this.queryBuilder.filter.name = undefined;
      http()
        .get(api.host + api.filesystem + queryBuilder(this.queryBuilder))
        .then((res) => {
          let respond = res.data;
          if (respond.code == 200) {
            this.storehouse = respond.data;
            this.queryBuilder.filter.type = undefined;
          }
        });
    },
    getFolder () {
      this.queryBuilder.filter.parent_id = this.active;
      http()
        .get(api.host + api.filesystem + queryBuilder(this.queryBuilder))
        .then((res) => {
          let respond = res.data;
          if (respond.code == 200) {
            this.folder = respond.data;
          }
        });
    },
    setFilterByName (name) {
      this.queryBuilder.filter.name = name;
    },
    setActive (active) {
      if (this.history[this.history.length - 1] != active) {
        this.history.push(active);
      }
      this.active = active;
    },
    setPage (page) {
      this.queryBuilder.page = page;
    },
    addFile (file) {
      this.folder.data.push(file);
    },
    storeFolder (form) {
      http()
        .post(api.host + api.filesystem, form)
        .then((res) => {
          let respond = res.data;
          if (respond.code == 200) {
            this.folder.data.push(respond.data);
          }
        });
    },
    deleteFile (id) {
      http().delete(
        api.host + api.filesystem + id + queryBuilder(this.queryBuilder)
      );
      // .then((res) => {
      //     let respond = res.data
      //     if (respond.code == 200) {
      //         this.folder = respond.data
      //     }
      // })
    },
    downloadFile (id) {
      window.open(api.host + api.filesystem + id);
    },
  },
});
