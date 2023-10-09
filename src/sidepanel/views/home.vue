<script>
import { marked } from 'marked';

const storage = chrome.storage.local;
let settings = null;

export default {
    props: {},
    data() {
        return {
            inputs: {
                word1: '',
                word2: '',
                word3: ''
            },
            response_text: '',
            error_text: '',
            loading: false,
        }
    },
    computed: {
        displayWord2() {
            return this.inputs.word1.length > 0
        },
        displayWord3() {
            return this.inputs.word2.length > 0
        },
        displayError() {
            return this.error_text.length > 0
        },
        markdownToHtml() {
            return marked(this.response_text);
        }
    },
    created() {
        storage.get('settings', (result) => {
            if (!result?.settings || !result?.settings?.api_key?.length > 0) {
                this.$router.replace('/settings')
            } else {
                settings = result.settings;
            }
        });

        chrome.runtime.onMessage.addListener(({ name, data }) => {
            if (name === 'look-up') {
                const word = data.value;
                this.inputs.word1 = word;
                this.inputs.word2 = '';
                this.inputs.word3 = '';
            }
        });
    },
    methods: {
        settingClicked(e) {
            this.$router.replace('/settings')
        },

        handleSearch(e) {
            if (this.loading) {
                return;
            }
            this.loading = true;
            setTimeout(() => { this.loading = false; }, 60*1000);
            this.response_text = '';
            this.error_text = '';
            this.api_call(this.inputs.word1, this.inputs.word2, this.inputs.word3);
        },

        api_call(word1, word2, word3) {
            if (!word1.trim()) {
                this.error_text = "Please enter a word to define.";
                return;
            }

            let prompt = '';
            if (word3.trim().length > 0) {
                prompt = `Please describe the differences between the following words: "${word1}", "${word2}" and "${word3}".` +
                    `First, provide their relative frequency of usage in the language.` +
                    `Then, give separate example sentences using these two words to highlight their distinct usages.`;
            } else if (word2.trim().length > 0) {
                prompt = `Please describe the differences between the following words: "${word1}" and "${word2}".` +
                    `First, provide their relative frequency of usage in the language.` +
                    `Then, give separate example sentences using these two words to highlight their distinct usages.`;
            } else {
                prompt = `
Please explain the meaning of the word "${word1}" in as simple and concise terms as possible, addressing the following aspects:

1. Frequency of use and typical contexts where it is used.
2. The meaning of the word and examples, if the word has multiple meanings. Please explain each meaning separately and provide examples for the most common and primary meaning.
3. Offer some synonyms or easily confused words related to this word and make comparisons.

Please refer to the examples below: 
>> Input Word: Emerge
>> Output Answer: 
"""
**Frequency and Typical Contexts**
- Commonly used in everyday language.
- Used in various contexts, including discussions about events, situations, or objects becoming visible, known, or apparent.

**Meaning and Examples**
- To come forth, appear, or become noticeable, often after being hidden or unseen.
  - Example: After a long winter, flowers emerge from the ground in the spring.
- To come into existence or become known, often in a gradual or noticeable way.
  - The talented singer began to emerge as a star after her viral performance.

**Synonyms and Confused Words**
- Emerge vs. Appear
  - Emerge suggests a gradual or unexpected coming into view, often from a hidden or obscured state, while appear simply means something becomes visible or noticeable, without implying any prior concealment.
- Emerge vs. Arise
  - Emerge implies something coming forth or becoming visible, often from obscurity or concealment, while arise suggests something coming into existence or happening, often in response to a situation or circumstance.
"""
`;
            }

            let requestOptions = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + settings.api_key
                },
                body: JSON.stringify({
                    "model": settings.api_model,
                    "messages": [
                        { "role": "system", "content": "You are a helpful assistant." },
                        { "role": "user", "content": prompt },
                    ],
                    "max_tokens": 2048,
                    "temperature": 0,
                    "stream": true
                })
            };

            const fullUrl = new URL(settings.api_path, settings.api_url).toString();
            fetch(fullUrl, requestOptions)
                .then(response => {
                    this.response_stream(response);
                })
                .catch(error => {
                    this.error_text = "Failed to get response from API. Error Message: " + error.message;
                });
        },

        // "stolen" from https://github.com/EduardR02/Faster-ChatGPT/
        // and https://umaar.com/dev-tips/269-web-streams-openai/ and https://www.builder.io/blog/stream-ai-javascript
        async response_stream(response_stream) {
            const reader = response_stream.body.getReader();
            const decoder = new TextDecoder("utf-8");
            try {
                // See https://www.nuomiphp.com/t/64a6d714e078ea70dc2d7723.html
                let errObj = '';
                while (1) {
                    const { done, value } = await reader.read();
                    if (done) {
                        this.response_text += "\n\n[DONE]";
                        break;
                    }
                    const chunk = decoder.decode(value);
                    const lines = chunk
                        .split("\n")
                        .map((line) => line.replace("data: ", "").trim())
                        .filter((line) => line.length > 0)
                        .filter((line) => line !== "[DONE]")
                        .map((line) => {
                            try {
                                if (errObj != '') {
                                    line = errObj + line
                                    errObj = ''
                                }
                                return JSON.parse(line)
                            } catch {
                                errObj = line
                                return { choices: [{ delta: { content: "" } }] }
                            }
                        });
                    // Destructuring!
                    for (const parsedLine of lines) {
                        const { choices } = parsedLine;
                        const { delta } = choices[0];
                        const { content, function_call, finish_reason } = delta;
                        if (content) {
                            this.response_text += content
                        }
                    }
                }
            }
            catch (error) {
                this.error_text = "Failed to get response from API. Error Message: " + error.message;
            }
            this.loading = false;
        }
    }
}
</script>

<template>
    <div class="search-container">
        <el-input v-model="inputs.word1" placeholder="Please Enter a Word" maxlength="20" class="input-box"
            @keyup.enter="handleSearch"></el-input>
        <el-input v-model="inputs.word2" v-if="displayWord2" placeholder="Enter a Word to Compare [Optional]" maxlength="20"
            class="input-box" @keyup.enter="handleSearch"></el-input>
        <el-input v-model="inputs.word3" v-if="displayWord3" placeholder="Enter a Word to Compare [Optional]" maxlength="20"
            class="input-box" @keyup.enter="handleSearch"></el-input>
        <el-button type="primary" class="searchButton" @click.stop="handleSearch" :disabled="loading" plain>
            <div class="loadingIcon">
                <el-icon v-if="loading" size="18" class="is-loading"><Loading /></el-icon>
            </div>
            Define and Compare
        </el-button>
    </div>

    <p v-id="displayError">{{ error_text }}</p>
    <div v-html="markdownToHtml"></div>

    <el-button class="settingButton" @click.stop="settingClicked" text>
        <el-icon :size="18">
            <Setting />
        </el-icon>
    </el-button>
</template>

<style scoped>
.input-box {
    margin-bottom: 10px;
}

.searchButton {
    width: 100%;
}

.loadingIcon {
    margin-right: 5px;
}

.settingButton {
    position: absolute;
    bottom: 0;
    left: 0;
    padding: 0;
    width: 30px;
    height: 30px;
}
</style>
