// types — DTO di input e output per tutti i use case del catalogService.
// I DTO di output non espongono mai direttamente l'entità di dominio:
// - Separano il contratto HTTP dal modello interno
// - Permettono di evolvere i due indipendentemente
// - Rendono espliciti i campi restituiti ai client
import { ComponentCategory } from '../domain/entities/ComponentCategory';
import { ComponentType }     from '../domain/entities/ComponentType';

// ─── Output DTO ──────────────────────────────────────────────────────────────

export interface DimensionsDto {
  widthMm:  number;
  heightMm: number;
  depthMm:  number;
}

// Rappresentazione completa di un componente, usata da GetComponent e CreateComponent.
export interface ComponentDto {
  id:             string;
  sku:            string;
  name:           string;
  description:    string;
  category:       ComponentCategory;
  Type:           ComponentType;
  price:          number;
  isAvailable:    boolean;
  imageUrl:       string;
  dimensions:     DimensionsDto;
  compatibleWith: string[];
  version:        number;
  createdAt:      string; // ISO 8601
  updatedAt:      string; // ISO 8601
}

// Risposta paginata di ListComponents.
export interface PaginatedComponentsDto {
  items:      ComponentDto[];
  total:      number;
  page:       number;
  limit:      number;
  totalPages: number;
}

// ─── Input DTO ───────────────────────────────────────────────────────────────

export interface ListComponentsInput {
  category?:  ComponentCategory;
  minPrice?:  number;
  maxPrice?:  number;
  available?: boolean;
  search?:    string;
  page?:      number;
  limit?:     number;
}

export interface GetComponentInput {
  id: string;
}

export interface CreateComponentInput {
  sku:            string;
  name:           string;
  description:    string;
  category:       ComponentCategory;
  Type:           ComponentType;
  price:          number;
  isAvailable:    boolean;
  imageUrl:       string;
  dimensions:     DimensionsDto;
  compatibleWith: string[];
  requestingUserId: string; // X-User-Id iniettato dal gateway
}

export interface UpdateComponentInput {
  id:              string;
  expectedVersion: number;         // [DS] optimistic concurrency: versione attesa dal client
  name?:           string;
  description?:    string;
  price?:          number;
  isAvailable?:    boolean;
  imageUrl?:       string;
  dimensions?:     DimensionsDto;
  compatibleWith?: string[];
  requestingUserId: string;        // [DS] tracciato nell'evento pubblicato
}

export interface DeleteComponentInput {
  id: string;
}
