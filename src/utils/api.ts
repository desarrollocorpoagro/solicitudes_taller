/**
 * Utilidad para procesar respuestas de red asegurando parsing seguro de JSON
 * y previniendo excepciones SyntaxError "Unexpected token '<', <html>..."
 * en caso de que el proxy, Vite o un error 500/502/504 devuelva HTML.
 */
export async function parseJsonResponse<T = any>(res: Response, fallbackError = 'Error en el servidor'): Promise<T> {
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      return await res.json();
    } catch {
      throw new Error('Error al interpretar la respuesta JSON del servidor.');
    }
  }

  const rawText = await res.text();
  const cleanSnippet = rawText.replace(/<[^>]*>?/gm, '').trim().slice(0, 150);
  
  if (!res.ok) {
    throw new Error(cleanSnippet || `${fallbackError} (HTTP ${res.status})`);
  }
  
  throw new Error(cleanSnippet || 'Respuesta no válida del servidor.');
}

/**
 * Fetch seguro que incluye encabezados JSON y procesa la respuesta garantizando objeto JSON
 */
export async function safeFetch<T = any>(url: string, options: RequestInit = {}): Promise<{ res: Response; data: T }> {
  const res = await fetch(url, options);
  const data = await parseJsonResponse<T>(res);
  return { res, data };
}
