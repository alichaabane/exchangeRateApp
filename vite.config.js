import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
    plugins: [
        vue(),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['favicon.png'],
            manifest: {
                name: 'My Doviz App',
                short_name: 'DovizApp',
                description: 'Live currency rates from Ziraat and Global APIs',
                theme_color: '#c10000',
                icons: [
                    {
                        src: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRIb8DmDSvvBVjnylmjpk-QG1QlRmVgAaxFNw&s',
                        sizes: '192x192',
                        type: 'image/png'
                    },
                    {
                        src: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRIb8DmDSvvBVjnylmjpk-QG1QlRmVgAaxFNw&s',
                        sizes: '512x512',
                        type: 'image/png'
                    }
                ]
            }
        })],
    server: {
        proxy: {
            '/ziraat-api': {
                target: 'https://www.ziraatbank.com.tr',
                changeOrigin: true,
                secure: false,
                rewrite: path => path.replace(/^\/ziraat-api/, '')
            }
        }
    }
})
