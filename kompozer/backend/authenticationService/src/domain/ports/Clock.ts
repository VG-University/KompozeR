// Clock — Porta di dominio per l'ottenimento del timestamp corrente.
// Astrae `new Date()` in modo che i test possano iniettare un orario fisso (FakeClock)
// e rendere deterministici tutti i calcoli temporali (expiresAt, loggedIn, loggedOut).
export interface Clock {
  now(): Date;
}
