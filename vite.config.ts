import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 현재 모드(development/production)에 맞는 환경 변수를 로드합니다.
  // Fix: Property 'cwd' does not exist on type 'Process'. 
  // We cast to any to ensure access to Node.js's process.cwd() in the Vite config context.
  const env = loadEnv(mode, (process as any).cwd(), '');
  
  return {
    plugins: [react()],
    define: {
      // process.env 전체를 넘기지 않고 필요한 변수만 명시적으로 주입하여 오류 방지
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    }
  };
});
