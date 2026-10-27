// Seeds a fresh database with 12 months of sample data. Skips if data already exists.
// Usage: npm run db:seed
//        npm run db:seed -- --reset   (DELETES all app data first, then reseeds)
import pg from "pg";

const url = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL_UNPOOLED is not set. Run `neon env pull` first.");
  process.exit(1);
}

// Deterministic PRNG so every seed produces the same data shape.
let state = 42;
const rand = () => ((state = (state * 1664525 + 1013904223) % 2 ** 32) / 2 ** 32);
const pick = (arr) => arr[Math.floor(rand() * arr.length)];
const between = (min, max) => Math.round((min + rand() * (max - min)) * 100) / 100;

const client = new pg.Client({ connectionString: url });
await client.connect();

const reset = process.argv.includes("--reset");

try {
  if (reset) {
    await client.query(
      "TRUNCATE activity, messages, support_tickets, payments, transactions, invoice_lines, invoices, cards, customers, profile"
    );
    console.log("Cleared existing data.");
  }
  const { rows } = await client.query("SELECT count(*)::int AS n FROM transactions");
  if (rows[0].n > 0) {
    console.log("Database already has data; skipping seed.");
    process.exit(0);
  }

  await client.query("BEGIN");

  await client.query(
    `INSERT INTO profile (full_name, role, email, company, currency)
     VALUES ('Imran Hossen', 'Finance', 'imran@acme.co', 'Acme Corporation', 'USD')
     ON CONFLICT (id) DO NOTHING`
  );

  const customers = [
    ["Sarah Jenkins", "sarah@brightlabs.io", "Bright Labs", "+1 415 555 0142"],
    ["Alex Rivera", "alex@northwind.com", "Northwind Traders", "+1 212 555 0198"],
    ["David Koonson", "david@koonson.design", "Koonson Design", "+1 646 555 0117"],
    ["Marcus Vance", "marcus@vanceventures.co", "Vance Ventures", "+1 312 555 0164"],
    ["Priya Natarajan", "priya@helixhealth.com", "Helix Health", "+1 617 555 0133"],
    ["Lena Fischer", "lena@fischer-studio.de", "Fischer Studio", "+49 30 555 0101"],
    ["Omar Haddad", "omar@cedarlogistics.com", "Cedar Logistics", "+1 713 555 0189"],
    ["Grace Liu", "grace@lumenapps.io", "Lumen Apps", "+1 206 555 0156"],
  ];
  const customerIds = [];
  for (const [name, email, company, phone] of customers) {
    const r = await client.query(
      `INSERT INTO customers (name, email, company, phone, created_at)
       VALUES ($1, $2, $3, $4, now() - interval '13 months') RETURNING id`,
      [name, email, company, phone]
    );
    customerIds.push(r.rows[0].id);
  }

  const now = new Date();
  const card = await client.query(
    `INSERT INTO cards (holder, nickname, last4, exp_month, exp_year, balance, daily_limit, is_primary)
     VALUES ('Imran Hossen', 'Operations', '4821', 12, $1, 65000, 20000, true) RETURNING id`,
    [now.getFullYear() + 2]
  );
  const cardId = card.rows[0].id;
  await client.query(
    `INSERT INTO cards (holder, nickname, last4, exp_month, exp_year, balance, daily_limit, status)
     VALUES ('Imran Hossen', 'Travel', '1037', 8, $1, 8400, 5000, 'frozen')`,
    [now.getFullYear() + 1]
  );

  const incomeSources = [
    ["UI/UX Design Retainer", "Consulting"],
    ["Website Redesign Project", "Projects"],
    ["Monthly Subscription Revenue", "Subscriptions"],
    ["Brand Strategy Workshop", "Consulting"],
    ["Mobile App Milestone", "Projects"],
  ];
  const expenseSources = [
    ["AWS Cloud Hosting", "Infrastructure", "Monthly server subscription"],
    ["Electricity Bill", "Utilities", "Monthly electricity payment"],
    ["Figma Organization", "Software", "Design tool seats"],
    ["Office Rent", "Rent", "Monthly office lease"],
    ["Team Lunch", "Meals", "Friday team lunch"],
    ["Google Workspace", "Software", "Email and docs"],
    ["Contractor Payout", "Payroll", "Freelance developer"],
    ["Flight to NYC", "Travel", "Client visit"],
  ];

  // 12 months of history up to today, inserted in one round trip.
  const history = [];
  for (let m = 11; m >= 0; m--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - m, 1);
    const daysInMonth = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0).getDate();
    const lastDay = m === 0 ? now.getDate() : daysInMonth;
    const at = (day) => {
      const d = new Date(monthStart.getFullYear(), monthStart.getMonth(), day, 8 + Math.floor(rand() * 10), Math.floor(rand() * 60));
      return (d > now ? now : d).toISOString();
    };

    for (let i = 0; i < 4; i++) {
      const [title, category] = pick(incomeSources);
      history.push({ title, category, type: "income", amount: between(2500, 6000),
        status: rand() < 0.9 ? "completed" : "pending", note: "Milestone payment",
        occurred_at: at(1 + Math.floor(rand() * lastDay)), customer_id: pick(customerIds), card_id: null });
    }
    for (let i = 0; i < 6; i++) {
      const [title, category, note] = pick(expenseSources);
      history.push({ title, category, type: "expense", amount: between(400, 1800),
        status: rand() < 0.88 ? "completed" : "failed", note,
        occurred_at: at(1 + Math.floor(rand() * lastDay)), customer_id: null, card_id: cardId });
    }
  }
  await client.query(
    `INSERT INTO transactions (title, category, type, amount, status, note, occurred_at, customer_id, card_id)
     SELECT title, category, type, amount, status, note, occurred_at, customer_id, card_id
     FROM json_populate_recordset(NULL::transactions, $1)`,
    [JSON.stringify(history)]
  );

  // Today's card spend so the daily limit widget has something to show.
  for (const [title, category, amount] of [
    ["Vendor Settlement", "Suppliers", 6200],
    ["Cloud Credits Top-up", "Infrastructure", 3910],
  ]) {
    await client.query(
      `INSERT INTO transactions (title, category, type, amount, note, occurred_at, card_id)
       VALUES ($1, $2, 'expense', $3, 'Card payment', now() - interval '2 hours', $4)`,
      [title, category, amount, cardId]
    );
  }

  // Invoices
  const invoiceSpecs = [
    ["INV-2026-01", 0, "paid", -60, [["Brand identity package", 1, 3200]]],
    ["INV-2026-02", 1, "paid", -40, [["Dashboard UI design", 1, 2400], ["Design system audit", 4, 150]]],
    ["INV-2026-03", 2, "sent", -12, [["Landing page build", 1, 1800]]],
    ["INV-2026-04", 3, "sent", -3, [["Mobile prototype", 2, 950]]],
    ["INV-2026-05", 4, "draft", 0, [["Research sprint", 5, 400]]],
  ];
  for (const [number, ci, status, offsetDays, lines] of invoiceSpecs) {
    const r = await client.query(
      `INSERT INTO invoices (number, customer_id, issue_date, due_date, status, paid_at)
       VALUES ($1, $2, current_date + $3::int, current_date + $3::int + 14, $4,
               CASE WHEN $4 = 'paid' THEN now() + make_interval(days => $3::int + 10) END)
       RETURNING id`,
      [number, customerIds[ci], offsetDays, status]
    );
    for (const [description, qty, price] of lines) {
      await client.query(
        `INSERT INTO invoice_lines (invoice_id, description, quantity, unit_price) VALUES ($1, $2, $3, $4)`,
        [r.rows[0].id, description, qty, price]
      );
    }
  }

  // Payments
  for (const [payee, amount, method, category, status, offsetDays] of [
    ["Amazon Web Services", 1100.81, "Card", "Infrastructure", "completed", -5],
    ["City Power & Light", 295.81, "ACH", "Utilities", "completed", -3],
    ["WeWork", 2400, "ACH", "Rent", "scheduled", 4],
    ["Figma", 540, "Card", "Software", "scheduled", 9],
    ["Upwork Contractor", 1850, "Wire", "Payroll", "failed", -1],
  ]) {
    await client.query(
      `INSERT INTO payments (payee, amount, method, category, status, scheduled_for, reference, card_id)
       VALUES ($1, $2, $3, $4, $5, current_date + $6::int, $7, $8)`,
      [payee, amount, method, category, status, offsetDays,
       `PAY-${Math.floor(10000 + rand() * 89999)}`, method === "Card" ? cardId : null]
    );
  }

  for (const [sender, subject, body, read, hoursAgo] of [
    ["Finance Bot", "Invoice INV-2026-04 is due soon", "Marcus Vance's invoice is due in 11 days. Consider sending a reminder.", false, 1],
    ["Alex Rivera", "Paid invoice INV-2026-02", "Hi Imran, payment for the dashboard design is on its way. Thanks!", false, 5],
    ["Security", "New sign-in detected", "A new sign-in to your account was detected from Chrome on Windows.", true, 30],
    ["Sarah Jenkins", "Kickoff call next week?", "Would Tuesday at 10am work for the new project kickoff?", true, 52],
  ]) {
    await client.query(
      `INSERT INTO messages (sender, subject, body, is_read, created_at)
       VALUES ($1, $2, $3, $4, now() - make_interval(hours => $5))`,
      [sender, subject, body, read, hoursAgo]
    );
  }

  for (const [actor, action, minutesAgo] of [
    ["Sarah Jenkins", "Added a new client profile", 2],
    ["Alex Rivera", "Paid invoice #INV-2026-02", 15],
    ["David Koonson", "Joined the design team workspace", 140],
    ["Marcus Vance", "Linked a new Stripe payout account", 650],
  ]) {
    await client.query(
      `INSERT INTO activity (actor, action, created_at) VALUES ($1, $2, now() - make_interval(mins => $3))`,
      [actor, action, minutesAgo]
    );
  }

  await client.query("COMMIT");
  console.log("Seeded sample data.");
} catch (err) {
  await client.query("ROLLBACK");
  throw err;
} finally {
  await client.end();
}
