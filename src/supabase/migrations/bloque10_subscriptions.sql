-- Tabla de suscripciones
create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  plan text not null, -- 'pro_user' | 'enterprise'
  status text not null, -- 'active' | 'inactive'
  created_at timestamp with time zone default now()
);

create index if not exists idx_subscriptions_user on subscriptions(user_id);

-- Nota: En un flujo real con Stripe, aquí guardaríamos stripe_customer_id, stripe_subscription_id, etc.
