/** Snapshot returned by CAD lookups when the chatbot needs configuration context. */
export interface CadConfigurationSnapshot {
  id: string;
  status: string;
  category: string | null;
  columnCount: number;
  maxWidthMm: number | null;
  maxHeightMm: number | null;
  componentCount: number;
}

/** Read-only contract for retrieving CAD configuration context. */
export interface CadConfigurationProvider {
  getById(userId: string, configurationId: string): Promise<CadConfigurationSnapshot | null>;
}
