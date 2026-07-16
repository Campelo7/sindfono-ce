/**
 * Máscaras de formatação — funções PURAS, sem I/O, totalmente testáveis.
 *
 * Regra: a UI aplica máscaras para legibilidade; o servidor SEMPRE revalida e
 * persiste a versão sanitizada (só dígitos) via branded types. Ver §10 da bíblia.
 *
 * `formatCpfForDisplay` faz mascaramento PARCIAL para logs/telas administrativas
 * (LGPD §9.1): nunca exibimos o CPF completo onde não é estritamente necessário.
 */

import { onlyDigits } from "@/lib/branded-types";

/** `12345678900` ou `123.456.789-00` → `123.456.789-00`. Tolera entrada parcial. */
export const maskCpf = (value: string): string => {
  const digits = onlyDigits(value).slice(0, 11);
  const parts = [
    digits.slice(0, 3),
    digits.slice(3, 6),
    digits.slice(6, 9),
    digits.slice(9, 11),
  ];
  let result = parts[0];
  if (parts[1]) result += `.${parts[1]}`;
  if (parts[2]) result += `.${parts[2]}`;
  if (parts[3]) result += `-${parts[3]}`;
  return result;
};

/** Remove a máscara de CPF, retornando só dígitos. */
export const unmaskCpf = (value: string): string => onlyDigits(value).slice(0, 11);

/** `60000000` → `60000-000`. Tolera entrada parcial. */
export const maskCep = (value: string): string => {
  const digits = onlyDigits(value).slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
};

/** Remove a máscara de CEP, retornando só dígitos. */
export const unmaskCep = (value: string): string => onlyDigits(value).slice(0, 8);

/**
 * Telefone BR. 10 dígitos → `(85) 1234-5678`; 11 dígitos → `(85) 91234-5678`.
 * Tolera entrada parcial enquanto o usuário digita.
 */
export const maskPhone = (value: string): string => {
  const digits = onlyDigits(value).slice(0, 11);
  if (digits.length === 0) return "";
  if (digits.length <= 2) return `(${digits}`;
  const ddd = digits.slice(0, 2);
  const rest = digits.slice(2);
  if (rest.length <= 4) return `(${ddd}) ${rest}`;
  const isMobile = rest.length > 8 || (digits.length === 11);
  const splitAt = isMobile ? 5 : 4;
  return `(${ddd}) ${rest.slice(0, splitAt)}-${rest.slice(splitAt)}`;
};

/** Remove a máscara de telefone, retornando só dígitos. */
export const unmaskPhone = (value: string): string => onlyDigits(value).slice(0, 11);

/**
 * Mascaramento PARCIAL de CPF para logs e telas administrativas (LGPD).
 * Mantém apenas o miolo: `***.456.789-**`. Entradas inválidas viram `***`.
 */
export const formatCpfForDisplay = (value: string): string => {
  const digits = onlyDigits(value);
  if (digits.length !== 11) return "***";
  return `***.${digits.slice(3, 6)}.${digits.slice(6, 9)}-**`;
};
