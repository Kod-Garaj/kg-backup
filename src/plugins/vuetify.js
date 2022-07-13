import Vue from "vue";
import Vuetify from "vuetify/lib/framework";
import tr from "vuetify/lib/locale/tr";

Vue.use(Vuetify);

export default new Vuetify({
  lang: {
    locales: { tr },
    current: "tr",
  },
  icons: {
    iconfont: "fa",
  },
  theme: {
    dark: true,
  },
});
