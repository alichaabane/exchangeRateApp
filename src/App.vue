<script setup>
import { ref } from 'vue'
import ExchangeZiraat from './components/ExchangeZiraat.vue'
import ExchangeAkbank from './components/ExchangeAkbank.vue'
import ExchangeGlobal from "./components/ExchangeGlobal.vue";

const currentTab = ref('global')
</script>

<template>
  <div>
    <div class="tabs">
      <button :class="{ active: currentTab === 'global' }" @click="currentTab = 'global'">🌐 Global Exchange</button>
      <button :class="{ active: currentTab === 'ziraat' }" @click="currentTab = 'ziraat'">🏦 Ziraat Bankası</button>
      <button :class="{ active: currentTab === 'akbank' }" @click="currentTab = 'akbank'">🏦 Akbank Bankası</button>
    </div>

    <div class="tab-content">
      <ExchangeGlobal v-if="currentTab === 'global'" />
      <ExchangeZiraat v-if="currentTab === 'ziraat'" />
      <ExchangeAkbank v-if="currentTab === 'akbank'" />
    </div>
  </div>
</template>

<style scoped>
.tabs {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

button {
  padding: 10px 20px;
  margin: 0 10px;
  font-size: 16px;
  border: none;
  cursor: pointer;
  background: #eee;
  border-radius: 5px;
  transition: background 0.3s;
}

button.active {
  background: #42b983;
  color: white;
}

.tab-content {
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  max-width: 600px;
  margin: 0 auto;
}
</style>
