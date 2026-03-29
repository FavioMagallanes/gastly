-- ============================================================================
-- Expense Tracker — Supabase Schema
-- Ejecutar en: Supabase Dashboard → SQL Editor → New Query → Run
-- ============================================================================

-- 1. Tabla de reportes mensuales
-- Cada reporte es un snapshot congelado del mes cerrado.
create table if not exists public.monthly_reports (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  label           text not null,                    -- ej: "Marzo 2026"
  closed_at       timestamptz not null default now(),
  budget          numeric not null default 0,       -- presupuesto del mes
  total_spent     numeric not null default 0,       -- total gastado
  remaining_balance numeric not null default 0,     -- saldo restante
  is_over_budget  boolean not null default false,   -- ¿se excedió?
  expenses        jsonb not null default '[]'::jsonb -- snapshot de gastos
);

-- 2. Índice para consultas por usuario
create index if not exists idx_monthly_reports_user_id
  on public.monthly_reports(user_id);

-- 3. Habilitar Row Level Security
alter table public.monthly_reports enable row level security;

-- 4. Políticas RLS — cada usuario solo accede a sus propios datos

-- SELECT: solo sus reportes
create policy "Users can view own reports"
  on public.monthly_reports
  for select
  to authenticated
  using (auth.uid() = user_id);

-- INSERT: solo puede insertar con su propio user_id
create policy "Users can insert own reports"
  on public.monthly_reports
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- DELETE: solo puede eliminar sus propios reportes
create policy "Users can delete own reports"
  on public.monthly_reports
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- UPDATE: solo puede actualizar sus propios reportes (por si se necesita en el futuro)
create policy "Users can update own reports"
  on public.monthly_reports
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================================
-- 5. Plan mensual (proyección / a pagar) — una fila por usuario, sincronizada desde la app
-- ============================================================================

create table if not exists public.user_monthly_plan (
  user_id            uuid primary key references auth.users(id) on delete cascade,
  planned_expenses   jsonb not null default '[]'::jsonb,
  planned_budget     jsonb,
  updated_at         timestamptz not null default now()
);

alter table public.user_monthly_plan enable row level security;

create policy "Users can view own monthly plan"
  on public.user_monthly_plan
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own monthly plan"
  on public.user_monthly_plan
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own monthly plan"
  on public.user_monthly_plan
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own monthly plan"
  on public.user_monthly_plan
  for delete
  to authenticated
  using (auth.uid() = user_id);
