-- Core schema for CountIQ

CREATE TABLE profile (
  id          smallint PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  full_name   text NOT NULL,
  role        text NOT NULL,
  email       text NOT NULL,
  company     text NOT NULL,
  currency    char(3) NOT NULL DEFAULT 'USD',
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE customers (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  email       text NOT NULL,
  company     text,
  phone       text,
  status      text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX customers_email_key ON customers (lower(email));

CREATE TABLE cards (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  holder       text NOT NULL,
  nickname     text NOT NULL,
  last4        char(4) NOT NULL CHECK (last4 ~ '^[0-9]{4}$'),
  exp_month    smallint NOT NULL CHECK (exp_month BETWEEN 1 AND 12),
  exp_year     smallint NOT NULL,
  balance      numeric(14, 2) NOT NULL DEFAULT 0 CHECK (balance >= 0),
  daily_limit  numeric(14, 2) NOT NULL DEFAULT 20000 CHECK (daily_limit > 0),
  status       text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'frozen')),
  is_primary   boolean NOT NULL DEFAULT false,
  created_at   timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX cards_single_primary ON cards (is_primary) WHERE is_primary;

CREATE TABLE invoices (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  number       text NOT NULL UNIQUE,
  customer_id  uuid NOT NULL REFERENCES customers (id) ON DELETE RESTRICT,
  issue_date   date NOT NULL,
  due_date     date NOT NULL CHECK (due_date >= issue_date),
  status       text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'void')),
  notes        text,
  paid_at      timestamptz,
  created_at   timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX invoices_customer_idx ON invoices (customer_id);

CREATE TABLE invoice_lines (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id  uuid NOT NULL REFERENCES invoices (id) ON DELETE CASCADE,
  description text NOT NULL,
  quantity    numeric(12, 2) NOT NULL CHECK (quantity > 0),
  unit_price  numeric(14, 2) NOT NULL CHECK (unit_price >= 0)
);
CREATE INDEX invoice_lines_invoice_idx ON invoice_lines (invoice_id);

CREATE TABLE transactions (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title        text NOT NULL,
  category     text NOT NULL,
  type         text NOT NULL CHECK (type IN ('income', 'expense', 'transfer')),
  amount       numeric(14, 2) NOT NULL CHECK (amount > 0),
  status       text NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'pending', 'failed')),
  note         text,
  occurred_at  timestamptz NOT NULL DEFAULT now(),
  customer_id  uuid REFERENCES customers (id) ON DELETE SET NULL,
  card_id      uuid REFERENCES cards (id) ON DELETE SET NULL,
  invoice_id   uuid REFERENCES invoices (id) ON DELETE SET NULL,
  created_at   timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX transactions_occurred_idx ON transactions (occurred_at DESC);
CREATE INDEX transactions_card_idx ON transactions (card_id, occurred_at);
CREATE INDEX transactions_customer_idx ON transactions (customer_id);

CREATE TABLE payments (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payee          text NOT NULL,
  amount         numeric(14, 2) NOT NULL CHECK (amount > 0),
  method         text NOT NULL CHECK (method IN ('ACH', 'Wire', 'Card', 'Check')),
  category       text NOT NULL,
  status         text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'failed', 'cancelled')),
  scheduled_for  date NOT NULL,
  reference      text,
  card_id        uuid REFERENCES cards (id) ON DELETE SET NULL,
  transaction_id uuid REFERENCES transactions (id) ON DELETE SET NULL,
  created_at     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX payments_scheduled_idx ON payments (scheduled_for);

CREATE TABLE messages (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender      text NOT NULL,
  subject     text NOT NULL,
  body        text NOT NULL,
  is_read     boolean NOT NULL DEFAULT false,
  is_starred  boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE activity (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor       text NOT NULL,
  action      text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX activity_created_idx ON activity (created_at DESC);

CREATE TABLE support_tickets (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject     text NOT NULL,
  body        text NOT NULL,
  status      text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  created_at  timestamptz NOT NULL DEFAULT now()
);
