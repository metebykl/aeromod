export interface SceneryCache {
  airports: SceneryAirport[];
}

export interface SceneryAirport {
  addon_id: string;
  bgl_path: string;
  icao: string;
  latitude: number;
  longitude: number;
  altitude: number;
  runway_count: number;
}
