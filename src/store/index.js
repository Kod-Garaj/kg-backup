import Vue from "vue";
import Vuex from "vuex";

// config
import { GOOGLE_DRIVE_API_KEY, GOOGLE_DRIVE_CLIENT_ID } from "../config";

// utils
import { storage } from "../utils";

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    ipc: null,
    googleDrive: {
      constants: {
        API_KEY: GOOGLE_DRIVE_API_KEY,
        CLIENT_ID: GOOGLE_DRIVE_CLIENT_ID,
        DISCOVERY_DOCS: [
          "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest",
        ],
        SCOPES: ["https://www.googleapis.com/auth/drive"],
      },
      gapi: null,
      gapiInited: false,
      google: null,
      gisInited: false,
      user: null,
      token: null,
      initLoading: false,
    },
  },
  mutations: {
    setIpc(state, ipc) {
      state.ipc = ipc;
    },
    setGoogleDriveUser(state, user) {
      state.googleDrive.user = user;
      if (user === null) {
        return storage.removeKey("googleDriveUser");
      }
      storage.setKey("googleDriveUser", user);
    },
    setGoogleDriveToken(state, token) {
      state.googleDrive.token = token;
      state.googleDrive.gapi.client.setToken(token);
      if (token === null) {
        return storage.removeKey("googleDriveToken");
      }
      storage.setKey("googleDriveToken", token);
    },
    setGapi(state, gapi) {
      state.googleDrive.gapi = gapi;
      state.googleDrive.gapiInited = true;
    },
    setGoogle(state, google) {
      state.googleDrive.google = google;
      state.googleDrive.gisInited = true;
    },
    setGapiInited(state, gapiInited) {
      state.googleDrive.gapiInited = gapiInited;
    },
    setGisInited(state, gisInited) {
      state.googleDrive.gisInited = gisInited;
    },
    setGoogleDriveLoading(state, loading) {
      state.googleDrive.initLoading = loading;
    },
  },
  actions: {
    setGoogleAuthToken({ commit, state }, payload) {
      payload = payload || state.googleDrive.token;
      commit("setGoogleDriveToken", payload);
      return new Promise((resolve) => {
        const request = state.googleDrive.gapi.client.request({
          method: "GET",
          path: "/drive/v3/about",
          params: { fields: "user" },
        });

        request.execute((res) => {
          commit("setGoogleDriveUser", res.user);
          resolve(res.user);
        });
      });
    },
    logoutGoogleDrive({ commit, state }) {
      state.googleDrive.google.accounts.oauth2.revoke(
        state.googleDrive.token.access_token
      );
      state.googleDrive.gapi.client.setToken(null);
      console.log("logoutGoogleDrive", storage);
      commit("setGoogleDriveUser", null);
      commit("setGoogleDriveToken", null);
    },
  },
});

export default store;
