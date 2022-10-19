<script setup>
import http from "@/util/http";
import * as api from "../util/api";
import { onActivated, onMounted, watch, ref } from "vue";

const panorama = ref({});
const krpano = ref({});
const props = defineProps({
  id: String,
});
onMounted(() => {
  http()
    .get(api.host + api.panorama + props.id)
    .then((res) => {
      panorama.value = res.data.data;
      init();
    });
});

function krpanoReady (krpano) {
  krpano.value = krpano;
}

function init () {
  document.getElementById("panorama").innerHTML = "";
  embedpano({
    swf: "/krpano/tour.swf",
    xml: "/krpano/tour.xml",
    target: "panorama",
    html5: "auto",
    mobilescale: 1.0,
    passQueryParameters: true,
    initvars: { xmlPath: api.assetUrl + panorama.value.xml },
    onready: krpanoReady,
    consolelog: true,
  });
}

watch(
  () => panorama,
  (panorama) => {
    if (panorama) {
      init();
    }
  }
);
</script>
<template>
  <div class="w-wull h-full">
    <div id="panorama" style="overflow: hidden" class="w-full h-full"></div>
  </div>
</template>
