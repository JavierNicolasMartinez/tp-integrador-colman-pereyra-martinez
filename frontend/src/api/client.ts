// URL base de la API
const BASE_URL = import.meta.env.VITE_API_URL;

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

// Función para establecer el token de autenticación
export function setAuthToken(token: string | null) {
    authToken = token;
}

// Función para realizar una solicitud a la API
export async function apiFetch<T>(
    path: string, // Ruta de la API a la que se desea hacer la solicitud
    options: RequestInit = {} // Opciones adicionales para la solicitud
): Promise<T> {

    const headers: HeadersInit = {
        'Content-Type': 'application/json', // Mandamos/esperamos formato json
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        ...options.headers, // Permite sobreescribir headers si es necesario
    }

    // Solicitud a la API con los headers y opciones proporcionadas
    const response = await fetch(`${BASE_URL}${path}`, { ...options, headers });

    if (!response.ok) {
        const body = await response.json().catch(() => ({}));

        throw new ApiError(response.status, body.message ?? 'Error de red');
    }

    // Retorna el cuerpo de la respuesta como JSON si no es un 204 No Content
    if (response.status === 204) { return undefined as T; }

    return response.json();
}