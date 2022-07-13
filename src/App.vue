<template>
  <v-app>
    <v-main>
      <v-container fill-height>
        <router-view></router-view>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import { mapMutations, mapState } from "vuex";

export default {
  name: "App",
  data() {
    return {};
  },
  created() {
    this.setIpc(window.ipcRenderer);

    this.googleDriveInit();
    console.log(this.googleDrive.user, this.googleDrive.token);
  },
  computed: {
    ...mapState({
      googleDrive: (state) => state.googleDrive,
    }),
  },
  methods: {
    ...mapMutations([
      "setIpc",
      "setGapi",
      "setGoogle",
      "setGapiInited",
      "setGisInited",
    ]),

    async googleDriveInit() {
      this.setGapi(window.gapi);
      this.setGoogle(window.google);

      await this.gapiLoaded();
      await this.gisLoaded();
    },
    gapiLoaded() {
      return new Promise((resolve) => {
        this.googleDrive.gapi.load("client", async () => {
          await this.googleDrive.gapi.client.init({
            apiKey: this.googleDrive.constants.API_KEY,
            discoveryDocs: this.googleDrive.constants.DISCOVERY_DOC,
          });

          this.setGapiInited(true);
          resolve(true);
        });
      });
    },
    async gisLoaded() {
      return new Promise((resolve) => {
        this.googleDrive.google.accounts.oauth2.initTokenClient({
          client_id: this.googleDrive.constants.CLIENT_ID,
          scope: this.googleDrive.constants.SCOPES.join(" "),
          callback: "",
        });

        this.setGisInited(true);
        resolve(true);
      });
    },
  },
};
</script>

<style>
</style>
