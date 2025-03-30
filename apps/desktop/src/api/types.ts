export interface Addon {
  id: string;
  name: string;
  creator: string;
  version: string;
  content_type: string;
  enables: boolean;
  size: number;
}

export interface Manifest {
  title: string;
  content_type: string;
  creator: string;
  manufacturer: string;
  package_version: string;
  minimum_game_version: string;
  dependencies: Dependency[];
}

export interface Dependency {
  name: string;
  package_version: string;
}
