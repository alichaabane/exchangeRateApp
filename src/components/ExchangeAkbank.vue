<template>
  <div class="exchange-akbank">
    <div class="akbank-header">
      <img width="150px" height="auto" src="https://www.akbank.com/SiteAssets/img/logo.svg" alt="Akbank Logo" class="akbank-logo" />
      <!--      <span class="akbank-title">Akbank</span>-->
    </div>

    <h1>
      <span>🇪🇺 EUR → TRY 🇹🇷</span><br/>
      <span>🇹🇷 TRY → EUR 🇪🇺</span>
    </h1>

    <div v-if="loading">Loading Akbank exchange rate...</div>
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
          v-model.number="eurAmountBuy"
          class="amount-input"
          placeholder="EUR → TRY (Buy)"
      />
      <button class="reset-btn" @click="resetBuy" v-if="eurAmountBuy">×</button>
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
      <button class="reset-btn" @click="resetSell" v-if="eurAmountSell">×</button>
    </div>

    <div v-if="convertedSell !== null" class="calc-result">
      {{ eurAmountSell }} EUR ≈ <strong>{{ convertedSell }} TRY</strong> (Sell Rate)
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

const fetchAkbankRate = async () => {
  try {
    const response = await axios.post('http://localhost:3001/akbank')

    // Correctly access nested structure: d.Data.DovizKurlari
    const dovizList = response.data?.d?.Data?.DovizKurlari
    if (!Array.isArray(dovizList)) throw new Error('No rate list returned')

    const eur = dovizList.find(item => item.AlfaKod === 'EUR')
    if (!eur) throw new Error('EUR not found in list')

    return {
      buy: parseFloat(eur.DovizAlis),
      sell: parseFloat(eur.DovizSatis),
    }
  } catch (err) {
    console.error('Failed to get Akbank rate:', err)
    return null
  }
}



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

const lastUpdated = ref(null)
const countdown = ref(1800) // 30 minutes in seconds
let countdownTimer = null
const shouldResetCountdown = ref(true)

const fetchAllRates = async () => {
  loading.value = true

  const eurRates = await fetchAkbankRate()
  if (!eurRates) {
    error.value = 'Akbank rate fetch failed'
    loading.value = false
    return
  }

  buyRate.value = eurRates.buy.toFixed(4)
  sellRate.value = eurRates.sell.toFixed(4)

  lastUpdated.value = new Date()

  if (shouldResetCountdown.value) {
    countdown.value = 1800
  }

  loading.value = false

  localStorage.setItem('akbankRates', JSON.stringify({
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
  const stored = localStorage.getItem('akbankRates')

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

.exchange-akbank {
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

.akbank-header {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.akbank-logo {
  height: 50px;
  margin-right: 10px;
}

.akbank-title {
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
  left: 20%;
  top: 50%;
  transform: translateY(-50%);
  background: #ccc;
  color: #000;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  font-size: 15px;
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
