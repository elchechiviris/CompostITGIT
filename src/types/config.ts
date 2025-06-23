export interface SidebarConfig {
  isExpanded: boolean;
  activeSection: string;
}

export interface ResidueConfig {
  cnRatioThresholds: {
    highNitrogen: number;
    green: number;
  };
}

export interface AppConfig {
  sidebar: SidebarConfig;
  residues: ResidueConfig;
}