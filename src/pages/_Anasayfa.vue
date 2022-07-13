<template>
  <div>
    <v-row>
      <v-col cols="6" class="mx-auto text-center">
        <v-btn @click="klasorSec" color="primary">
          <span>Klasör Seç</span>
          <v-icon right> fas fa-home </v-icon>
        </v-btn>
      </v-col>
    </v-row>

    <v-row>
      <p>Drive API Quickstart</p>

      <!--Add buttons to initiate auth sequence and sign out-->
      <v-btn
        id="authorize_button"
        @click="handleAuthClick()"
        v-if="authorizeButton.visible"
      >
        {{ authorizeButton.text }}
      </v-btn>
      <v-btn
        id="signout_button"
        @click="handleSignoutClick()"
        v-if="signOutButton.visible"
      >
        {{ signOutButton.text }}
      </v-btn>

      <pre id="content" style="white-space: pre-wrap" v-html="output"></pre>
      <v-btn color="success" @click="listFiles">List File</v-btn>
    </v-row>
  </div>
</template>

<script>
export default {
  name: "Anasayfa",
  components: {},
  data: () => ({
    ipc: null,
    apiBilgileri: {
      API_KEY: "AIzaSyCQBB2PqzyLou3Fbq4h1piot0-xGZkRxXs",
      CLIENT_ID:
        "435060822979-pnrbtmi3ggbo8uulphpbimft3ssdkl1i.apps.googleusercontent.com",
      DISCOVERY_DOCS: [
        "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest",
      ],
      SCOPES: [
        "https://www.googleapis.com/auth/drive.metadata.readonly",
        "https://www.googleapis.com/auth/drive.file",
      ],
    },
    gapiInited: false,
    tokenClient: null,
    gisInited: false,
    output: "",
    authorizeButton: {
      text: "Authorize",
      visible: false,
    },
    signOutButton: {
      text: "Sign Out",
      visible: false,
    },
    gapi: null,
    google: null,
  }),
  mounted() {
    this.ipc = window.ipcRenderer;
    this.shell = window.shell;

    this.ipc.receive("klasor-sec:dosyalar", (event, dosyalar) => {
      console.log("klasor-sec", dosyalar);
    });

    this.gapiLoaded();
    this.gisLoaded();
  },
  methods: {
    klasorSec() {
      console.log("Klasör seçimi yapılıyor...");
      this.ipc.send("klasor-sec", true);
    },
    gapiLoaded() {
      this.gapi = window.gapi;
      this.gapi.load("client", this.intializeGapiClient);
    },
    async intializeGapiClient() {
      await this.gapi.client.init({
        apiKey: this.apiBilgileri.API_KEY,
        discoveryDocs: this.apiBilgileri.DISCOVERY_DOC,
      });
      this.gapiInited = true;
      this.maybeEnableButtons();
    },

    gisLoaded() {
      this.google = window.google;
      this.tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: this.apiBilgileri.CLIENT_ID,
        scope: this.apiBilgileri.SCOPES.join(" "),
        redirect_uri: "kgbackup://./index.html",
        response_type: "token",
        callback: "",
      });
      this.gisInited = true;
      this.maybeEnableButtons();
    },

    handleAuthClick() {
      return this.shell.open();
      // this.tokenClient.callback = async (resp) => {
      //   console.log("tokenClient.callback", resp);
      //   if (resp.error !== undefined) {
      //     throw resp;
      //   }
      //   console.log("Token client initialized");
      //   this.signOutButton.visible = true;
      //   this.authorizeButton.text = "Re-Authorize";
      //   await this.listFiles();
      // };
      // console.log("Authorizing...");
      // if (this.gapi.client.getToken() === null) {
      //   // Prompt the user to select a Google Account and ask for consent to share their data
      //   // when establishing a new session.
      //   console.log("Authorizing with popup...", this.tokenClient);
      //   this.tokenClient.requestAccessToken({ prompt: "consent" });
      // } else {
      //   // Skip display of account chooser and consent dialog for an existing session.
      //   this.tokenClient.requestAccessToken({ prompt: "" });
      // }
    },

    handleSignoutClick() {
      const token = this.gapi.client.getToken();
      if (token !== null) {
        window.google.accounts.oauth2.revoke(token.access_token);
        this.gapi.client.setToken("");
        this.output = "";
        this.signOutButton.visible = false;
        this.authorizeButton.text = "Authorize";
      }
    },

    async listFiles() {
      let response;
      try {
        console.log("Listing files...");
        response = await this.gapi.client.drive.files.list({
          pageSize: 10,
          fields: "files(id, name)",
        });
      } catch (err) {
        console.log(err.message);
        this.output = err.message;
        return response;
      }
      const files = response.result.files;
      if (!files || files.length == 0) {
        console.log("No files found.");
        this.output = "No files found.";
        return response;
      }
      // Flatten to string to display
      const output = files.reduce(
        (str, file) => `${str}${file.name} (${file.id}\n`,
        "Files:\n"
      );
      this.output = output;
      return response;
    },
    maybeEnableButtons() {
      // if (window.gapi.client.getToken() === null) {
      if (this.gapiInited && this.gisInited) {
        this.authorizeButton.visible = true;
        this.signOutButton.visible = false;
      } else {
        this.authorizeButton.visible = false;
        this.signOutButton.visible = false;
      }
    },
  },
};
</script>
