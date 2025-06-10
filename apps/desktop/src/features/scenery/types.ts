export interface SceneryCache {
  airports: Airport[];
}

export interface Airport {
  icao: string;
  latitude: number;
  longitude: number;
  altitude: number;
  runway_count: number;
}
