// Mensaje de validación debajo de un campo (reemplaza el globo nativo del navegador)
export function FieldError({ name, message }: { name: string; message: string | undefined }) {
  if (!message) return null;
  return (
    <span id={`${name}-error`} className="field-error" role="alert">
      {message}
    </span>
  );
}
