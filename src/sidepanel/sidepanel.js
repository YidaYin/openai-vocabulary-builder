import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import { Search, Setting, Loading } from '@element-plus/icons-vue'
import SidePanel from '@/sidepanel/sidepanel.vue'
import router from './router'

const app = createApp(SidePanel)
app.component("Search", Search)
app.component("Setting", Setting)
app.component("Loading", Loading)
app.use(ElementPlus)
app.use(router)
app.mount('#app')
