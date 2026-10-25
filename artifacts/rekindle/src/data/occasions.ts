export type OccasionType = 'anniversary' | 'birthday' | 'valentines' | 'propose' | 'other';

export interface OccasionReminder {
  id: string;
  type: OccasionType;
  label: string;
  partnerName: string;
  date: string;
  createdAt: number;
}

export const OCCASION_TYPE_LABELS: Record<OccasionType, string> = {
  anniversary: 'Anniversary',
  birthday: 'Birthday',
  valentines: "Valentine's Day",
  propose: 'Proposal',
  other: 'Special Day',
};

export const OCCASION_EMOJIS: Record<OccasionType, string> = {
  anniversary: '🕯️',
  birthday: '🎂',
  valentines: '💕',
  propose: '💍',
  other: '🌹',
};

export function getDaysUntil(dateStr: string): number {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const [month, day] = dateStr.split('-').map(Number);
  let target = new Date(now.getFullYear(), month - 1, day);
  if (target < today) target = new Date(now.getFullYear() + 1, month - 1, day);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function getSmartOccasions(): { label: string; emoji: string; daysUntil: number; occasionType: string }[] {
  const now = new Date();
  const year = now.getFullYear();

  const fixed = [
    { label: "Valentine's Day", emoji: '💕', date: new Date(year, 1, 14), occasionType: 'date_night' },
    { label: 'Propose Day', emoji: '💍', date: new Date(year, 1, 8), occasionType: 'proposal' },
    { label: 'Rose Day', emoji: '🌹', date: new Date(year, 1, 7), occasionType: 'date_night' },
    { label: 'New Year Date Night', emoji: '🥂', date: new Date(year, 11, 31), occasionType: 'date_night' },
    { label: 'Christmas Eve', emoji: '🎄', date: new Date(year, 11, 24), occasionType: 'date_night' },
  ];

  const today = new Date(year, now.getMonth(), now.getDate());
  return fixed
    .map(o => {
      let d = new Date(o.date);
      if (d < today) d = new Date(year + 1, d.getMonth(), d.getDate());
      const days = Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return { label: o.label, emoji: o.emoji, daysUntil: days, occasionType: o.occasionType };
    })
    .filter(o => o.daysUntil <= 60)
    .sort((a, b) => a.daysUntil - b.daysUntil)
    .slice(0, 4);
}
