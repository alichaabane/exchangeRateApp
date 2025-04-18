<template>
  <div class="exchange-ziraat">
    <div class="ziraat-header">
      <img src="https://www.ziraatbank.com.tr/SiteAssets/images/fb-logo.jpg" alt="Ziraat Bank"
           class="ziraat-logo"/>
      <span class="ziraat-title">Ziraat Bank</span>
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
    <p class="refresh-note">
      📌 We refresh exchange rates every <b>30</b> minutes.<br />
      ⏱️ Next refresh in: <b>{{ formatTime(countdown) }}</b><br />
      🕒 Last updated: {{ lastUpdated ? lastUpdated.toLocaleTimeString() : 'N/A' }}
    </p>

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
import {onMounted, onUnmounted, ref, watch} from 'vue'
import axios from 'axios'

const result = ref(null)
const error = ref(null)
const loading = ref(true)
const buyRate = ref(null)
const sellRate = ref(null)

const fetchZiraatRate = async (from, to, amount = 1) => {
  try {
    // 'http://localhost:3001/ziraat',
    const response = await axios.post(
        'https://exchangerateapp.onrender.com/ziraat',
        {
          alisDovizKodu: from,
          satisDovizKodu: to,
          alisTutari: amount
        }
    )

    const total = response.data?.d?.Data
    if (!total) throw new Error('No rate returned')

    const normalized = total / amount  // ✅ نحولها لسعر لوحدة واحدة
    return parseFloat(normalized.toFixed(6))
  } catch (err) {
    console.error(`Failed to get rate from ${from} to ${to}:`, err)
    return null
  }
}

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

const lastUpdated = ref(null)
const countdown = ref(1800) // 30 minutes in seconds
let countdownTimer = null
const shouldResetCountdown = ref(true)

const fetchAllRates = async () => {
  loading.value = true

  const eurToTry = await fetchZiraatRate('EUR', 'TRY')
  const eur = await fetchZiraatRate('TRY', 'EUR', 1000)
  const calculatedSell = 1 / eur

  buyRate.value = eurToTry.toFixed(4)
  sellRate.value = calculatedSell.toFixed(4)

  lastUpdated.value = new Date()

  // فقط نصفر العداد إذا مسموح reset
  if (shouldResetCountdown.value) {
    countdown.value = 1800
  }

  loading.value = false

  localStorage.setItem('ziraatRates', JSON.stringify({
    buyRate: buyRate.value,
    sellRate: sellRate.value,
    lastUpdated: lastUpdated.value
  }))

}


// التحديث اليدوي فقط لما المستخدم يرجع للتبويب
const handleVisibilityChange = () => {
  if (document.visibilityState === 'visible') {
    const now = new Date()
    const last = lastUpdated.value

    if (!last) {
      fetchAllRates()
    } else {

      const diffSeconds = (now - last) / 1000
      if (diffSeconds >= 1800) {
        // لا نصفر العداد هنا
        shouldResetCountdown.value = false
        fetchAllRates()
        shouldResetCountdown.value = true
      }
    }
  }
}

onMounted(() => {
  const stored = localStorage.getItem('ziraatRates')

  if (stored) {
    const parsed = JSON.parse(stored)
    const now = new Date()
    const then = new Date(parsed.lastUpdated)
    const diffSeconds = (now - then) / 1000

    if (diffSeconds < 1800) {
      buyRate.value = parsed.buyRate
      sellRate.value = parsed.sellRate
      lastUpdated.value = new Date(parsed.lastUpdated)
      countdown.value = 1800 - Math.floor(diffSeconds)

      loading.value = false
      // ⬇️ أضف هذا حتى لو ما عمل fetch
      countdownTimer = setInterval(() => {
        if (countdown.value > 0) {
          countdown.value--
        } else {
          fetchAllRates()
        }
      }, 1000)

      document.addEventListener('visibilitychange', handleVisibilityChange)

      return
    }
  }

  fetchAllRates()

  // ⬇️ أضف المؤقت هنا أيضًا
  countdownTimer = setInterval(() => {
    if (countdown.value > 0) {
      countdown.value--
    } else {
      fetchAllRates()
    }
  }, 1000)

  document.addEventListener('visibilitychange', handleVisibilityChange)
})

onUnmounted(() => {
  if (countdownTimer) clearInterval(countdownTimer)
  document.removeEventListener('visibilitychange', handleVisibilityChange)
})

const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

defineExpose({ formatTime })

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
