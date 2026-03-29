export const dailyNotesSchema = {
  name: "daily_notes_preferences",
  prismaModel: `model DailyNotesPreference {
  id          String   @id @default(uuid())
  userId      String
  timezone    String   @default("UTC")
  dateFormat  String   @default("yyyy-MM-dd")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}`,
  sql: `
create table if not exists public.daily_notes_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  timezone text not null default 'UTC',
  date_format text not null default 'YYYY-MM-DD',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);
`
};

