<template>
  <div class="exchange-page">
    <div class="global-header">
      <img src="https://www.fxexchangerate.com/static/pair/try/tryeur.webp" alt="exchangerates"
           class="global-logo"/>
      <span class="global-title">Global (Frankfurt Bank)</span>
    </div>

    <h1>
      <span>🇪🇺 EUR → TRY 🇹🇷</span><br/>
      <span>🇹🇷 TRY → EUR 🇪🇺</span>
    </h1>

    <div v-if="loading">Loading Ziraat exchange rate...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else>
      <p><strong>Buy (TRY):</strong> {{ buyRate }}</p>
      <p><strong>Sell (TRY):</strong> {{ sellRate }}</p>
    </div>
  </div>

  <div class="calc-container">
    <div class="input-wrapper">
      <input
          type="number"
          v-model.number="eurAmount"
          class="amount-input"
          placeholder="Enter EUR amount"
      />
      <button class="reset-btn" @click="resetEur">✕</button>
    </div>
    <div v-if="convertedAmount !== null" class="calc-result">
      {{ eurAmount }} EUR ≈ <strong>{{ convertedAmount }} TRY</strong>
    </div>
  </div>

  <div class="calc-container">
    <div class="input-wrapper">
      <input
          type="number"
          v-model.number="tryAmount"
          class="amount-input"
          placeholder="Enter TRY amount"
      />
      <button class="reset-btn" @click="resetTry">✕</button>
    </div>
    <div v-if="convertedEUR !== null" class="calc-result">
      {{ tryAmount }} TRY ≈ <strong>{{ convertedEUR }} EUR</strong>
    </div>
  </div>

</template>

<script setup>

import {onMounted, ref, watch} from 'vue'
import axios from 'axios'

const buyRate = ref(null)
const sellRate = ref(null)
const loading = ref(true)
const error = ref(null)

const FRANKFURTER_API = 'https://api.frankfurter.app/latest?from=EUR&to=TRY'

const eurAmount = ref(1)
const convertedAmount = ref(null)

const calculateEUR = () => {
  if (!buyRate.value || tryAmount.value <= 0) {
    convertedEUR.value = null
    return
  }
  convertedEUR.value = (tryAmount.value / buyRate.value).toFixed(2)
}

const tryAmount = ref(1)
const convertedEUR = ref(null)

const calculateTRY = () => {
  if (!sellRate.value || eurAmount.value <= 0) {
    convertedAmount.value = null
    return
  }
  convertedAmount.value = (eurAmount.value * sellRate.value).toFixed(2)
}

onMounted(async () => {
  try {
    const { data } = await axios.get(FRANKFURTER_API)
    const midRate = data?.rates?.TRY

    if (midRate) {
      buyRate.value = (midRate * 0.99).toFixed(2)  // Bank buys EUR at lower rate
      sellRate.value = (midRate * 1.01).toFixed(2) // Bank sells EUR at higher rate
    } else {
      error.value = 'Rate not found in response.'
    }
  } catch (e) {
    error.value = 'Network error while fetching exchange rate.'
  } finally {
    loading.value = false
  }
})


watch([eurAmount, sellRate], () => {
  if (sellRate.value && eurAmount.value >= 0) {
    convertedAmount.value = (eurAmount.value * sellRate.value).toFixed(2)
  } else {
    convertedAmount.value = null
  }
})

watch([tryAmount, buyRate], () => {
  if (buyRate.value && tryAmount.value >= 0) {
    convertedEUR.value = (tryAmount.value / buyRate.value).toFixed(2)
  } else {
    convertedEUR.value = null
  }
})

const resetEur = () => {
  eurAmount.value = 1
  convertedAmount.value = null
}

const resetTry = () => {
  tryAmount.value = 1
  convertedEUR.value = null
}

</script>

<style scoped>
h1 {
  font-size: 1.5rem;
  margin-bottom: 20px;
  line-height: 1.6;
}

.exchange-page {
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

.global-header {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.global-logo {
  height: 50px;
  margin-right: 10px;
}

.global-title {
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


</style>
