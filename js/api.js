// ═══════════════════════════════════════════════════════════════
//  API CLIENT – Helper de peticiones HTTP con JWT
//  Sistema Clínico · Render Backend
// ═══════════════════════════════════════════════════════════════
//
//  Reemplaza la integración con Firebase. Ahora guardamos el token
//  JWT en localStorage y lo adjuntamos en cada petición a la API.
// ═══════════════════════════════════════════════════════════════

// ── Gestión del token JWT ─────────────────────────────────────

/**
 * Guarda el JWT en localStorage tras un login exitoso.
 * @param {string} token - El JWT retornado por el backend
 */
function guardarToken(token) {
  localStorage.setItem("jwt_token", token);
}

/**
 * Lee el JWT guardado en localStorage.
 * @returns {string|null} El token, o null si no hay sesión activa
 */
function obtenerToken() {
  return localStorage.getItem("jwt_token");
}

/**
 * Elimina el JWT de localStorage (equivalente a cerrar sesión).
 */
function eliminarToken() {
  localStorage.removeItem("jwt_token");
}

/**
 * Decodifica el payload del JWT sin verificar la firma.
 * Sirve para leer el rol y uid del usuario actual en el frontend.
 * @returns {object|null} El payload decodificado, o null si no hay token
 */
function decodificarToken() {
  const token = obtenerToken();
  if (!token) return null;
  try {
    // El JWT tiene 3 partes separadas por '.': header.payload.signature
    // Solo necesitamos el payload (índice 1)
    const payload = token.split(".")[1];
    // El payload está en Base64URL, lo convertimos a JSON
    return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
  } catch {
    return null;
  }
}

/**
 * Verifica si hay una sesión activa y el token no ha expirado.
 * @returns {boolean} true si hay sesión válida
 */
function estaAutenticado() {
  const claims = decodificarToken();
  if (!claims) return false;
  // El campo 'exp' del JWT es la fecha de expiración en segundos Unix
  return claims.exp > Date.now() / 1000;
}

// ── Funciones de petición HTTP ────────────────────────────────

/**
 * Función base que construye y ejecuta una petición HTTP a la API.
 * Agrega automáticamente el token JWT en el header Authorization.
 * @param {string} endpoint - Ruta relativa (ej: '/auth/login')
 * @param {string} method - Método HTTP ('GET', 'POST', 'PUT', 'PATCH', 'DELETE')
 * @param {object|null} body - Cuerpo de la petición (para POST/PUT/PATCH)
 * @returns {Promise<any>} La respuesta JSON de la API
 * @throws {Error} Si el servidor retorna un error (status >= 400)
 */
async function peticion(endpoint, method = "GET", body = null) {
  const token = obtenerToken();

  // Construir los headers de la petición
  const headers = { "Content-Type": "application/json" };

  // Si hay token guardado, agregarlo como Bearer en el header
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Opciones de la petición fetch
  const opciones = { method, headers };

  // Si hay body, convertirlo a JSON string
  if (body) {
    opciones.body = JSON.stringify(body);
  }

  // Ejecutar la petición a la URL completa
  const respuesta = await fetch(`${API_BASE_URL}${endpoint}`, opciones);
  const datos = await respuesta.json();

  // Si el servidor retornó un error, lanzar una excepción con el mensaje
  if (!respuesta.ok) {
    throw new Error(datos.detail || datos.error || "Error en la petición");
  }

  return datos;
}

// Atajos para cada método HTTP
const apiGet    = (endpoint)        => peticion(endpoint, "GET");
const apiPost   = (endpoint, body)  => peticion(endpoint, "POST",  body);
const apiPut    = (endpoint, body)  => peticion(endpoint, "PUT",   body);
const apiPatch  = (endpoint, body)  => peticion(endpoint, "PATCH", body);
const apiDelete = (endpoint)        => peticion(endpoint, "DELETE");
