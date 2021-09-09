import Vue from "vue";
import App from "./App/App.vue";
import {
  Button,
  Input,
  Autocomplete,
  Table,
  TableColumn,
  Dropdown,
  DropdownMenu,
  DropdownItem
} from "element-ui";
import "element-ui/lib/theme-chalk/index.css";

Vue.use(Button);
Vue.use(Input);
Vue.use(Autocomplete);
Vue.use(Table);
Vue.use(TableColumn);
Vue.use(Dropdown);
Vue.use(DropdownMenu);
Vue.use(DropdownItem);

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
  render: h => h(App)
});
