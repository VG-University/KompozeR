// IdGenerator — Porta di dominio per la generazione di identificatori univoci.
// Astrae UUID v4 (produzione) in modo che i test possano usare FakeIdGenerator,
// che produce id sequenziali e prevedibili (utile per le asserzioni nei test).
export interface IdGenerator {
  generate(): string;
}
