// URL base de la API (si falta la variable, se usa la del backend local)
const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

// Clase de error personalizada para manejar errores de la API
export class ApiError extends Error {
    public status: number; // Código de estado HTTP de la respuesta de la API

    constructor(status: number, message: string) {
        super(message);
        this.status = status; // El codigo de estado con el que respondió la API
        this.name = 'ApiError';
    }
}

// Variable para almacenar el token de autenticación
let authToken: string | null = null;

// Función a ejecutar cuando la API responde 401 con un token (vencido o inválido)
let onUnauthorized: (() => void) | null = null;

// Función para establecer el token de autenticación
export function setAuthToken(token: string | null) {
    authToken = token;
}

// La registra el AuthContext para cerrar la sesión si el token deja de ser válido
export function setUnauthorizedHandler(handler: (() => void) | null) {
    onUnauthorized = handler;
}

// Extrae el mensaje de error que manda el backend ({ message: '...' }) sin usar any
function getMessage(body: unknown, status: number): string {
    if (typeof body === 'object' && body !== null && 'message' in body && typeof body.message === 'string') {
        return body.message;
    }
    return `Error ${status}`;
}

// Mensaje legible para mostrar en pantalla a partir de cualquier error
export function getErrorMessage(error: unknown): string {
    if (error instanceof ApiError) return error.message;
    return 'Ocurrió un error inesperado';
}

// Función para realizar una solicitud a la API
export async function apiFetch<T>(
    path: string, // Ruta de la API a la que se desea hacer la solicitud
    options: RequestInit = {} // Opciones adicionales para la solicitud
): Promise<T> {

    const headers = new Headers(options.headers); // Permite sobreescribir headers si es necesario
    if (options.body !== undefined) {
        headers.set('Content-Type', 'application/json'); // Mandamos formato json
    }
    if (authToken) {
        headers.set('Authorization', `Bearer ${authToken}`);
    }

    // Solicitud a la API con los headers y opciones proporcionadas
    let response: Response;
    try {
        response = await fetch(`${BASE_URL}${path}`, { ...options, headers });
    } catch {
        throw new ApiError(0, 'No se pudo conectar con el servidor');
    }

    if (!response.ok) {
        const body: unknown = await response.json().catch(() => null);

        if (response.status === 401 && authToken) {
            onUnauthorized?.();
        }
        throw new ApiError(response.status, getMessage(body, response.status));
    }

    // Retorna el cuerpo de la respuesta como JSON si no es un 204 No Content
    if (response.status === 204) { return undefined as T; }

    return (await response.json()) as T;
}
