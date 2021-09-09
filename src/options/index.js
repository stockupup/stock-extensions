import Vue from "vue";
import AppComponent from "./App/App.vue";
import { Button, Table, TableColumn } from "element-ui";
import "element-ui/lib/theme-chalk/index.css";

Vue.component("app-component", AppComponent);
Vue.use(Button);
Vue.use(Table);
Vue.use(TableColumn);

function initBg() {
  if (chrome.extension.getBackgroundPage()) {
    Vue.prototype.$bg = chrome.extension.getBackgroundPage();
  } else {
    setTimeout(() => {
      initBg();
    }, 100);
  }
}

initBg();

new Vue({
  el: "#app",
  render: createElement => {
    return createElement(AppComponent);
  }
});
