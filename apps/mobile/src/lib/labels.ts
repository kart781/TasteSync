import type { Audience, Band, Experience, VisitMode } from '@tastesync/core';

export const FEELINGS: { value: Band; label: string }[] = [
  { value: 'loved', label: 'Loved it' },
  { value: 'fine', label: 'It was fine' },
  { value: 'not_for_me', label: 'Not for me' },
];

export const MODES: { value: VisitMode; label: string }[] = [
  { value: 'dine_in', label: 'Dine-in' },
  { value: 'takeaway', label: 'Takeaway' },
  { value: 'delivery', label: 'Delivery' },
];

// Circle sharing arrives with circles in M5.
export const AUDIENCES: { value: Audience; label: string }[] = [
  { value: 'friends', label: 'Friends' },
  { value: 'public', label: 'Public' },
  { value: 'private', label: 'Only me' },
];

export const EXPERIENCES: { value: Experience; label: string }[] = [
  { value: 'dine_in', label: 'Dine-in' },
  { value: 'delivery', label: 'Delivery' },
];

export const label = <T extends string>(list: { value: T; label: string }[], value: T) =>
  list.find((x) => x.value === value)?.label ?? value;
