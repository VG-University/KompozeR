// Component — Entità di dominio principale del catalogService.
// Rappresenta un singolo componente fisico del sistema Kompo.
//
// Nota sui prezzi: `price` è espresso in centesimi di euro (intero) per evitare
// errori floating-point. Es: 1990 = 19,90€.
//
// Nota sulla compatibilità: `compatibleWith` contiene SKU di altri componenti
// con cui questo componente è geometricamente e strutturalmente compatibile.
// È la fonte di verità usata dal cadService per validare le configurazioni.
//
// Nota sulla concorrenza [DS]: `version` implementa Optimistic Concurrency Control.
// Ogni aggiornamento incrementa la versione; se due admin aggiornano in parallelo,
// chi arriva per secondo riceve un conflitto invece di un silent overwrite.
import { ComponentCategory } from './ComponentCategory';
import { ComponentType }     from './ComponentType';
import { Dimensions }        from './Dimensions';

export interface Component {
  id:             string;
  sku:            string;
  name:           string;
  description:    string;
  category:       ComponentCategory;
  Type:           ComponentType;
  price:          number;         // centesimi di euro, intero ≥ 0
  isAvailable:    boolean;        // flag esplicito di disponibilità (admin-settabile)
  imageUrl:       string;
  dimensions:     Dimensions;
  compatibleWith: string[];       // array di SKU compatibili
  version:        number;         // [DS] optimistic concurrency control, parte da 1
  createdAt:      Date;
  updatedAt:      Date;
}
