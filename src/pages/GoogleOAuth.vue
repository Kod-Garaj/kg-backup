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
import { mapState } from "vuex";
import { APP_PROTOCOL } from "../config";

export default {
  name: "GoogleOAuth",
  data() {
    return {
      inited: {
        gapi: false,
        gis: false,
      },
      tokenClient: null,
      yukleniyor: true,
    };
  },
  computed: {
    ...mapState({
      googleDrive: (state) => state.googleDrive,
    }),
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
      this.googleDrive.gapi.load("client", this.intializeGapiClient);
    },
    async intializeGapiClient() {
      await this.googleDrive.gapi.client.init({
        apiKey: this.googleDrive.constants.API_KEY,
        discoveryDocs: this.googleDrive.constants.DISCOVERY_DOC,
      });
      this.inited.gapi = true;
    },
    gisLoaded() {
      this.tokenClient =
        this.googleDrive.google.accounts.oauth2.initTokenClient({
          client_id: this.googleDrive.constants.CLIENT_ID,
          scope: this.googleDrive.constants.SCOPES.join(" "),
          callback: this.tokenInitCompleted,
        });
      this.inited.gis = true;
    },
    handleAuthClick() {
      console.log("Authorizing...");
      if (this.googleDrive.gapi.client.getToken() === null) {
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
      }/googleDriveOAuth?obj=${JSON.stringify(resp)}`;

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