export const markdownPreviewerSchema = {
  name: "markdown_previewer_snapshots",
  prismaModel: `model MarkdownPreviewSnapshot {
  id          String   @id @default(uuid())
  documentId  String
  userId      String
  html        String
  createdAt   DateTime @default(now())
}`,
  sql: `
create table if not exists public.markdown_previewer_snapshots (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  html text not null,
  created_at timestamptz not null default now()
);
`
};

