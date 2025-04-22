<template>
  <div class="exchange-akbank">
    <div class="ziraat-header">
      <img src="https://www.akbank.com/SiteAssets/img/logo.svg" alt="Akbank Logo" class="ziraat-logo" />
      <span class="ziraat-title">Akbank</span>
    </div>

    <h1>
      <span>🇪🇺 EUR → TRY 🇹🇷</span><br />
      <span>🇹🇷 TRY → EUR 🇪🇺</span>
    </h1>

    <div v-if="loading">Loading Akbank exchange rate...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else>
      <p><strong>Buy (TRY):</strong> {{ buyRate }}</p>
      <p><strong>Sell (TRY):</strong> {{ sellRate }}</p>
    </div>

    <div class="calc-container">
      <div class="input-wrapper">
        <input
            type="number"
            v-model.number="eurAmountBuy"
            class="amount-input"
            placeholder="EUR → TRY (Buy)"
        />
        <button class="reset-btn" @click="resetBuy">✕</button>
      </div>
      <div v-if="convertedBuy !== null" class="calc-result">
        {{ eurAmountBuy }} EUR ≈ <strong>{{ convertedBuy }} TRY</strong> (Buy Rate)
      </div>
    </div>

    <div class="calc-container">
      <div class="input-wrapper">
        <input
            type="number"
            v-model.number="eurAmountSell"
            class="amount-input"
            placeholder="EUR → TRY (Sell)"
        />
        <button class="reset-btn" @click="resetSell">✕</button>
      </div>
      <div v-if="convertedSell !== null" class="calc-result">
        {{ eurAmountSell }} EUR ≈ <strong>{{ convertedSell }} TRY</strong> (Sell Rate)
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import axios from 'axios'

const loading = ref(true)
const error = ref(null)
const buyRate = ref(null)
const sellRate = ref(null)

const eurAmountBuy = ref(1)
const eurAmountSell = ref(1)
const convertedBuy = ref(null)
const convertedSell = ref(null)

const resetBuy = () => {
  eurAmountBuy.value = 1
  convertedBuy.value = null
}
const resetSell = () => {
  eurAmountSell.value = 1
  convertedSell.value = null
}

watch([eurAmountBuy, buyRate], () => {
  if (buyRate.value && eurAmountBuy.value >= 0) {
    convertedBuy.value = (eurAmountBuy.value * buyRate.value).toFixed(2)
  } else {
    convertedBuy.value = null
  }
})

watch([eurAmountSell, sellRate], () => {
  if (sellRate.value && eurAmountSell.value >= 0) {
    convertedSell.value = (eurAmountSell.value * sellRate.value).toFixed(2)
  } else {
    convertedSell.value = null
  }
})

const fetchAkbankRates = async () => {
  try {
    // 'http://localhost:3001/akbank',
    // 'https://exchangerateapp.onrender.com/akbank',

    const response = await axios.post('https://exchangerateapp.onrender.com/akbank')
    const currencies = response.data?.Data?.DovizKurlari

    const euro = currencies.find(item => item.AlfaKod === 'EUR')

    buyRate.value = parseFloat(euro.DovizAlis).toFixed(4)
    sellRate.value = parseFloat(euro.DovizSatis).toFixed(4)
  } catch (err) {
    error.value = 'Failed to load exchange rates.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchAkbankRates()
})
</script>

<style scoped>
h1 {
  font-size: 1.5rem;
  margin-bottom: 20px;
  line-height: 1.6;
}

.exchange-ziraat {
  max-width: 400px;
  margin: 50px auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  text-align: center;
  font-family: sans-serif;
}

.error {
  color: red;
}

.ziraat-header {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.ziraat-logo {
  height: 50px;
  margin-right: 10px;
}

.ziraat-title {
  font-size: 1.6rem;
  font-weight: bold;
  color: #c10000;
}

.calc-container {
  margin-top: 25px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.amount-input {
  padding: 10px 20px;
  border: none;
  border-radius: 20px;
  font-size: 1rem;
  width: 60%;
  text-align: right;
  background-color: #fff;
  box-shadow: 0 0 2px #ccc;
}

.calc-btn {
  background-color: #c10000;
  color: white;
  font-weight: bold;
  padding: 10px 30px;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.3s;
}

.calc-btn:hover {
  background-color: #a80000;
}

.calc-result {
  font-size: 1.1rem;
  margin-top: 10px;
}

.input-wrapper {
  position: relative;
  width: 80%;
}

.reset-btn {
  position: absolute;
  left: 50px;
  top: 50%;
  transform: translateY(-50%);
  background: #ccc;
  color: #000;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  font-size: 16px;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.reset-btn:hover {
  background: #999;
}

.refresh-note {
  font-size: 0.85rem;
  color: #555;
  margin-top: 15px;
  line-height: 1.4;
}

</style>
