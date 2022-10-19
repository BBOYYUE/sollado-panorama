import Echo from "laravel-echo";
import Pusher from "pusher-js";
import http from "@/util/http";
import * as api from "@/util/api";

const PusherImpl = Pusher;

const EchoImpl = new Echo({
  broadcaster: "pusher",
  key: "7752d0686cc33c61e028",
  // wsHost: "laravel.test",
  // wsPort: "6001",
  wsHost: "wss.sollado.com",
  wsPort: "443",
  cluster: "ap3",
  forceTLS: false,
  disableStats: false,
  // authEndpoint: 'http://laravel.test/api/v1/broadcasting/auth'
  authorizer: (channel, options) => {
    return {
      authorize: (socketId, callback) => {
        http()
          .post(api.host + api.broadcaster, {
            socket_id: socketId,
            channel_name: channel.name,
          })
          .then((response) => {
            callback(false, response.data);
          })
          .catch((error) => {
            callback(true, error);
          });
      },
    };
  },
});
/**
socket_id: 61489505.556280226
channel_name: private-test
 */
export { PusherImpl, EchoImpl };
