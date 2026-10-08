import { useState } from 'react';

type FormControl = HTMLInputElement | HTMLTextAreaElement;

// Traduce el estado de validación nativo del campo a un mensaje propio
function getValidationMessage(field: FormControl): string {
  const { validity } = field;
  if (validity.valueMissing) return 'Completá este campo.';
  if (validity.typeMismatch && field.type === 'email') return 'Ingresá un correo válido (ej.: nombre@mail.com).';
  if (validity.tooShort) return `Usá al menos ${field.minLength} caracteres.`;
  if (validity.tooLong) return `Usá como máximo ${field.maxLength} caracteres.`;
  return 'Revisá este campo.';
}

// Reemplaza los globos de validación del navegador (el form usa noValidate) por mensajes debajo de cada campo.
// Usa las mismas reglas del HTML (required, type, minLength...) y los campos se identifican por su "name".
export function useFieldErrors() {
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Devuelve true si todo es válido; si no, muestra los errores y enfoca el primer campo inválido
  function validate(form: HTMLFormElement): boolean {
    const found: Record<string, string> = {};
    let firstInvalid: FormControl | null = null;

    for (const element of Array.from(form.elements)) {
      if (!(element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) || !element.name) continue;
      // Un campo con solo espacios cuenta como vacío
      const blank = element.required && element.value.trim() === '';
      // validity.tooShort solo se activa si el valor lo escribió el usuario, por eso se verifica a mano
      const short = element.minLength > 0 && element.value !== '' && element.value.length < element.minLength;
      if (blank || short || !element.checkValidity()) {
        found[element.name] = blank
          ? 'Completá este campo.'
          : short
            ? `Usá al menos ${element.minLength} caracteres.`
            : getValidationMessage(element);
        firstInvalid ??= element;
      }
    }

    setErrors(found);
    firstInvalid?.focus();
    return firstInvalid === null;
  }

  // Muestra un error propio de la página (por ejemplo, contraseñas que no coinciden)
  function setFieldError(name: string, message: string) {
    setErrors((current) => ({ ...current, [name]: message }));
  }

  function clearError(name: string) {
    setErrors((current) => {
      if (!(name in current)) return current;
      const { [name]: _removed, ...rest } = current;
      return rest;
    });
  }

  // Atributos de accesibilidad para el campo: lo marca como inválido y lo vincula con su mensaje
  function fieldProps(name: string) {
    return {
      name,
      'aria-invalid': name in errors ? true : undefined,
      'aria-describedby': name in errors ? `${name}-error` : undefined,
    };
  }

  return { errors, validate, setFieldError, clearError, fieldProps };
}
