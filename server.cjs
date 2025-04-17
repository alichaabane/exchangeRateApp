// server.js
const express = require('express')
const cors = require('cors')
const axios = require('axios')

const app = express()
app.use(cors())
app.use(express.json())

app.post('/ziraat', async (req, res) => {
    try {
        const response = await axios.post(
            'https://www.ziraatbank.com.tr/en/_layouts/15/Ziraat/HesaplamaAraclari/Ajax.aspx/DovizCevirici',
            req.body,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        )
        res.json(response.data)
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Ziraat proxy error' })
    }
})

app.listen(3001, () => {
    console.log('Proxy server running on http://localhost:3001')
})
