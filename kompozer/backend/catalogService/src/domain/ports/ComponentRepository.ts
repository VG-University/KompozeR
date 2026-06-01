// ComponentRepository — Porta di dominio (interfaccia) per la persistenza dei componenti.
// Definisce il contratto che deve rispettare qualsiasi implementazione di storage.
// L'implementazione reale è MongoCatalogRepository; nei test viene usata FakeComponentRepository.
//
// Nota su findAll: ritorna sia i dati paginati sia il totale grezzo (per costruire
// le informazioni di paginazione nel DTO di risposta senza una seconda query).
//
// Nota su update [DS]: l'implementazione deve rispettare optimistic concurrency:
// aggiornare solo se doc.version === component.version - 1, altrimenti lanciare VersionConflictError.
import { Component }       from '../entities/Component';
import { ComponentFilter } from './ComponentFilter';

export interface FindAllResult {
  items: Component[];
  total: number;
}

export interface ComponentRepository {
  save(component: Component): Promise<void>;
  findById(id: string): Promise<Component | null>;
  findBySku(sku: string): Promise<Component | null>;
  findAll(filter: ComponentFilter): Promise<FindAllResult>;
  update(component: Component): Promise<void>;
  delete(id: string): Promise<void>;
}
