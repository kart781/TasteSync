// The location bar's state, Swiggy/Zomato style: GPS, a saved place, or a launch area,
// plus Eat out / Order in. Saved places and the current choice live only on this phone.
import type { DiscoverMode } from '@tastesync/core';
import * as Location from 'expo-location';
import * as SecureStore from 'expo-secure-store';
import { createContext, use, useCallback, useEffect, useState, type ReactNode } from 'react';

import { api, track } from './api';
import { useSession } from './session';

export type Point = { lat: number; lng: number };
export type Area = { id: string; name: string; lat: number; lng: number; meters: number | null };
export type SavedPlace = Point & { name: string; areaName: string };
export type Current = Point & { source: 'gps' | 'saved' | 'area'; name: string | null; areaName: string; outside: boolean };

type Stored = { current: Current | null; saved: SavedPlace[]; mode: DiscoverMode };
type LocationState = Stored & {
  ready: boolean;
  requestGps(): Promise<boolean>;
  chooseArea(area: Area): void;
  chooseSaved(place: SavedPlace): void;
  saveCurrent(name: string): void;
  removeSaved(name: string): void;
  setMode(mode: DiscoverMode): void;
};

const KEY = 'locationState';
const OUTSIDE_METERS = 25_000; // farther than this from every launch area = outside Hyderabad
const LocationContext = createContext<LocationState | null>(null);

async function nearestArea(p: Point): Promise<Area | undefined> {
  const { areas } = await api<{ areas: Area[] }>(`/areas?lat=${p.lat}&lng=${p.lng}`);
  return areas[0];
}

// Asks only when the person taps something that needs it (location is opt-in).
export async function currentPosition(): Promise<Point | null> {
  const { granted } = await Location.requestForegroundPermissionsAsync();
  return granted ? gpsPoint() : null;
}

async function gpsPoint(): Promise<Point | null> {
  const last = await Location.getLastKnownPositionAsync({ maxAge: 5 * 60_000 });
  const pos = last ?? (await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }));
  return { lat: pos.coords.latitude, lng: pos.coords.longitude };
}

export function LocationProvider({ children }: { children: ReactNode }) {
  const { user } = useSession();
  const [state, setState] = useState<Stored>({ current: null, saved: [], mode: 'eat_out' });
  const [ready, setReady] = useState(false);

  const update = useCallback((change: (s: Stored) => Stored) => {
    setState((s) => {
      const next = change(s);
      SecureStore.setItemAsync(KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const fromGps = useCallback(async (): Promise<Current | null> => {
    const point = await gpsPoint();
    if (!point) return null;
    const area = await nearestArea(point);
    return {
      ...point,
      source: 'gps',
      name: null,
      areaName: area?.name ?? 'Hyderabad',
      outside: (area?.meters ?? Infinity) > OUTSIDE_METERS,
    };
  }, []);

  // Start-up order (PRD): fresh GPS if already allowed, else the last choice, else the home area.
  useEffect(() => {
    if (!user) return; // the location bar exists only once signed in
    (async () => {
      const raw = await SecureStore.getItemAsync(KEY).catch(() => null);
      const stored: Stored = raw ? JSON.parse(raw) : { current: null, saved: [], mode: 'eat_out' };
      let current = stored.current;
      const { granted } = await Location.getForegroundPermissionsAsync();
      if (granted && (!current || current.source === 'gps')) current = (await fromGps().catch(() => null)) ?? current;
      if (!current && user?.homeAreaId) {
        const { areas } = await api<{ areas: Area[] }>('/areas');
        const home = areas.find((a) => a.id === user.homeAreaId);
        if (home) current = { lat: home.lat, lng: home.lng, source: 'area', name: null, areaName: home.name, outside: false };
      }
      setState({ ...stored, current });
      setReady(true);
    })().catch(() => setReady(true));
  }, [fromGps, user]);

  const requestGps = useCallback(async () => {
    const { granted } = await Location.requestForegroundPermissionsAsync();
    if (!granted) return false;
    const current = await fromGps();
    if (!current) return false;
    update((s) => ({ ...s, current }));
    track('location_set', { source: 'gps' });
    return true;
  }, [fromGps, update]);

  const value: LocationState = {
    ...state,
    ready,
    requestGps,
    chooseArea(area) {
      update((s) => ({
        ...s,
        current: { lat: area.lat, lng: area.lng, source: 'area', name: null, areaName: area.name, outside: false },
      }));
      track('location_set', { source: 'area' });
    },
    chooseSaved(place) {
      update((s) => ({ ...s, current: { ...place, source: 'saved', outside: false } }));
      track('location_set', { source: 'saved' });
    },
    saveCurrent(name) {
      update((s) => {
        if (!s.current) return s;
        const place: SavedPlace = { name, lat: s.current.lat, lng: s.current.lng, areaName: s.current.areaName };
        return {
          saved: [...s.saved.filter((p) => p.name !== name), place],
          current: { ...place, source: 'saved', outside: s.current.outside },
          mode: s.mode,
        };
      });
    },
    removeSaved(name) {
      update((s) => ({ ...s, saved: s.saved.filter((p) => p.name !== name) }));
    },
    setMode(mode) {
      update((s) => ({ ...s, mode }));
    },
  };

  return <LocationContext value={value}>{children}</LocationContext>;
}

export function useLocation(): LocationState {
  const value = use(LocationContext);
  if (!value) throw new Error('useLocation must be inside LocationProvider');
  return value;
}

export function locationLabel(c: Current | null): string {
  if (!c) return 'Set your location';
  if (c.outside) return `Outside Hyderabad · ${c.areaName}`;
  if (c.source === 'gps') return `Current location · ${c.areaName}`;
  if (c.source === 'saved') return `${c.name} · ${c.areaName}`;
  return c.areaName;
}
