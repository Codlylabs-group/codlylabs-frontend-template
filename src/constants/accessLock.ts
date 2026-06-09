/**
 * Bloqueo temporal del onboarding público.
 *
 * Cuando está activo (default), se ocultan y bloquean los accesos a:
 *   - Workspace (/workspace y subrutas)
 *   - Login / Registro (/login, /register, callbacks OAuth, recuperación)
 *   - Precios (/pricing) y suscripción / billing (/billing)
 *
 * El objetivo es que ningún usuario pueda registrarse ni suscribirse por el
 * momento. El bloqueo NO aplica a subdominios tenant (white-label), donde el
 * login de sus propios usuarios debe seguir funcionando.
 *
 * Para reabrir el acceso público, definí en el entorno de build:
 *   VITE_PUBLIC_ACCESS_LOCKED=false
 * (o borrá este flag). Default = bloqueado.
 */
export const ACCESS_LOCKED = import.meta.env.VITE_PUBLIC_ACCESS_LOCKED !== 'false'
