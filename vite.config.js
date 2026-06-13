import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
    // host: true ecoute sur toutes les interfaces (0.0.0.0 + ::1 + IP LAN).
    // Necessaire quand un VPN comme Happ/Hiddify intercepte le loopback,
    // l'app reste accessible via l'IP de l'interface VPN ou l'IP LAN.
    host: true,
    // strictPort evite que Vite saute sur 3002 si 3001 est pris ; on
    // veut savoir tout de suite si y'a un conflit.
    strictPort: true,
    // proxy: {
    //   '/api':{
    //     target: 'localhost:5000',
    //     changeOrigin:true
    //   }
    // }
  },
  // Ajoutez d'autres configurations ici
  assetsInclude: ['**/*.xlsx'],
  resolve: {
    // Ajoutez ici les extensions que vous souhaitez prendre en charge
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
  },
})
