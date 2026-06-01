// IdGenerator — Porta di dominio per la generazione di identificatori univoci.
// Astrae UUID v4 (produzione) per permettere id sequenziali e prevedibili nei test.
export interface IdGenerator {
  generate(): string;
}
