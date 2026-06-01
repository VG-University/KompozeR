// ComponentFilter — DTO di input per la ricerca/filtraggio del catalogo.
// Tutti i campi sono opzionali: se omessi non viene applicato alcun filtro.
// La paginazione usa page (1-based) + limit; i valori di default sono applicati
// nel use case ListComponents, non qui nel tipo.
import { ComponentCategory } from '../entities/ComponentCategory';

export interface ComponentFilter {
  category?:  ComponentCategory;
  minPrice?:  number;   // centesimi, inclusivo
  maxPrice?:  number;   // centesimi, inclusivo
  available?: boolean;  // se true: solo isAvailable=true
  search?:    string;   // full-text su name e description
  page?:      number;   // 1-based, default 1
  limit?:     number;   // max risultati per pagina, default 20
}
