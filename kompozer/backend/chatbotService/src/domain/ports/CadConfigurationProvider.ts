export interface CadConfigurationSnapshot {
  id: string;
  status: string;
  category: string | null;
  columnCount: number;
  maxWidthMm: number | null;
  maxHeightMm: number | null;
  componentCount: number;
}

export interface CadConfigurationProvider {
  getById(userId: string, configurationId: string): Promise<CadConfigurationSnapshot | null>;
}
