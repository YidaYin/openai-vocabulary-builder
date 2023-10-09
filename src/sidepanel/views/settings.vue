<script>

const storage = chrome.storage.local;
const api_model_options = ["gpt-3.5-turbo"];

export default {
    props: {},
    data() {
        return {
            settings: {
                api_key: '',
                api_model: api_model_options[1],
                api_url: 'https://api.openai.com',
                api_path: '/v1/chat/completions'
            },
            api_model_options: api_model_options
        }
    },
    created() {
        storage.get('settings', (result) => {
            const settings = result.settings;
            if (settings) {
                const savedKeys = Object.keys(settings);
                const defaultKeys = Object.keys(this.settings);
                for (let key of savedKeys) {
                    if (settings[key].length > 0 && defaultKeys.includes(key)) {
                        this.settings[key] = settings[key];
                    }
                }
            }
        });
    },
    methods: {
        async saveChanges(e) {
            await storage.set({ settings: this.settings });
            this.$router.replace('/home');
        },
        discardChanges(e) {
            this.$router.replace('/home');
        },
    }
}
</script>

<template>
    <div>
        <h1>Settings</h1>
    </div>
    <div class="input-field">
        <div class="input-text">* API Key</div>
        <el-input v-model="settings.api_key" placeholder="Key" type="password" show-password />
    </div>
    <div class="input-field">
        <div class="input-text">* API Model</div>
        <el-select v-model="settings.api_model" class="input-select" placeholder="Model">
            <el-option v-for="item in api_model_options" :key="item" :label="item" :value="item" />
        </el-select>
    </div>
    <div class="input-field">
        <div class="input-text">* API URL</div>
        <el-input v-model="settings.api_url" placeholder="URL" />
    </div>
    <div class="input-field">
        <div class="input-text">* API URL Path</div>
        <el-input v-model="settings.api_path" placeholder="URL Path" />
    </div>

    <el-button type="primary" class="saveButton" @click.stop="saveChanges">Save</el-button>
    <el-button @click.stop="discardChanges">Back</el-button>
</template>

<style scoped>
.input-field {
    margin-left: 10px;
    margin-right: 10px;
    margin-bottom: 20px;
}

.input-text {
    margin-bottom: 5px;
    font-size: 1.2em;
    font-weight: 600;
}

.input-select {
    width: 100%;
}

.saveButton {
    margin-left: 10px;
}
</style>
