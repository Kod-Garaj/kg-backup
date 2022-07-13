<template>
  <v-container fill-height>
    <v-row
      class="font-weight-light"
      justify="center"
      align="center"
      fill-height
    >
      <v-col cols="12" class="text-center">
        <h2>KodGaraj Backup</h2>
      </v-col>
      <template v-if="yukleniyor">
        <v-col cols="12" class="text-center">
          <span class="font-weight-bold">Google Drive</span> için giriş
          yapılıyor.
        </v-col>
        <v-col cols="12" class="text-center"> Lütfen bekleyiniz... </v-col>
        <v-col cols="12" class="text-center">
          <v-progress-circular
            indeterminate
            color="primary"
            class="text-center"
          ></v-progress-circular>
        </v-col>
      </template>
      <template v-else>
        <v-col cols="12" class="text-center">
          İşlem tamamlandı. Sekmeyi kapatabilirsiniz.
        </v-col>
        <v-col cols="12" class="text-center">
          <v-icon color="success" size="64">fas fa-check-circle</v-icon>
        </v-col>
      </template>
    </v-row>
  </v-container>
</template>

<script>
import {
  APP_PROTOCOL,
  GOOGLE_DRIVE_API_KEY,
  GOOGLE_DRIVE_CLIENT_ID,
} from "../config";

export default {
  name: "GoogleOAuth",
  data() {
    return {
      apiBilgileri: {
        API_KEY: GOOGLE_DRIVE_API_KEY,
        CLIENT_ID: GOOGLE_DRIVE_CLIENT_ID,
        DISCOVERY_DOCS: [
          "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest",
        ],
        SCOPES: [
          "https://www.googleapis.com/auth/drive.metadata.readonly",
          "https://www.googleapis.com/auth/drive.file",
        ],
      },
      inited: {
        gapi: false,
        gis: false,
      },
      tokenClient: null,
      gapi: window.gapi,
      google: window.google,
      shell: window.shell,
      yukleniyor: true,
    };
  },
  mounted() {
    this.gapiLoaded();
    this.gisLoaded();
  },
  watch: {
    inited: {
      handler(newVal) {
        if (newVal.gapi && newVal.gis) {
          this.handleAuthClick();
        }
      },
      deep: true,
    },
  },
  methods: {
    gapiLoaded() {
      // this.gapi = window.gapi;
      this.gapi.load("client", this.intializeGapiClient);
    },
    async intializeGapiClient() {
      await this.gapi.client.init({
        apiKey: this.apiBilgileri.API_KEY,
        discoveryDocs: this.apiBilgileri.DISCOVERY_DOC,
      });
      this.inited.gapi = true;
    },
    gisLoaded() {
      // this.google = window.google;
      this.tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: this.apiBilgileri.CLIENT_ID,
        scope: this.apiBilgileri.SCOPES.join(" "),
        callback: this.tokenInitCompleted,
      });
      this.inited.gis = true;
    },
    handleAuthClick() {
      console.log("Authorizing...");
      if (this.gapi.client.getToken() === null) {
        console.log("Authorizing with popup...", this.tokenClient);
        this.tokenClient.requestAccessToken({ prompt: "consent" });
      } else {
        this.tokenClient.requestAccessToken({ prompt: "" });
      }
    },
    tokenInitCompleted(resp) {
      console.log("tokenInitCompleted", resp);
      if (resp.error !== undefined) {
        throw resp;
      }
      const url = `${APP_PROTOCOL}://${
        window.location.host
      }/google-oauth-callback?obj=${JSON.stringify(resp)}`;

      // const GoogleAuth = this.gapi.auth2.getAuthInstance();
      // console.log(GoogleAuth.currentUser.get());

      console.log("Redirecting to", url);
      window.location.href = url;
      this.yukleniyor = false;
    },
  },
};
</script>

<style>
</style>