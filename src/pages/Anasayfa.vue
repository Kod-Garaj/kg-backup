<template>
  <v-container>
    <v-row>
      <v-col cols="12" class="text-center" v-if="yukleniyor">
        <v-progress-circular
          indeterminate
          color="primary"
        ></v-progress-circular>
      </v-col>
      <v-col cols="12" class="text-center" v-else-if="!user">
        <v-btn color="error" @click="googleSignIn">
          <v-icon left>fab fa-google-drive</v-icon>
          Google Drive Bağlan
        </v-btn>
      </v-col>
      <v-col cols="12" class="text-center" v-else>
        <v-row align="center" justify="center">
          <v-col cols="auto">
            <v-avatar size="64">
              <v-img :src="user.photoLink"></v-img>
            </v-avatar>
          </v-col>
          <v-col cols="auto" dir="col">
            <v-row class="flex-column text-left">
              <span>{{ user.displayName }}</span>
              <span class="caption grey--text">{{ user.emailAddress }}</span>
              <span class="caption grey--text">{{ user.kind }}</span>
            </v-row>
          </v-col>
        </v-row>
      </v-col>
      <!-- <v-col cols="12" class="text-center">
        <span class="caption">{{ output }}</span>
      </v-col> -->
    </v-row>
  </v-container>
</template>

<script>
import { mapActions, mapState } from "vuex";

export default {
  name: "Anasayfa",
  components: {},
  data: () => ({
    yukleniyor: false,
  }),
  computed: {
    ...mapState({
      ipc: (state) => state.ipc,
      googleDrive: (state) => state.googleDrive,
      user: (state) => state.googleDrive.user,
    }),
  },
  mounted() {
    this.ipc.receive("klasor-sec:dosyalar", (event, dosyalar) => {
      console.log("klasor-sec", dosyalar);
    });
  },
  methods: {
    ...mapActions(["setGoogleAuthToken"]),

    klasorSec() {
      console.log("Klasör seçimi yapılıyor...");
      this.ipc.send("klasor-sec", true);
    },

    googleSignIn() {
      this.ipc.send("shell:open", {
        type: "GOOGLE_DRIVE",
      });

      this.ipc.receive("shell:open-completed", async (event, info) => {
        this.yukleniyor = true;

        await this.setGoogleAuthToken(info.obje);

        this.yukleniyor = false;
      });
    },

    handleSignoutClick() {
      const token = this.googleDrive.gapi.client.getToken();
      if (token !== null) {
        this.googleDrive.google.accounts.oauth2.revoke(token.access_token);
        this.googleDrive.gapi.client.setToken("");
      }
    },

    async listFiles() {
      let response;
      try {
        console.log("Listing files...");
        response = await this.googleDrive.gapi.client.drive.files.list({
          pageSize: 10,
          fields: "files(id, name)",
        });
      } catch (err) {
        console.log(err.message);
        return response;
      }
      const files = response.result.files;
      if (!files || files.length == 0) {
        console.log("No files found.");
        return response;
      }
      // Flatten to string to display
      const output = files.reduce(
        (str, file) => `${str}${file.name} (${file.id}\n`,
        "Files:\n"
      );
      console.log(output);
      return response;
    },
  },
};
</script>
