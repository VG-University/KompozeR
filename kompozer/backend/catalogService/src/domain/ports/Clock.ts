// Clock — Porta di dominio per l'ottenimento del timestamp corrente.
// Astrae `new Date()` per rendere i test deterministici (FakeClock).
export interface Clock {
  now(): Date;
}
