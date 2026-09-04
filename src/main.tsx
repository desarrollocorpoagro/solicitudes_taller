import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Parche de resiliencia para llamadas fetch(): si un proxy o el servidor devuelve HTML
// (ej. 504 Gateway Timeout o 404 HTML), res.json() no lanzará el SyntaxError
// "Unexpected token '<', <html>... is not valid JSON", sino un objeto con el error limpio.
const originalJson = Response.prototype.json;
Response.prototype.json = async function () {
  const contentType = this.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      return await originalJson.call(this);
    } catch {
      return { success: false, error: 'Error al interpretar respuesta JSON del servidor.' };
    }
  }

  try {
    const rawText = await this.text();
    const cleanSnippet = rawText.replace(/<[^>]*>?/gm, '').trim().slice(0, 160);
    return {
      success: false,
      error: cleanSnippet || `Error ${this.status}: El servidor no devolvió una respuesta JSON válida.`,
      status: this.status,
    };
  } catch {
    return {
      success: false,
      error: `Error ${this.status}: Respuesta del servidor no válida.`,
      status: this.status,
    };
  }
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
