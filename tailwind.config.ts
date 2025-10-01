import type { Config } from 'tailwindcss'
const config: Config = {darkMode:['class'],content:['./app/**/*.{ts,tsx,css}','./components/**/*.{ts,tsx}','./public/**/*.html'],theme:{extend:{colors:{bg:'#0b0f1a',card:'#121827',neon:'#6ee7ff',accent:'#00ffc6',muted:'#94a3b8'},boxShadow:{glow:'0 0 15px rgba(110,231,255,0.4)'}}},plugins:[]};
export default config;
