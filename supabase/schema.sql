-- StudyForge AI Supabase schema
-- Run this in the Supabase SQL editor when you connect a real project.

create extension if not exists pgcrypto;

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text unique,
  name text not null default 'Student',
  college text,
  branch text,
  semester int,
  subjects text[] default '{}',
  exam_goal text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.uploaded_files (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  file_name text not null,
  subject text,
  module text,
  storage_path text,
  page_count int default 0,
  file_size bigint default 0,
  extraction_status text not null default 'pending',
  error_message text,
  created_at timestamptz not null default now()
);

create table if not exists public.pdf_pages (
  id uuid primary key default gen_random_uuid(),
  file_id uuid not null references public.uploaded_files(id) on delete cascade,
  page_number int not null,
  text_content text not null,
  created_at timestamptz not null default now(),
  unique(file_id, page_number)
);

create table if not exists public.pdf_chunks (
  id uuid primary key default gen_random_uuid(),
  file_id uuid not null references public.uploaded_files(id) on delete cascade,
  page_number int not null,
  module text,
  chunk_index int not null,
  text_content text not null,
  token_estimate int default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.generated_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  file_id uuid references public.uploaded_files(id) on delete set null,
  subject text,
  module text,
  summary text,
  key_formulas text[] default '{}',
  important_questions jsonb default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.important_questions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  file_id uuid references public.uploaded_files(id) on delete set null,
  subject text,
  module text,
  question text not null,
  marks int,
  priority text check (priority in ('high','medium','low')) default 'medium',
  bookmarked boolean default false,
  created_at timestamptz not null default now()
);

create table if not exists public.quiz_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  subject text,
  module text,
  score int not null,
  total int not null,
  percentage int not null,
  answers jsonb default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.revision_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  subject text not null,
  exam_date date not null,
  hours_per_day numeric not null,
  difficulty text check (difficulty in ('easy','medium','hard')) default 'medium',
  plan jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_pdf_pages_file_id on public.pdf_pages(file_id);
create index if not exists idx_pdf_chunks_file_id on public.pdf_chunks(file_id);
create index if not exists idx_pdf_chunks_text on public.pdf_chunks using gin(to_tsvector('english', text_content));
create index if not exists idx_questions_priority on public.important_questions(priority);
