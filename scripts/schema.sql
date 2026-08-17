-- Revellio portfolio — Neon schema (PRD §6). Idempotent: safe to re-run.

create extension if not exists "pgcrypto";

create table if not exists projects (
  id          uuid primary key default gen_random_uuid(),
  sort_index  int  not null,
  slug        text unique not null,
  name        text not null,
  tag         text not null check (tag in ('Web App','3D / Motion','UI Kit','Backend','Open source')),
  description text not null default '',
  stack       text not null default '',
  metric      text not null default '',
  duration    text not null default '',
  year        text not null default '',
  published   boolean not null default false,
  cover_url   text,
  live_url    text,
  repo_url    text,
  updated_at  timestamptz not null default now()
);
alter table projects add column if not exists duration text not null default '';

create table if not exists project_media (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid references projects(id) on delete cascade,
  url         text not null,
  caption     text default '',
  sort_index  int not null default 0
);

create table if not exists journey (
  id         uuid primary key default gen_random_uuid(),
  date       date not null,
  end_date   date,
  ongoing    boolean not null default false,
  title      text not null,
  org        text not null default '',
  note       text not null default '',
  published  boolean not null default false
);
-- migration for existing installs
alter table journey add column if not exists end_date date;
alter table journey add column if not exists ongoing boolean not null default false;

create table if not exists certificates (
  id         uuid primary key default gen_random_uuid(),
  sort_index int not null default 0,
  year       text not null default '',
  title      text not null,
  venue      text not null default '',
  cover_url  text,
  link_url   text,
  published  boolean not null default false
);
-- migration for existing installs
alter table certificates add column if not exists cover_url text;
alter table certificates add column if not exists link_url text;

create table if not exists cv_versions (
  id          uuid primary key default gen_random_uuid(),
  version     int not null,
  name        text not null,
  url         text,
  size_bytes  int,
  is_live     boolean not null default false,
  uploaded_at timestamptz not null default now()
);

-- single-row profile (id fixed to 1)
create table if not exists profile (
  id         int primary key default 1,
  name       text, role text, location text, bio text,
  email      text, github text, linkedin text,
  hero_url   text, photo_url text,
  available  boolean default true,
  cv_visible boolean default true
);

-- standalone media library (Media tab)
create table if not exists media (
  id         uuid primary key default gen_random_uuid(),
  url        text not null,
  caption    text default '',
  created_at timestamptz not null default now()
);

-- only one cv_versions.is_live at a time
create unique index if not exists cv_one_live on cv_versions (is_live) where is_live;
