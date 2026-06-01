// Dimensions — Value object che rappresenta le dimensioni fisiche di un componente.
// Tutte le misure sono in millimetri (interi) per evitare errori di arrotondamento
// floating-point durante i calcoli di compatibilità spaziale nel configuratore.
export interface Dimensions {
  widthMm:  number; // larghezza
  heightMm: number; // altezza
  depthMm:  number; // profondità
}
