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
        <v-btn
          color="error"
          @click="googleSignIn"
          :loading="googleDrive.initLoading"
        >
          <v-icon left>fab fa-google-drive</v-icon>
          Google Drive Bağlan
        </v-btn>
      </v-col>
      <v-col cols="12" class="text-center" v-else>
        <v-row align="center" justify="center" v-if="googleDrive.initLoading">
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
        </v-row>
        <v-row align="center" justify="center" v-else>
          <v-col cols="auto">
            <v-avatar size="64">
              <v-img :src="user.photoLink"></v-img>
            </v-avatar>
          </v-col>
          <v-col cols="auto">
            <v-row class="flex-column text-left">
              <span>{{ user.displayName }}</span>
              <span class="caption grey--text">{{ user.emailAddress }}</span>
              <span class="caption grey--text">{{ user.kind }}</span>
            </v-row>
          </v-col>
          <v-col cols="auto">
            <v-btn
              @click="handleSignoutClick"
              color="error"
              outlined
              small
              icon
            >
              <v-icon x-small> fas fa-sign-out-alt </v-icon>
            </v-btn>
          </v-col>
          <v-col cols="12" class="text-center">
            <v-btn @click="listFiles" color="success">DOSYALARI LİSTELE</v-btn>
            <v-btn @click="klasorSec" color="info">KLASÖR SEÇ</v-btn>
          </v-col>
          <v-col cols="12" class="text-center">
            <v-row>
              <v-col
                cols="12"
                sm="4"
                md="3"
                v-for="(dosya, index) in dosyalar"
                :key="index"
              >
                <v-card>
                  <v-card-title>
                    <span class="headline">{{ dosya.name }}</span>
                  </v-card-title>
                  <v-card-actions>
                    <v-btn
                      @click="downloadFile(dosya.id)"
                      color="success"
                      outlined
                      small
                      icon
                    >
                      <v-icon x-small> fas fa-download </v-icon>
                    </v-btn>
                    <v-btn
                      @click="deleteFile(dosya.id)"
                      color="error"
                      outlined
                      small
                      icon
                    >
                      <v-icon x-small> fas fa-trash-alt </v-icon>
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-col>
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
    dosyalar: [],
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
    ...mapActions(["setGoogleAuthToken", "logoutGoogleDrive"]),

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
      this.logoutGoogleDrive();
    },

    async listFiles() {
      let response;
      try {
        console.log("Listing files...");
        const token = this.googleDrive.gapi.client.getToken();
        if (!token) {
          await this.setGoogleAuthToken();
          throw new Error("Token yok");
        }
        response = await this.googleDrive.gapi.client.request({
          method: "GET",
          path: "/drive/v3/files",
          params: {
            pageSize: 10,
            fields: "files(id, name)",
          },
        });
        // response = await this.googleDrive.gapi.client.drive.files.list({
        //   pageSize: 10,
        //   fields: "files(id, name)",
        // });
      } catch (err) {
        console.log(err.message);
        return response;
      }
      console.log("response", response);
      const files = response.result.files;
      if (!files || files.length == 0) {
        console.log("No files found.");
        return response;
      }
      this.dosyalar = files;
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
