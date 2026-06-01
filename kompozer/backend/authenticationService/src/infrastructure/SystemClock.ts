// SystemClock — Implementazione reale di Clock.
// Restituisce semplicemente `new Date()` dal sistema operativo.
// Separata in una classe per consentire l'iniezione di FakeClock nei test
// e rendere deterministici tutti i calcoli temporali.
import { Clock } from '../domain/ports/Clock';

export class SystemClock implements Clock {
  now(): Date {
    return new Date();
  }
}
