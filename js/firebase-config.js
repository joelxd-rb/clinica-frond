// ═══════════════════════════════════════════════════════════════
//  CONFIGURACIÓN DE LA API – Frontend SPA
//  Sistema Clínico · Render Backend
// ═══════════════════════════════════════════════════════════════
//
//  Ya NO usamos Firebase. Toda la comunicación es directamente
//  con nuestra API en Render a través de fetch() + JWT en localStorage.
// ═══════════════════════════════════════════════════════════════

// URL base de la API en Render
// En producción apunta al servidor de Render.
// En desarrollo local usa http://localhost:3000
const API_BASE_URL = window.location.hostname === "localhost"
  ? "http://localhost:3000/api"
  : "https://clinica-bakend-1.onrender.com/api";
