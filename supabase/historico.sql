-- ================================================================
-- FinanzApp — Historial completo (generado de mami_bills.xlsx)
-- user_id: 402ad72e-fbb4-4316-aa69-669dd4296bda
-- Correr PRIMERO la migration 004.
-- ================================================================

-- ================================================================
-- 1. CUENTAS HISTORICAS (is_visible=false)
--    Solo las que NO existen aun: Binance, MEP, Fisico, Cajon
--    ya estan en la app con otros nombres.
-- ================================================================

INSERT INTO accounts (user_id, name, type, currency, balance, is_visible, is_favorite)
SELECT '402ad72e-fbb4-4316-aa69-669dd4296bda', 'Fiverr', 'other', 'USD', 0, false, false
WHERE NOT EXISTS (
  SELECT 1 FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND lower(name) = lower('Fiverr')
);
INSERT INTO accounts (user_id, name, type, currency, balance, is_visible, is_favorite)
SELECT '402ad72e-fbb4-4316-aa69-669dd4296bda', 'Freelancer', 'other', 'USD', 0, false, false
WHERE NOT EXISTS (
  SELECT 1 FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND lower(name) = lower('Freelancer')
);
INSERT INTO accounts (user_id, name, type, currency, balance, is_visible, is_favorite)
SELECT '402ad72e-fbb4-4316-aa69-669dd4296bda', 'Paypal', 'other', 'USD', 0, false, false
WHERE NOT EXISTS (
  SELECT 1 FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND lower(name) = lower('Paypal')
);
INSERT INTO accounts (user_id, name, type, currency, balance, is_visible, is_favorite)
SELECT '402ad72e-fbb4-4316-aa69-669dd4296bda', 'Payoneer', 'other', 'USD', 0, false, false
WHERE NOT EXISTS (
  SELECT 1 FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND lower(name) = lower('Payoneer')
);
INSERT INTO accounts (user_id, name, type, currency, balance, is_visible, is_favorite)
SELECT '402ad72e-fbb4-4316-aa69-669dd4296bda', 'Santander', 'savings', 'EUR', 0, false, false
WHERE NOT EXISTS (
  SELECT 1 FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND lower(name) = lower('Santander')
);
INSERT INTO accounts (user_id, name, type, currency, balance, is_visible, is_favorite)
SELECT '402ad72e-fbb4-4316-aa69-669dd4296bda', 'Western Union', 'other', 'ARS', 0, false, false
WHERE NOT EXISTS (
  SELECT 1 FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND lower(name) = lower('Western Union')
);
INSERT INTO accounts (user_id, name, type, currency, balance, is_visible, is_favorite)
SELECT '402ad72e-fbb4-4316-aa69-669dd4296bda', 'Lucas Genzelis', 'other', 'USD', 0, false, false
WHERE NOT EXISTS (
  SELECT 1 FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND lower(name) = lower('Lucas Genzelis')
);
INSERT INTO accounts (user_id, name, type, currency, balance, is_visible, is_favorite)
SELECT '402ad72e-fbb4-4316-aa69-669dd4296bda', 'saldo.com.ar', 'other', 'ARS', 0, false, false
WHERE NOT EXISTS (
  SELECT 1 FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND lower(name) = lower('saldo.com.ar')
);
INSERT INTO accounts (user_id, name, type, currency, balance, is_visible, is_favorite)
SELECT '402ad72e-fbb4-4316-aa69-669dd4296bda', 'Jarras', 'other', 'ARS', 0, false, false
WHERE NOT EXISTS (
  SELECT 1 FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND lower(name) = lower('Jarras')
);
INSERT INTO accounts (user_id, name, type, currency, balance, is_visible, is_favorite)
SELECT '402ad72e-fbb4-4316-aa69-669dd4296bda', 'Previaje', 'other', 'ARS', 522, false, false
WHERE NOT EXISTS (
  SELECT 1 FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND lower(name) = lower('Previaje')
);

-- ================================================================
-- 2. CATEGORIAS — todas ya existen en la DB, no se crean
--    Trabajo > Changas  (income)
--    Otros              (income)
--    Vida general       (expense)
-- ================================================================

-- ================================================================
-- 3. GANANCIAS  →  income / Changas
--    date=fecha_inicio  due_date=fecha_fin  amount=neto  amount_gross=bruto
-- ================================================================

INSERT INTO transactions
  (user_id, date, due_date, type, status, amount, amount_gross, currency,
   description, account_id, account_name, client_name, project_name, category_name, notes)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2021-02-07', '2021-02-09', 'income', 'confirmed',
  155.54, 182.0, 'USD',
  'gestión de pedidos', NULL, 'Freelancer', 'Ion A.', 'Django', 'Changas', NULL
);
INSERT INTO transactions
  (user_id, date, due_date, type, status, amount, amount_gross, currency,
   description, account_id, account_name, client_name, project_name, category_name, notes)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2021-03-02', '2021-03-09', 'income', 'confirmed',
  72.0, 90.0, 'USD',
  'www.zethai.com', NULL, 'Fiverr', 'alanpalacio924', 'Django', 'Changas', NULL
);
INSERT INTO transactions
  (user_id, date, due_date, type, status, amount, amount_gross, currency,
   description, account_id, account_name, client_name, project_name, category_name, notes)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2021-03-11', '2021-03-19', 'income', 'confirmed',
  160.0, 200.0, 'USD',
  'Manual cb upload', NULL, 'Fiverr', 'alanpalacio924', 'Flask', 'Changas', NULL
);
INSERT INTO transactions
  (user_id, date, due_date, type, status, amount, amount_gross, currency,
   description, account_id, account_name, client_name, project_name, category_name, notes)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2021-03-25', '2021-04-02', 'income', 'confirmed',
  165.60000000000002, 207.0, 'USD',
  'https://www.cyberwarriornetwork.com/', NULL, 'Fiverr', 'cyberspectre', 'Django', 'Changas', NULL
);
INSERT INTO transactions
  (user_id, date, due_date, type, status, amount, amount_gross, currency,
   description, account_id, account_name, client_name, project_name, category_name, notes)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2021-04-07', '2021-04-12', 'income', 'confirmed',
  120.0, 150.0, 'USD',
  'Loop resource website', NULL, 'Fiverr', 'nordmichael', 'Django', 'Changas', NULL
);
INSERT INTO transactions
  (user_id, date, due_date, type, status, amount, amount_gross, currency,
   description, account_id, account_name, client_name, project_name, category_name, notes)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2021-04-21', '2021-04-22', 'income', 'confirmed',
  48.0, 60.0, 'USD',
  'Proyecto famatel', NULL, 'Fiverr', 'xavierclaveria', 'Php', 'Changas', NULL
);
INSERT INTO transactions
  (user_id, date, due_date, type, status, amount, amount_gross, currency,
   description, account_id, account_name, client_name, project_name, category_name, notes)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2021-04-22', '2021-04-25', 'income', 'confirmed',
  80.0, 100.0, 'USD',
  'Proyecto famatel', NULL, 'Fiverr', 'xavierclaveria', 'Php', 'Changas', NULL
);
INSERT INTO transactions
  (user_id, date, due_date, type, status, amount, amount_gross, currency,
   description, account_id, account_name, client_name, project_name, category_name, notes)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2021-04-26', '2021-05-03', 'income', 'confirmed',
  200.0, 250.0, 'USD',
  'Proyecto famatel', NULL, 'Fiverr', 'xavierclaveria', 'Php', 'Changas', NULL
);
INSERT INTO transactions
  (user_id, date, due_date, type, status, amount, amount_gross, currency,
   description, account_id, account_name, client_name, project_name, category_name, notes)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2021-05-29', '2021-06-03', 'income', 'confirmed',
  36.0, 45.0, 'USD',
  'Loop resource website', NULL, 'Fiverr', 'nordmichael', 'Django', 'Changas', NULL
);
INSERT INTO transactions
  (user_id, date, due_date, type, status, amount, amount_gross, currency,
   description, account_id, account_name, client_name, project_name, category_name, notes)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2021-05-29', '2021-05-30', 'income', 'confirmed',
  16.0, 20.0, 'USD',
  'api small proyect', NULL, 'Fiverr', 'coding234', 'Django', 'Changas', NULL
);
INSERT INTO transactions
  (user_id, date, due_date, type, status, amount, amount_gross, currency,
   description, account_id, account_name, client_name, project_name, category_name, notes)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2021-07-07', '2021-07-21', 'income', 'confirmed',
  120.0, 150.0, 'USD',
  'script to web app', NULL, 'Fiverr', 'marktongarcia', 'Flask', 'Changas', NULL
);
INSERT INTO transactions
  (user_id, date, due_date, type, status, amount, amount_gross, currency,
   description, account_id, account_name, client_name, project_name, category_name, notes)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2021-07-08', '2021-07-21', 'income', 'confirmed',
  40.0, 50.0, 'USD',
  'script to web app', NULL, 'Fiverr', 'marktongarcia', 'Flask', 'Changas', NULL
);
INSERT INTO transactions
  (user_id, date, due_date, type, status, amount, amount_gross, currency,
   description, account_id, account_name, client_name, project_name, category_name, notes)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2021-07-25', '2021-08-22', 'income', 'confirmed',
  200.0, 250.0, 'USD',
  'school management system', NULL, 'Fiverr', 'mcdollyn7', 'Django', 'Changas', NULL
);
INSERT INTO transactions
  (user_id, date, due_date, type, status, amount, amount_gross, currency,
   description, account_id, account_name, client_name, project_name, category_name, notes)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2021-07-28', '2021-07-28', 'income', 'confirmed',
  16.0, 20.0, 'USD',
  'Loop resource feature', NULL, 'Fiverr', 'nordmichael', 'Django', 'Changas', NULL
);
INSERT INTO transactions
  (user_id, date, due_date, type, status, amount, amount_gross, currency,
   description, account_id, account_name, client_name, project_name, category_name, notes)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2021-08-24', '2021-09-03', 'income', 'confirmed',
  56.0, 70.0, 'USD',
  'IBOSUK', NULL, 'Fiverr', 'paulkalland', 'PHP', 'Changas', NULL
);
INSERT INTO transactions
  (user_id, date, due_date, type, status, amount, amount_gross, currency,
   description, account_id, account_name, client_name, project_name, category_name, notes)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2021-09-05', '2021-09-05', 'income', 'confirmed',
  4.0, 5.0, 'USD',
  'https://ib-grade-calculator.herokuapp.com/', NULL, 'Fiverr', 'sernaa', 'Flask', 'Changas', NULL
);
INSERT INTO transactions
  (user_id, date, due_date, type, status, amount, amount_gross, currency,
   description, account_id, account_name, client_name, project_name, category_name, notes)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2021-09-10', '2021-09-20', 'income', 'confirmed',
  64.0, 80.0, 'USD',
  'IBOSUK', NULL, 'Fiverr', 'paulkalland', 'PHP', 'Changas', NULL
);
INSERT INTO transactions
  (user_id, date, due_date, type, status, amount, amount_gross, currency,
   description, account_id, account_name, client_name, project_name, category_name, notes)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2021-09-11', '2021-10-16', 'income', 'confirmed',
  200.0, 250.0, 'USD',
  'montessori.tech', NULL, 'Fiverr', 'javierlr', 'JS', 'Changas', NULL
);
INSERT INTO transactions
  (user_id, date, due_date, type, status, amount, amount_gross, currency,
   description, account_id, account_name, client_name, project_name, category_name, notes)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2021-09-18', '2021-10-02', 'income', 'confirmed',
  4.0, 5.0, 'USD',
  'https://getme.ananchor.com/login.php', NULL, 'Fiverr', 'TONY', 'php', 'Changas', NULL
);
INSERT INTO transactions
  (user_id, date, due_date, type, status, amount, amount_gross, currency,
   description, account_id, account_name, client_name, project_name, category_name, notes)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2021-09-18', '2021-10-02', 'income', 'confirmed',
  22014.21, 110.0, 'ARS',
  'https://getme.ananchor.com/login.php', NULL, 'Western Union', 'TONY', 'php', 'Changas', NULL
);
INSERT INTO transactions
  (user_id, date, due_date, type, status, amount, amount_gross, currency,
   description, account_id, account_name, client_name, project_name, category_name, notes)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2021-10-04', '2021-10-06', 'income', 'confirmed',
  157.48, 150.0, 'USD',
  'ENERBE-AGENCI-APP', NULL, 'Paypal', 'Matias Rafael Lisio', 'laravel', 'Changas', NULL
);
INSERT INTO transactions
  (user_id, date, due_date, type, status, amount, amount_gross, currency,
   description, account_id, account_name, client_name, project_name, category_name, notes)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2021-10-04', '2021-10-09', 'income', 'confirmed',
  21986.87, 110.0, 'ARS',
  'https://getme.ananchor.com/login.php', NULL, 'Western Union', 'TONY', 'php', 'Changas', NULL
);
INSERT INTO transactions
  (user_id, date, due_date, type, status, amount, amount_gross, currency,
   description, account_id, account_name, client_name, project_name, category_name, notes)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2021-10-08', '2021-10-16', 'income', 'confirmed',
  28.0, 35.0, 'USD',
  'montessori.tech', NULL, 'Fiverr', 'javierlr', 'JS', 'Changas', NULL
);
INSERT INTO transactions
  (user_id, date, due_date, type, status, amount, amount_gross, currency,
   description, account_id, account_name, client_name, project_name, category_name, notes)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2021-12-22', '2021-12-30', 'income', 'confirmed',
  120.0, 150.0, 'USD',
  'montessori.tech', NULL, 'Fiverr', 'javierlr', 'JS', 'Changas', NULL
);
INSERT INTO transactions
  (user_id, date, due_date, type, status, amount, amount_gross, currency,
   description, account_id, account_name, client_name, project_name, category_name, notes)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2022-01-31', '2022-02-04', 'income', 'confirmed',
  4.0, 5.0, 'USD',
  'pim', NULL, 'Fiverr', 'pafcosta', 'laravel', 'Changas', NULL
);
INSERT INTO transactions
  (user_id, date, due_date, type, status, amount, amount_gross, currency,
   description, account_id, account_name, client_name, project_name, category_name, notes)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2022-01-31', '2022-02-04', 'income', 'confirmed',
  53275.41, 245.0, 'ARS',
  'pim', NULL, 'Western Union', 'pafcosta', 'laravel', 'Changas', NULL
);
INSERT INTO transactions
  (user_id, date, due_date, type, status, amount, amount_gross, currency,
   description, account_id, account_name, client_name, project_name, category_name, notes)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2022-02-07', '2022-02-11', 'income', 'confirmed',
  52784.79, 250.0, 'ARS',
  'pim', NULL, 'Western Union', 'pafcosta', 'laravel', 'Changas', NULL
);
INSERT INTO transactions
  (user_id, date, due_date, type, status, amount, amount_gross, currency,
   description, account_id, account_name, client_name, project_name, category_name, notes)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2022-02-14', '2022-02-18', 'income', 'confirmed',
  51280.73, 250.0, 'ARS',
  'pim', NULL, 'Western Union', 'pafcosta', 'laravel', 'Changas', NULL
);
INSERT INTO transactions
  (user_id, date, due_date, type, status, amount, amount_gross, currency,
   description, account_id, account_name, client_name, project_name, category_name, notes)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2022-02-07', '2022-02-25', 'income', 'confirmed',
  124425.0, 600.0, 'ARS',
  'https://heyzro.com/', NULL, 'Western Union', 'Tlee Cooper', 'MEAN', 'Changas', NULL
);
INSERT INTO transactions
  (user_id, date, due_date, type, status, amount, amount_gross, currency,
   description, account_id, account_name, client_name, project_name, category_name, notes)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2022-02-07', '2022-02-25', 'income', 'confirmed',
  16.0, 20.0, 'USD',
  'https://heyzro.com/', NULL, 'Fiverr', 'Tlee Cooper', 'MEAN', 'Changas', NULL
);
INSERT INTO transactions
  (user_id, date, due_date, type, status, amount, amount_gross, currency,
   description, account_id, account_name, client_name, project_name, category_name, notes)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2022-02-21', '2022-02-25', 'income', 'confirmed',
  50521.69, 250.0, 'ARS',
  'pim', NULL, 'Western Union', 'pafcosta', 'laravel', 'Changas', NULL
);
INSERT INTO transactions
  (user_id, date, due_date, type, status, amount, amount_gross, currency,
   description, account_id, account_name, client_name, project_name, category_name, notes)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2022-02-01', '2022-02-25', 'income', 'confirmed',
  350.0, 362.0, 'USD',
  'https://gochanakya.com/', NULL, 'Payoneer', 'Vatsal', 'CakePHP to MERN', 'Changas', NULL
);
INSERT INTO transactions
  (user_id, date, due_date, type, status, amount, amount_gross, currency,
   description, account_id, account_name, client_name, project_name, category_name, notes)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2022-02-28', '2022-03-04', 'income', 'confirmed',
  49297.39, 250.0, 'ARS',
  'pim', NULL, 'Western Union', 'pafcosta', 'laravel', 'Changas', NULL
);
INSERT INTO transactions
  (user_id, date, due_date, type, status, amount, amount_gross, currency,
   description, account_id, account_name, client_name, project_name, category_name, notes)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2022-03-07', '2022-03-11', 'income', 'confirmed',
  48360.79, 250.0, 'ARS',
  'pim', NULL, 'Western Union', 'pafcosta', 'laravel', 'Changas', NULL
);
INSERT INTO transactions
  (user_id, date, due_date, type, status, amount, amount_gross, currency,
   description, account_id, account_name, client_name, project_name, category_name, notes)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2022-02-28', '2022-03-12', 'income', 'confirmed',
  175.0, NULL, 'USD',
  'https://gochanakya.com/', NULL, 'Payoneer', 'Vatsal', 'CakePHP to MERN', 'Changas', NULL
);
INSERT INTO transactions
  (user_id, date, due_date, type, status, amount, amount_gross, currency,
   description, account_id, account_name, client_name, project_name, category_name, notes)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2022-03-14', '2022-03-21', 'income', 'confirmed',
  59579.65, 300.0, 'ARS',
  'pim', NULL, 'Western Union', 'pafcosta', 'laravel', 'Changas', NULL
);
INSERT INTO transactions
  (user_id, date, due_date, type, status, amount, amount_gross, currency,
   description, account_id, account_name, client_name, project_name, category_name, notes)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2022-03-12', '2022-04-08', 'income', 'confirmed',
  174.85, 180.25, 'USD',
  'https://gochanakya.com/', NULL, 'Payoneer', 'Vatsal', 'CakePHP to MERN', 'Changas', NULL
);
INSERT INTO transactions
  (user_id, date, due_date, type, status, amount, amount_gross, currency,
   description, account_id, account_name, client_name, project_name, category_name, notes)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2022-04-11', '2022-04-11', 'income', 'confirmed',
  4.0, 5.0, 'USD',
  'https://gochanakya.com/', NULL, 'Fiverr', 'Vatsal', 'CakePHP', 'Changas', NULL
);
INSERT INTO transactions
  (user_id, date, due_date, type, status, amount, amount_gross, currency,
   description, account_id, account_name, client_name, project_name, category_name, notes)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2022-04-06', '2022-04-15', 'income', 'confirmed',
  75980.84, 400.0, 'ARS',
  'pim', NULL, 'Western Union', 'pafcosta', 'laravel', 'Changas', NULL
);
INSERT INTO transactions
  (user_id, date, due_date, type, status, amount, amount_gross, currency,
   description, account_id, account_name, client_name, project_name, category_name, notes)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2022-06-18', '2022-06-18', 'income', 'confirmed',
  4.0, 5.0, 'USD',
  NULL, NULL, 'Fiverr', 'matiascardozo', NULL, 'Changas', NULL
);
INSERT INTO transactions
  (user_id, date, due_date, type, status, amount, amount_gross, currency,
   description, account_id, account_name, client_name, project_name, category_name, notes)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2022-07-27', '2022-08-05', 'income', 'confirmed',
  100941.21, 360.0, 'ARS',
  'balcao', NULL, 'Western Union', 'pafcosta', 'yii2', 'Changas', NULL
);
INSERT INTO transactions
  (user_id, date, due_date, type, status, amount, amount_gross, currency,
   description, account_id, account_name, client_name, project_name, category_name, notes)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2022-08-08', '2022-08-12', 'income', 'confirmed',
  62862.27, 225.0, 'ARS',
  'balcao', NULL, 'Western Union', 'pafcosta', 'yii2', 'Changas', NULL
);
INSERT INTO transactions
  (user_id, date, due_date, type, status, amount, amount_gross, currency,
   description, account_id, account_name, client_name, project_name, category_name, notes)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2022-08-17', '2022-08-18', 'income', 'confirmed',
  80.0, 100.0, 'USD',
  'Loop resource website', NULL, 'Fiverr', 'nordmichael', 'Django', 'Changas', NULL
);
INSERT INTO transactions
  (user_id, date, due_date, type, status, amount, amount_gross, currency,
   description, account_id, account_name, client_name, project_name, category_name, notes)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2022-08-15', '2022-08-19', 'income', 'confirmed',
  66086.97, 225.0, 'ARS',
  'balcao', NULL, 'Western Union', 'pafcosta', 'yii2', 'Changas', NULL
);
INSERT INTO transactions
  (user_id, date, due_date, type, status, amount, amount_gross, currency,
   description, account_id, account_name, client_name, project_name, category_name, notes)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2022-08-22', '2022-08-26', 'income', 'confirmed',
  65188.7, 225.0, 'ARS',
  'balcao', NULL, 'Western Union', 'pafcosta', 'yii2', 'Changas', NULL
);
INSERT INTO transactions
  (user_id, date, due_date, type, status, amount, amount_gross, currency,
   description, account_id, account_name, client_name, project_name, category_name, notes)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2022-08-29', '2022-09-01', 'income', 'confirmed',
  45235.8, 160.0, 'ARS',
  'balcao', NULL, 'Western Union', 'pafcosta', 'yii2', 'Changas', NULL
);
INSERT INTO transactions
  (user_id, date, due_date, type, status, amount, amount_gross, currency,
   description, account_id, account_name, client_name, project_name, category_name, notes)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2022-11-24', '2022-12-08', 'income', 'confirmed',
  94800.0, 300.0, 'ARS',
  'http://gimaapp.herokuapp.com/', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), 'fpchada', 'django', 'Changas', NULL
);
INSERT INTO transactions
  (user_id, date, due_date, type, status, amount, amount_gross, currency,
   description, account_id, account_name, client_name, project_name, category_name, notes)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2022-11-24', '2022-12-08', 'income', 'confirmed',
  4.0, 5.0, 'USD',
  'http://gimaapp.herokuapp.com/', NULL, 'Fiverr', 'fpchada', 'django', 'Changas', NULL
);
INSERT INTO transactions
  (user_id, date, due_date, type, status, amount, amount_gross, currency,
   description, account_id, account_name, client_name, project_name, category_name, notes)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2022-12-11', '2022-12-13', 'income', 'confirmed',
  16.0, 20.0, 'USD',
  NULL, NULL, 'Fiverr', 'brodskymichael', 'django', 'Changas', NULL
);
INSERT INTO transactions
  (user_id, date, due_date, type, status, amount, amount_gross, currency,
   description, account_id, account_name, client_name, project_name, category_name, notes)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2022-11-30', '2022-12-20', 'income', 'confirmed',
  270.0, NULL, 'USDT',
  'https://calidad.alicantecruisetourism.com/es/encuesta/alicante-2022', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), 'mati c', 'laravel', 'Changas', NULL
);
INSERT INTO transactions
  (user_id, date, due_date, type, status, amount, amount_gross, currency,
   description, account_id, account_name, client_name, project_name, category_name, notes)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2022-11-30', '2022-12-20', 'income', 'confirmed',
  150.0, NULL, 'USDT',
  'https://calidad.alicantecruisetourism.com/es/encuesta/alicante-2022', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), 'mati c', 'laravel', 'Changas', NULL
);
INSERT INTO transactions
  (user_id, date, due_date, type, status, amount, amount_gross, currency,
   description, account_id, account_name, client_name, project_name, category_name, notes)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2022-11-30', '2022-12-02', 'income', 'confirmed',
  126.72, 120.0, 'USD',
  'web app formacao', NULL, 'Payoneer', 'pafcosta', 'codeigniter', 'Changas', NULL
);
INSERT INTO transactions
  (user_id, date, due_date, type, status, amount, amount_gross, currency,
   description, account_id, account_name, client_name, project_name, category_name, notes)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2022-12-05', '2022-12-09', 'income', 'confirmed',
  211.32, 200.0, 'USD',
  'web app formacao', NULL, 'Payoneer', 'pafcosta', 'codeigniter', 'Changas', NULL
);
INSERT INTO transactions
  (user_id, date, due_date, type, status, amount, amount_gross, currency,
   description, account_id, account_name, client_name, project_name, category_name, notes)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2022-12-14', '2022-12-23', 'income', 'confirmed',
  419.04, 396.0, 'USD',
  'web app formacao', NULL, 'Payoneer', 'pafcosta', 'codeigniter', 'Changas', NULL
);
INSERT INTO transactions
  (user_id, date, due_date, type, status, amount, amount_gross, currency,
   description, account_id, account_name, client_name, project_name, category_name, notes)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2022-12-19', '2023-01-10', 'income', 'confirmed',
  200.0, 250.0, 'USD',
  'ecbr', NULL, 'Fiverr', 'aherrera', 'Django', 'Changas', NULL
);
INSERT INTO transactions
  (user_id, date, due_date, type, status, amount, amount_gross, currency,
   description, account_id, account_name, client_name, project_name, category_name, notes)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2022-12-26', '2022-12-30', 'income', 'confirmed',
  221.76000000000002, 210.0, 'USD',
  'web app formacao', NULL, 'Payoneer', 'pafcosta', 'codeigniter', 'Changas', NULL
);
INSERT INTO transactions
  (user_id, date, due_date, type, status, amount, amount_gross, currency,
   description, account_id, account_name, client_name, project_name, category_name, notes)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2022-12-27', '2022-12-30', 'income', 'confirmed',
  100.0, NULL, 'USDT',
  'web app formacao', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), 'pafcosta (mati)', 'codeigniter', 'Changas', NULL
);
INSERT INTO transactions
  (user_id, date, due_date, type, status, amount, amount_gross, currency,
   description, account_id, account_name, client_name, project_name, category_name, notes)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2023-01-02', '2023-01-06', 'income', 'confirmed',
  192.81, 179.21, 'USD',
  'web app formacao', NULL, 'Payoneer', 'pafcosta', 'codeigniter', 'Changas', NULL
);
INSERT INTO transactions
  (user_id, date, due_date, type, status, amount, amount_gross, currency,
   description, account_id, account_name, client_name, project_name, category_name, notes)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2022-12-26', '2023-01-10', 'income', 'confirmed',
  67450.0, 190.0, 'ARS',
  'http://gimaapp.herokuapp.com/', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), 'fpchada', 'django', 'Changas', NULL
);
INSERT INTO transactions
  (user_id, date, due_date, type, status, amount, amount_gross, currency,
   description, account_id, account_name, client_name, project_name, category_name, notes)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2023-01-10', '2023-01-11', 'income', 'confirmed',
  40.0, 50.0, 'USD',
  'ecbr', NULL, 'Fiverr', 'jtaq93', 'Django', 'Changas', NULL
);
INSERT INTO transactions
  (user_id, date, due_date, type, status, amount, amount_gross, currency,
   description, account_id, account_name, client_name, project_name, category_name, notes)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2023-01-09', '2023-01-13', 'income', 'confirmed',
  209.83, 195.0, 'USD',
  'web app formacao', NULL, 'Payoneer', 'pafcosta', 'codeigniter', 'Changas', NULL
);
INSERT INTO transactions
  (user_id, date, due_date, type, status, amount, amount_gross, currency,
   description, account_id, account_name, client_name, project_name, category_name, notes)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2023-01-13', '2023-02-01', 'income', 'confirmed',
  200.0, 250.0, 'USD',
  'ecbr', NULL, 'Fiverr', 'aherrera', 'Django', 'Changas', NULL
);
INSERT INTO transactions
  (user_id, date, due_date, type, status, amount, amount_gross, currency,
   description, account_id, account_name, client_name, project_name, category_name, notes)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2023-01-16', '2023-01-20', 'income', 'confirmed',
  102.21999999999998, 94.55, 'USD',
  'web app formacao', NULL, 'Payoneer', 'pafcosta', 'codeigniter', 'Changas', NULL
);
INSERT INTO transactions
  (user_id, date, due_date, type, status, amount, amount_gross, currency,
   description, account_id, account_name, client_name, project_name, category_name, notes)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2023-01-20', '2023-01-27', 'income', 'confirmed',
  62865.0, 165.0, 'ARS',
  'http://gimaapp.herokuapp.com/', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), 'fpchada', 'Django', 'Changas', NULL
);
INSERT INTO transactions
  (user_id, date, due_date, type, status, amount, amount_gross, currency,
   description, account_id, account_name, client_name, project_name, category_name, notes)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2022-01-24', '2023-02-02', 'income', 'confirmed',
  203.18, NULL, 'USDT',
  'http://metadeportiva.mx/', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), 'octavio velarde', 'laravel', 'Changas', 'bruto original: 495 XRP'
);
INSERT INTO transactions
  (user_id, date, due_date, type, status, amount, amount_gross, currency,
   description, account_id, account_name, client_name, project_name, category_name, notes)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2023-01-23', '2023-01-31', 'income', 'confirmed',
  293.98, 274.0, 'USD',
  'balcao', NULL, 'Payoneer', 'pafcosta', 'yii2', 'Changas', NULL
);
INSERT INTO transactions
  (user_id, date, due_date, type, status, amount, amount_gross, currency,
   description, account_id, account_name, client_name, project_name, category_name, notes)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2023-02-15', '2023-02-17', 'income', 'confirmed',
  124.91, 119.0, 'USD',
  'balcao', NULL, 'Payoneer', 'pafcosta', 'yii2', 'Changas', NULL
);
INSERT INTO transactions
  (user_id, date, due_date, type, status, amount, amount_gross, currency,
   description, account_id, account_name, client_name, project_name, category_name, notes)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2022-02-14', '2023-02-22', 'income', 'confirmed',
  202.97, NULL, 'USDT',
  'http://metadeportiva.mx/', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), 'octavio velarde', 'laravel', 'Changas', 'bruto original: 538,22 XRP'
);
INSERT INTO transactions
  (user_id, date, due_date, type, status, amount, amount_gross, currency,
   description, account_id, account_name, client_name, project_name, category_name, notes)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2023-02-20', '2023-02-24', 'income', 'confirmed',
  100.0, NULL, 'USDT',
  'pim', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), 'pafcosta (mati)', 'laravel', 'Changas', NULL
);
INSERT INTO transactions
  (user_id, date, due_date, type, status, amount, amount_gross, currency,
   description, account_id, account_name, client_name, project_name, category_name, notes)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2022-02-24', '2023-03-02', 'income', 'confirmed',
  196.0, NULL, 'USDT',
  'http://metadeportiva.mx/', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), 'octavio velarde', 'laravel', 'Changas', 'bruto original: 538,22 XRP'
);
INSERT INTO transactions
  (user_id, date, due_date, type, status, amount, amount_gross, currency,
   description, account_id, account_name, client_name, project_name, category_name, notes)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2023-02-26', '2023-03-03', 'income', 'confirmed',
  100.0, NULL, 'USDT',
  'pim', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), 'pafcosta (mati)', 'laravel', 'Changas', NULL
);
INSERT INTO transactions
  (user_id, date, due_date, type, status, amount, amount_gross, currency,
   description, account_id, account_name, client_name, project_name, category_name, notes)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2023-02-20', '2023-03-03', 'income', 'confirmed',
  420.66, 396.0, 'USD',
  'balcao', NULL, 'Payoneer', 'pafcosta', 'yii2', 'Changas', NULL
);
INSERT INTO transactions
  (user_id, date, due_date, type, status, amount, amount_gross, currency,
   description, account_id, account_name, client_name, project_name, category_name, notes)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2023-03-06', '2023-03-14', 'income', 'confirmed',
  125.0, NULL, 'USDT',
  'pim', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), 'pafcosta (mati)', 'laravel', 'Changas', NULL
);
INSERT INTO transactions
  (user_id, date, due_date, type, status, amount, amount_gross, currency,
   description, account_id, account_name, client_name, project_name, category_name, notes)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2023-03-06', '2023-03-17', 'income', 'confirmed',
  419.75, 394.0, 'USD',
  'balcao', NULL, 'Payoneer', 'pafcosta', 'yii2', 'Changas', NULL
);
INSERT INTO transactions
  (user_id, date, due_date, type, status, amount, amount_gross, currency,
   description, account_id, account_name, client_name, project_name, category_name, notes)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2023-03-20', '2023-03-24', 'income', 'confirmed',
  209.34, 194.0, 'USD',
  'balcao', NULL, 'Payoneer', 'pafcosta', 'yii2', 'Changas', NULL
);
INSERT INTO transactions
  (user_id, date, due_date, type, status, amount, amount_gross, currency,
   description, account_id, account_name, client_name, project_name, category_name, notes)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2023-06-22', '2023-06-23', 'income', 'confirmed',
  60.0, 75.0, 'USD',
  'aee', NULL, 'Fiverr', 'jairocosta', 'html y css', 'Changas', NULL
);
INSERT INTO transactions
  (user_id, date, due_date, type, status, amount, amount_gross, currency,
   description, account_id, account_name, client_name, project_name, category_name, notes)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2023-06-30', '2023-07-10', 'income', 'confirmed',
  180.0, 225.0, 'USD',
  'aee', NULL, 'Fiverr', 'jairocosta', 'html y css', 'Changas', NULL
);
INSERT INTO transactions
  (user_id, date, due_date, type, status, amount, amount_gross, currency,
   description, account_id, account_name, client_name, project_name, category_name, notes)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2023-07-20', '2023-07-20', 'income', 'confirmed',
  4.0, 5.0, 'USD',
  'vendedor1', NULL, 'Fiverr', 'darioarg', 'laravel', 'Changas', NULL
);
INSERT INTO transactions
  (user_id, date, due_date, type, status, amount, amount_gross, currency,
   description, account_id, account_name, client_name, project_name, category_name, notes)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2023-07-20', '2023-07-20', 'income', 'confirmed',
  8400.0, NULL, 'ARS',
  'vendedor1', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Mercado Pago' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Mercado Pago' LIMIT 1), 'darioarg', 'laravel', 'Changas', NULL
);
INSERT INTO transactions
  (user_id, date, due_date, type, status, amount, amount_gross, currency,
   description, account_id, account_name, client_name, project_name, category_name, notes)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2023-07-24', '2023-07-27', 'income', 'confirmed',
  100.0, NULL, 'USDT',
  'aee', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), 'jairocosta', 'html y css', 'Changas', NULL
);
INSERT INTO transactions
  (user_id, date, due_date, type, status, amount, amount_gross, currency,
   description, account_id, account_name, client_name, project_name, category_name, notes)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2023-07-31', '2023-08-04', 'income', 'confirmed',
  16.0, 20.0, 'USD',
  'fansbury', NULL, 'Fiverr', 'federico grajirena', 'react y symfony', 'Changas', NULL
);
INSERT INTO transactions
  (user_id, date, due_date, type, status, amount, amount_gross, currency,
   description, account_id, account_name, client_name, project_name, category_name, notes)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2023-08-11', '2023-08-11', 'income', 'confirmed',
  25.0, NULL, 'USDT',
  'vendedor1', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), 'darioarg', 'laravel', 'Changas', NULL
);
INSERT INTO transactions
  (user_id, date, due_date, type, status, amount, amount_gross, currency,
   description, account_id, account_name, client_name, project_name, category_name, notes)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2023-08-07', '2023-08-11', 'income', 'confirmed',
  175.0, NULL, 'USDT',
  'fansbury', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), 'federico grajirena', 'react y symfony', 'Changas', NULL
);
INSERT INTO transactions
  (user_id, date, due_date, type, status, amount, amount_gross, currency,
   description, account_id, account_name, client_name, project_name, category_name, notes)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2023-08-21', '2023-09-03', 'income', 'confirmed',
  200.0, NULL, 'USDT',
  'fansbury', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), 'federico grajirena', 'react y symfony', 'Changas', NULL
);
INSERT INTO transactions
  (user_id, date, due_date, type, status, amount, amount_gross, currency,
   description, account_id, account_name, client_name, project_name, category_name, notes)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2024-01-03', '2024-01-09', 'income', 'confirmed',
  48.0, 60.0, 'USD',
  'form pdf', NULL, 'Fiverr', 'srisundar', 'php', 'Changas', NULL
);
INSERT INTO transactions
  (user_id, date, due_date, type, status, amount, amount_gross, currency,
   description, account_id, account_name, client_name, project_name, category_name, notes)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2024-01-20', '2024-01-23', 'income', 'confirmed',
  65.60000000000001, 82.0, 'USD',
  NULL, NULL, 'Fiverr', 'danielabadgarci', 'php y mysql', 'Changas', NULL
);
INSERT INTO transactions
  (user_id, date, due_date, type, status, amount, amount_gross, currency,
   description, account_id, account_name, client_name, project_name, category_name, notes)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2024-02-01', '2024-02-20', 'income', 'confirmed',
  180.0, 180.78, 'USDT',
  'https://bigpollo.mayoristasbahia.com/', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), 'darioarg', 'php', 'Changas', NULL
);
INSERT INTO transactions
  (user_id, date, due_date, type, status, amount, amount_gross, currency,
   description, account_id, account_name, client_name, project_name, category_name, notes)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2024-02-14', '2024-02-24', 'income', 'confirmed',
  292.0, 365.0, 'USD',
  NULL, NULL, 'Fiverr', 'aesgard', 'django y react', 'Changas', NULL
);
INSERT INTO transactions
  (user_id, date, due_date, type, status, amount, amount_gross, currency,
   description, account_id, account_name, client_name, project_name, category_name, notes)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2024-02-16', '2024-02-20', 'income', 'confirmed',
  70.11, NULL, 'USDT',
  'https://bigpollo.mayoristasbahia.com/', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), 'darioarg', 'php', 'Changas', NULL
);
INSERT INTO transactions
  (user_id, date, due_date, type, status, amount, amount_gross, currency,
   description, account_id, account_name, client_name, project_name, category_name, notes)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2024-03-19', '2024-04-11', 'income', 'confirmed',
  440.47200000000004, 550.59, 'USD',
  'qombo', NULL, 'Fiverr', 'aesgard', 'django y react', 'Changas', NULL
);
INSERT INTO transactions
  (user_id, date, due_date, type, status, amount, amount_gross, currency,
   description, account_id, account_name, client_name, project_name, category_name, notes)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2024-07-01', '2024-07-22', 'income', 'confirmed',
  400.0, 550.0, 'USD',
  'derecholibre (1A)', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), 'joaquin canizo', 'react y node', 'Changas', NULL
);
INSERT INTO transactions
  (user_id, date, due_date, type, status, amount, amount_gross, currency,
   description, account_id, account_name, client_name, project_name, category_name, notes)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2024-07-04', '2024-07-26', 'income', 'confirmed',
  400.0, 500.0, 'USD',
  'qombo', NULL, 'Fiverr', 'aesgard', 'django y react', 'Changas', NULL
);
INSERT INTO transactions
  (user_id, date, due_date, type, status, amount, amount_gross, currency,
   description, account_id, account_name, client_name, project_name, category_name, notes)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2024-07-15', '2024-07-30', 'income', 'confirmed',
  240.0, 300.0, 'USD',
  'entrenamiento oyt', NULL, 'Fiverr', 'gabo', 'laravel', 'Changas', NULL
);
INSERT INTO transactions
  (user_id, date, due_date, type, status, amount, amount_gross, currency,
   description, account_id, account_name, client_name, project_name, category_name, notes)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2024-08-03', '2024-10-01', 'income', 'confirmed',
  1032.0, 1290.0, 'USD',
  'pistachos', NULL, 'Fiverr', 'deposte y fernando1445', 'symfony', 'Changas', NULL
);
INSERT INTO transactions
  (user_id, date, due_date, type, status, amount, amount_gross, currency,
   description, account_id, account_name, client_name, project_name, category_name, notes)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2024-08-09', '2024-09-05', 'income', 'confirmed',
  240.0, 300.0, 'USD',
  'entrenamiento oyt', NULL, 'Fiverr', 'gabo', 'laravel', 'Changas', NULL
);
INSERT INTO transactions
  (user_id, date, due_date, type, status, amount, amount_gross, currency,
   description, account_id, account_name, client_name, project_name, category_name, notes)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2024-07-23', '2024-09-11', 'income', 'confirmed',
  450.0, NULL, 'USDT',
  'derecholibre (1B)', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), 'joaquin canizo', 'react y node', 'Changas', NULL
);
INSERT INTO transactions
  (user_id, date, due_date, type, status, amount, amount_gross, currency,
   description, account_id, account_name, client_name, project_name, category_name, notes)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2024-12-18', '2025-02-20', 'income', 'confirmed',
  445.0, 450.0, 'USD',
  'derecholibre (1C-i)', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'savings' AND currency = 'USD' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'savings' AND currency = 'USD' LIMIT 1), 'joaquin canizo', 'react y node', 'Changas', NULL
);
INSERT INTO transactions
  (user_id, date, due_date, type, status, amount, amount_gross, currency,
   description, account_id, account_name, client_name, project_name, category_name, notes)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2024-12-18', '2025-02-20', 'income', 'confirmed',
  400.0, NULL, 'USDT',
  'derecholibre (1C-ii)', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), 'joaquin canizo', 'react y node', 'Changas', NULL
);
INSERT INTO transactions
  (user_id, date, due_date, type, status, amount, amount_gross, currency,
   description, account_id, account_name, client_name, project_name, category_name, notes)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2024-12-18', '2025-02-20', 'income', 'confirmed',
  391.0, 400.0, 'USD',
  'derecholibre (1C-iIi)', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'savings' AND currency = 'USD' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'savings' AND currency = 'USD' LIMIT 1), 'joaquin canizo', 'react y node', 'Changas', NULL
);
INSERT INTO transactions
  (user_id, date, due_date, type, status, amount, amount_gross, currency,
   description, account_id, account_name, client_name, project_name, category_name, notes)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2025-03-03', '2025-03-25', 'income', 'confirmed',
  240.0, 300.0, 'USD',
  'provetic', NULL, 'Fiverr', 'emiliano (don del norte)', 'flask', 'Changas', NULL
);
INSERT INTO transactions
  (user_id, date, due_date, type, status, amount, amount_gross, currency,
   description, account_id, account_name, client_name, project_name, category_name, notes)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2025-04-01', '2025-04-30', 'income', 'confirmed',
  109.67, NULL, 'EUR',
  'ernmt-php', NULL, 'Santander', 'Jo', 'html y css, docker', 'Changas', NULL
);
INSERT INTO transactions
  (user_id, date, due_date, type, status, amount, amount_gross, currency,
   description, account_id, account_name, client_name, project_name, category_name, notes)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2025-06-01', '2025-09-01', 'income', 'confirmed',
  1100.0, NULL, 'USD',
  'derecho libre (2 preliminar)', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'savings' AND currency = 'USD' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'savings' AND currency = 'USD' LIMIT 1), 'joaquin canizo', 'react y node', 'Changas', NULL
);
INSERT INTO transactions
  (user_id, date, due_date, type, status, amount, amount_gross, currency,
   description, account_id, account_name, client_name, project_name, category_name, notes)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2025-09-09', '2025-09-30', 'income', 'confirmed',
  650.0, NULL, 'USDT',
  'colgest', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), 'emece y datatrends', 'symfony y angular', 'Changas', NULL
);
INSERT INTO transactions
  (user_id, date, due_date, type, status, amount, amount_gross, currency,
   description, account_id, account_name, client_name, project_name, category_name, notes)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2025-10-01', '2025-10-31', 'income', 'confirmed',
  1240.0, NULL, 'USDT',
  'colgest', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), 'emece y datatrends', 'symfony y angular', 'Changas', NULL
);
INSERT INTO transactions
  (user_id, date, due_date, type, status, amount, amount_gross, currency,
   description, account_id, account_name, client_name, project_name, category_name, notes)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2025-11-18', '2025-11-30', 'income', 'confirmed',
  200.0, 225.0, 'USD',
  'bonete e irazu', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'savings' AND currency = 'USD' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'savings' AND currency = 'USD' LIMIT 1), 'cipax', 'laravel', 'Changas', NULL
);
INSERT INTO transactions
  (user_id, date, due_date, type, status, amount, amount_gross, currency,
   description, account_id, account_name, client_name, project_name, category_name, notes)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2025-11-01', '2025-11-30', 'income', 'confirmed',
  1260.0, NULL, 'USDT',
  'colgest', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), 'emece y datatrends', 'symfony y angular', 'Changas', NULL
);
INSERT INTO transactions
  (user_id, date, due_date, type, status, amount, amount_gross, currency,
   description, account_id, account_name, client_name, project_name, category_name, notes)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2025-12-01', '2025-12-31', 'income', 'confirmed',
  1570.0, NULL, 'USDT',
  'colgest', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), 'emece y datatrends', 'symfony y angular', 'Changas', NULL
);
INSERT INTO transactions
  (user_id, date, due_date, type, status, amount, amount_gross, currency,
   description, account_id, account_name, client_name, project_name, category_name, notes)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2025-12-01', '2025-12-31', 'income', 'confirmed',
  476.51, 500.0, 'USD',
  'bonete e irazu', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'savings' AND currency = 'USD' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'savings' AND currency = 'USD' LIMIT 1), 'cipax', 'laravel', 'Changas', NULL
);
INSERT INTO transactions
  (user_id, date, due_date, type, status, amount, amount_gross, currency,
   description, account_id, account_name, client_name, project_name, category_name, notes)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2026-01-01', '2026-01-31', 'income', 'confirmed',
  600.0, NULL, 'USD',
  'bonete', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'cash' AND currency = 'USD' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'cash' AND currency = 'USD' LIMIT 1), 'cipax', 'laravel', 'Changas', NULL
);
INSERT INTO transactions
  (user_id, date, due_date, type, status, amount, amount_gross, currency,
   description, account_id, account_name, client_name, project_name, category_name, notes)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2026-01-01', '2026-01-31', 'income', 'confirmed',
  1775.0, NULL, 'USDT',
  'colgest y mint', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), 'emece y datatrends', 'symfony y angular', 'Changas', NULL
);
INSERT INTO transactions
  (user_id, date, due_date, type, status, amount, amount_gross, currency,
   description, account_id, account_name, client_name, project_name, category_name, notes)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2025-12-10', '2026-02-10', 'income', 'confirmed',
  352.61, 350.0, 'USD',
  'mega', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'savings' AND currency = 'USD' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'savings' AND currency = 'USD' LIMIT 1), 'chiosso - mega', 'laravel', 'Changas', NULL
);
INSERT INTO transactions
  (user_id, date, due_date, type, status, amount, amount_gross, currency,
   description, account_id, account_name, client_name, project_name, category_name, notes)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2025-12-20', '2026-02-20', 'income', 'confirmed',
  1200.0, NULL, 'USD',
  'derecho libre (2 A)', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'savings' AND currency = 'USD' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'savings' AND currency = 'USD' LIMIT 1), 'joaquin canizo', 'react y node', 'Changas', NULL
);
INSERT INTO transactions
  (user_id, date, due_date, type, status, amount, amount_gross, currency,
   description, account_id, account_name, client_name, project_name, category_name, notes)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2026-02-01', '2026-02-28', 'income', 'confirmed',
  1240.0, NULL, 'USDT',
  'colgest', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), 'emece y datatrends', 'symfony y angular', 'Changas', NULL
);
INSERT INTO transactions
  (user_id, date, due_date, type, status, amount, amount_gross, currency,
   description, account_id, account_name, client_name, project_name, category_name, notes)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2026-02-02', '2026-02-28', 'income', 'confirmed',
  600.0, NULL, 'USD',
  'bonete', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'cash' AND currency = 'USD' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'cash' AND currency = 'USD' LIMIT 1), 'cipax', 'laravel', 'Changas', NULL
);
INSERT INTO transactions
  (user_id, date, due_date, type, status, amount, amount_gross, currency,
   description, account_id, account_name, client_name, project_name, category_name, notes)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2026-02-20', '2026-03-20', 'income', 'confirmed',
  300000.0, NULL, 'ARS',
  'mega', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Mercado Pago' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Mercado Pago' LIMIT 1), 'chiosso - mega', 'laravel', 'Changas', NULL
);
INSERT INTO transactions
  (user_id, date, due_date, type, status, amount, amount_gross, currency,
   description, account_id, account_name, client_name, project_name, category_name, notes)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2026-03-02', '2026-03-31', 'income', 'confirmed',
  1160.0, NULL, 'USD',
  'colgest', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), 'datatrends', 'symfony y angular', 'Changas', NULL
);
INSERT INTO transactions
  (user_id, date, due_date, type, status, amount, amount_gross, currency,
   description, account_id, account_name, client_name, project_name, category_name, notes)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2026-03-02', '2026-04-30', 'income', 'confirmed',
  378.0, 333.0, 'USD',
  'bonete', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'cash' AND currency = 'USD' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'cash' AND currency = 'USD' LIMIT 1), 'cipax', 'laravel', 'Changas', NULL
);
INSERT INTO transactions
  (user_id, date, due_date, type, status, amount, amount_gross, currency,
   description, account_id, account_name, client_name, project_name, category_name, notes)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2026-03-02', '2026-03-31', 'income', 'confirmed',
  1200000.0, NULL, 'ARS',
  'ssfs2', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Mercado Pago' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Mercado Pago' LIMIT 1), 'sf sistemas', 'JAVA', 'Changas', NULL
);
INSERT INTO transactions
  (user_id, date, due_date, type, status, amount, amount_gross, currency,
   description, account_id, account_name, client_name, project_name, category_name, notes)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2026-04-01', '2026-04-10', 'income', 'confirmed',
  300000.0, NULL, 'ARS',
  'ssfs2', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Mercado Pago' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Mercado Pago' LIMIT 1), 'sf sistemas', 'JAVA', 'Changas', NULL
);

-- ================================================================
-- 4. OTROS INGRESOS  →  income (o expense si negativo) / Otros
--    Sin fecha exacta (date = NULL)
-- ================================================================

INSERT INTO transactions
  (user_id, date, type, status, amount, currency,
   description, account_id, account_name, category_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', NULL, 'income', 'confirmed', 385.0, 'USD',
  'regalos y ahorro previo', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'cash' AND currency = 'USD' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'cash' AND currency = 'USD' LIMIT 1), 'Otros'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency,
   description, account_id, account_name, category_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', NULL, 'income', 'confirmed', 17150.0, 'ARS',
  'viaje a gesell', NULL, 'Previaje', 'Otros'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency,
   description, account_id, account_name, category_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', NULL, 'income', 'confirmed', 15.0, 'USD',
  'quería tener redondo', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'cash' AND currency = 'USD' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'cash' AND currency = 'USD' LIMIT 1), 'Otros'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency,
   description, account_id, account_name, category_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', NULL, 'income', 'confirmed', 100.0, 'ARS',
  'quería tener redondo', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'cash' AND currency = 'ARS' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'cash' AND currency = 'ARS' LIMIT 1), 'Otros'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency,
   description, account_id, account_name, category_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', NULL, 'income', 'confirmed', 34000.0, 'ARS',
  'moto one hyper', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), 'Otros'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency,
   description, account_id, account_name, category_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', NULL, 'income', 'confirmed', 4500.0, 'ARS',
  'rendimientos', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Mercado Pago' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Mercado Pago' LIMIT 1), 'Otros'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency,
   description, account_id, account_name, category_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', NULL, 'income', 'confirmed', 13026.0, 'ARS',
  'mitad sere estadía en baires', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Mercado Pago' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Mercado Pago' LIMIT 1), 'Otros'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency,
   description, account_id, account_name, category_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', NULL, 'income', 'confirmed', 100.0, 'USD',
  'regalo', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'cash' AND currency = 'USD' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'cash' AND currency = 'USD' LIMIT 1), 'Otros'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency,
   description, account_id, account_name, category_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', NULL, 'income', 'confirmed', 15.0, 'USDT',
  'bots trading', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), 'Otros'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency,
   description, account_id, account_name, category_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', NULL, 'income', 'confirmed', 10.0, 'USDT',
  'bots trading', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), 'Otros'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency,
   description, account_id, account_name, category_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', NULL, 'income', 'confirmed', 33.0, 'USDT',
  'bots trading', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), 'Otros'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency,
   description, account_id, account_name, category_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', NULL, 'income', 'confirmed', 16.0, 'USDT',
  'simple earn', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), 'Otros'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency,
   description, account_id, account_name, category_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', NULL, 'income', 'confirmed', 30.0, 'USDT',
  'beca', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), 'Otros'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency,
   description, account_id, account_name, category_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', NULL, 'income', 'confirmed', 34.0, 'USDT',
  'bots trading ETH', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), 'Otros'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency,
   description, account_id, account_name, category_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', NULL, 'income', 'confirmed', 46.0, 'USDT',
  'bots trading BTC', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), 'Otros'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency,
   description, account_id, account_name, category_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', NULL, 'income', 'confirmed', 6.0, 'USDT',
  'simple earn', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), 'Otros'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency,
   description, account_id, account_name, category_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', NULL, 'income', 'confirmed', 100.0, 'USDT',
  'beca', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), 'Otros'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency,
   description, account_id, account_name, category_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', NULL, 'income', 'confirmed', 40.0, 'USDT',
  'bots trading', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), 'Otros'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency,
   description, account_id, account_name, category_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', NULL, 'income', 'confirmed', 23.3, 'USDT',
  'simple earn', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), 'Otros'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency,
   description, account_id, account_name, category_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', NULL, 'income', 'confirmed', 35.37, 'USDT',
  'beca', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), 'Otros'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency,
   description, account_id, account_name, category_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', NULL, 'income', 'confirmed', 7.59, 'USD',
  'reembolso airbnb', NULL, 'Paypal', 'Otros'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency,
   description, account_id, account_name, category_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', NULL, 'income', 'confirmed', 77.52, 'USDT',
  'bots de trading', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), 'Otros'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency,
   description, account_id, account_name, category_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', NULL, 'income', 'confirmed', 100.0, 'USD',
  'regalo padres', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'cash' AND currency = 'USD' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'cash' AND currency = 'USD' LIMIT 1), 'Otros'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency,
   description, account_id, account_name, category_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', NULL, 'expense', 'confirmed', 200.0, 'USDT',
  'bots de trading', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), 'Otros'
);

-- ================================================================
-- 5. GASTOS  →  expense / Vida general
-- ================================================================

INSERT INTO transactions
  (user_id, date, type, status, amount, currency,
   description, account_id, account_name, category_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2021-03-24', 'expense', 'confirmed', 11.99, 'USD',
  'Udemy', NULL, 'Paypal', 'Vida general'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency,
   description, account_id, account_name, category_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2021-05-18', 'expense', 'confirmed', 50.0, 'USD',
  'Zapas', NULL, 'Paypal', 'Vida general'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency,
   description, account_id, account_name, category_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2021-08-06', 'expense', 'confirmed', 700.0, 'ARS',
  'fiama socks', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), 'Vida general'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency,
   description, account_id, account_name, category_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2021-08-11', 'expense', 'confirmed', 2850.0, 'ARS',
  'poleras dellabita', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), 'Vida general'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency,
   description, account_id, account_name, category_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2021-08-11', 'expense', 'confirmed', 3950.0, 'ARS',
  'campera hipólita', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), 'Vida general'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency,
   description, account_id, account_name, category_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2021-10-04', 'expense', 'confirmed', 34300.0, 'ARS',
  'viaje expertur', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), 'Vida general'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency,
   description, account_id, account_name, category_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2021-10-07', 'expense', 'confirmed', 425.0, 'ARS',
  'presté a sere', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), 'Vida general'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency,
   description, account_id, account_name, category_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2021-10-24', 'expense', 'confirmed', 7580.0, 'ARS',
  'almuerzo ovidio', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), 'Vida general'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency,
   description, account_id, account_name, category_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2021-11-09', 'expense', 'confirmed', 400.0, 'ARS',
  'anillo niña moza', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), 'Vida general'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency,
   description, account_id, account_name, category_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2021-12-20', 'expense', 'confirmed', 2000.0, 'ARS',
  'navidad', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), 'Vida general'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency,
   description, account_id, account_name, category_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2021-12-26', 'expense', 'confirmed', 481.63, 'ARS',
  'cine', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), 'Vida general'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency,
   description, account_id, account_name, category_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2022-01-14', 'expense', 'confirmed', 16628.0, 'ARS',
  'gesell', NULL, 'Previaje', 'Vida general'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency,
   description, account_id, account_name, category_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2022-02-05', 'expense', 'confirmed', 9014.0, 'ARS',
  'ropa shorts', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), 'Vida general'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency,
   description, account_id, account_name, category_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2022-02-27', 'expense', 'confirmed', 10200.0, 'ARS',
  'ropa bs as', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), 'Vida general'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency,
   description, account_id, account_name, category_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2022-03-01', 'expense', 'confirmed', 4000.0, 'ARS',
  'masajes febrero', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), 'Vida general'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency,
   description, account_id, account_name, category_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2022-03-02', 'expense', 'confirmed', 14030.0, 'ARS',
  'gina jeans', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), 'Vida general'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency,
   description, account_id, account_name, category_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2022-03-02', 'expense', 'confirmed', 2760.0, 'ARS',
  'maquillaje y espejo raffi', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), 'Vida general'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency,
   description, account_id, account_name, category_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2022-03-02', 'expense', 'confirmed', 1430.0, 'ARS',
  'agenda', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), 'Vida general'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency,
   description, account_id, account_name, category_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2022-03-24', 'expense', 'confirmed', 7400.0, 'ARS',
  'cuotas 1, 2 reloj', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), 'Vida general'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency,
   description, account_id, account_name, category_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2022-06-10', 'expense', 'confirmed', 4000.0, 'ARS',
  'cuota 3 reloj', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), 'Vida general'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency,
   description, account_id, account_name, category_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2022-06-18', 'expense', 'confirmed', 7.28, 'USD',
  'matiii', NULL, 'Paypal', 'Vida general'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency,
   description, account_id, account_name, category_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2022-07-05', 'expense', 'confirmed', 50000.0, 'ARS',
  'lolapalurda', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Mercado Pago' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Mercado Pago' LIMIT 1), 'Vida general'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency,
   description, account_id, account_name, category_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2022-07-21', 'expense', 'confirmed', 2800.0, 'ARS',
  'auriculares', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Mercado Pago' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Mercado Pago' LIMIT 1), 'Vida general'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency,
   description, account_id, account_name, category_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2022-07-26', 'expense', 'confirmed', 10570.0, 'ARS',
  'clara', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Mercado Pago' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Mercado Pago' LIMIT 1), 'Vida general'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency,
   description, account_id, account_name, category_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2022-08-01', 'expense', 'confirmed', 4000.0, 'ARS',
  'cuota 5 reloj', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Mercado Pago' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Mercado Pago' LIMIT 1), 'Vida general'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency,
   description, account_id, account_name, category_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2022-08-01', 'expense', 'confirmed', 12500.0, 'ARS',
  'cuota 2 celu', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Mercado Pago' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Mercado Pago' LIMIT 1), 'Vida general'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency,
   description, account_id, account_name, category_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2022-08-15', 'expense', 'confirmed', 1000.0, 'ARS',
  'regalo franche', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Mercado Pago' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Mercado Pago' LIMIT 1), 'Vida general'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency,
   description, account_id, account_name, category_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2022-08-19', 'expense', 'confirmed', 1200.0, 'ARS',
  'medias mb', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Mercado Pago' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Mercado Pago' LIMIT 1), 'Vida general'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency,
   description, account_id, account_name, category_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2022-08-19', 'expense', 'confirmed', 900.0, 'ARS',
  'uvas', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Mercado Pago' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Mercado Pago' LIMIT 1), 'Vida general'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency,
   description, account_id, account_name, category_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2022-08-19', 'expense', 'confirmed', 3800.0, 'ARS',
  'pirjume', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Mercado Pago' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Mercado Pago' LIMIT 1), 'Vida general'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency,
   description, account_id, account_name, category_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2022-09-09', 'expense', 'confirmed', 16500.0, 'ARS',
  'cuotas 3 celu y 6 reloj', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Mercado Pago' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Mercado Pago' LIMIT 1), 'Vida general'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency,
   description, account_id, account_name, category_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2022-09-16', 'expense', 'confirmed', 5000.0, 'ARS',
  'shampu crema y otros', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Mercado Pago' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Mercado Pago' LIMIT 1), 'Vida general'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency,
   description, account_id, account_name, category_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2022-10-10', 'expense', 'confirmed', 21700.0, 'ARS',
  'cuotas y renov google', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), 'Vida general'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency,
   description, account_id, account_name, category_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2022-11-08', 'expense', 'confirmed', 16500.0, 'ARS',
  'cuota 8 reloj y 5 celu', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), 'Vida general'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency,
   description, account_id, account_name, category_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2022-12-09', 'expense', 'confirmed', 4000.0, 'ARS',
  'recep bro carli', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Mercado Pago' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Mercado Pago' LIMIT 1), 'Vida general'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency,
   description, account_id, account_name, category_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2022-12-16', 'expense', 'confirmed', 20500.0, 'ARS',
  'cuota 6 celu y 9y10 reloj', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), 'Vida general'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency,
   description, account_id, account_name, category_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2022-12-22', 'expense', 'confirmed', 7460.0, 'ARS',
  'regalos navidad', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Mercado Pago' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Mercado Pago' LIMIT 1), 'Vida general'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency,
   description, account_id, account_name, category_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2023-01-20', 'expense', 'confirmed', 617.32, 'USDT',
  'notebook', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), 'Vida general'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency,
   description, account_id, account_name, category_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2023-01-22', 'expense', 'confirmed', 2995.0, 'ARS',
  'super', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Mercado Pago' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Mercado Pago' LIMIT 1), 'Vida general'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency,
   description, account_id, account_name, category_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2023-02-15', 'expense', 'confirmed', 4000.0, 'ARS',
  'reme+helado', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Mercado Pago' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Mercado Pago' LIMIT 1), 'Vida general'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency,
   description, account_id, account_name, category_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2023-02-01', 'expense', 'confirmed', 29.95, 'USD',
  'manteinance', NULL, 'Payoneer', 'Vida general'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency,
   description, account_id, account_name, category_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2023-03-02', 'expense', 'confirmed', 24.69, 'USDT',
  'auriculares', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), 'Vida general'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency,
   description, account_id, account_name, category_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2023-03-02', 'expense', 'confirmed', 72.85, 'USD',
  'Studio almagro lolla', NULL, 'Payoneer', 'Vida general'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency,
   description, account_id, account_name, category_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2023-03-09', 'expense', 'confirmed', 11248.0, 'ARS',
  'pasajes a baires', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Mercado Pago' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Mercado Pago' LIMIT 1), 'Vida general'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency,
   description, account_id, account_name, category_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2023-03-12', 'expense', 'confirmed', 4043.0, 'ARS',
  'alvear y grido', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Mercado Pago' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Mercado Pago' LIMIT 1), 'Vida general'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency,
   description, account_id, account_name, category_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2023-03-20', 'expense', 'confirmed', 1950.0, 'ARS',
  'gastos lolla', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Mercado Pago' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Mercado Pago' LIMIT 1), 'Vida general'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency,
   description, account_id, account_name, category_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2023-03-19', 'expense', 'confirmed', 5800.0, 'ARS',
  'gastos pulsera lolla', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Mercado Pago' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Mercado Pago' LIMIT 1), 'Vida general'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency,
   description, account_id, account_name, category_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2023-03-29', 'expense', 'confirmed', 9600.0, 'ARS',
  'pasajes a baires', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Mercado Pago' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Mercado Pago' LIMIT 1), 'Vida general'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency,
   description, account_id, account_name, category_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2023-03-29', 'expense', 'confirmed', 43.935, 'USD',
  'mint room palacio', NULL, 'Payoneer', 'Vida general'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency,
   description, account_id, account_name, category_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2023-04-09', 'expense', 'confirmed', 7158.25, 'ARS',
  'parte gastos busas', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Mercado Pago' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Mercado Pago' LIMIT 1), 'Vida general'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency,
   description, account_id, account_name, category_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2023-06-29', 'expense', 'confirmed', 11181.24, 'ARS',
  'regalo', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Mercado Pago' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Mercado Pago' LIMIT 1), 'Vida general'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency,
   description, account_id, account_name, category_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2023-07-05', 'expense', 'confirmed', 7641.0, 'ARS',
  'auriculares', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Mercado Pago' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Mercado Pago' LIMIT 1), 'Vida general'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency,
   description, account_id, account_name, category_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2023-09-05', 'expense', 'confirmed', 52.0, 'USDT',
  'harlem + gastos', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), 'Vida general'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency,
   description, account_id, account_name, category_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2023-12-11', 'expense', 'confirmed', 106.64, 'USDT',
  'pasaje cole', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), 'Vida general'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency,
   description, account_id, account_name, category_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2023-12-11', 'expense', 'confirmed', 8.0, 'USDT',
  'gastos', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), 'Vida general'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency,
   description, account_id, account_name, category_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2024-03-02', 'expense', 'confirmed', 300.0, 'USD',
  'celu', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'cash' AND currency = 'USD' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'cash' AND currency = 'USD' LIMIT 1), 'Vida general'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency,
   description, account_id, account_name, category_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2024-03-02', 'expense', 'confirmed', 120.0, 'USDT',
  'cargador, vidrio y auris celu', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), 'Vida general'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency,
   description, account_id, account_name, category_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2024-03-16', 'expense', 'confirmed', 58.7, 'USDT',
  'vaso stanley', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), 'Vida general'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency,
   description, account_id, account_name, category_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2024-03-18', 'expense', 'confirmed', 29.95, 'USD',
  'anual fee', NULL, 'Payoneer', 'Vida general'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency,
   description, account_id, account_name, category_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2024-10-28', 'expense', 'confirmed', 187.0, 'USDT',
  'rosario', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), 'Vida general'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency,
   description, account_id, account_name, category_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2024-11-25', 'expense', 'confirmed', 1200.0, 'USDT',
  'pasajes a madrid', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), 'Vida general'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency,
   description, account_id, account_name, category_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2025-02-19', 'expense', 'confirmed', 32.13, 'USD',
  'campera bershka', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'savings' AND currency = 'USD' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'savings' AND currency = 'USD' LIMIT 1), 'Vida general'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency,
   description, account_id, account_name, category_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', NULL, 'expense', 'confirmed', 56.0, 'USD',
  'auris JBL', NULL, 'Paypal', 'Vida general'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency,
   description, account_id, account_name, category_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2025-03-03', 'expense', 'confirmed', 106.38, 'USD',
  'camperas, jean y remera bershka', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'savings' AND currency = 'USD' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'savings' AND currency = 'USD' LIMIT 1), 'Vida general'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency,
   description, account_id, account_name, category_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2025-03-03', 'expense', 'confirmed', 21.06, 'USD',
  'arito nariz', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'savings' AND currency = 'USD' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'savings' AND currency = 'USD' LIMIT 1), 'Vida general'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency,
   description, account_id, account_name, category_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2025-03-03', 'expense', 'confirmed', 5.25, 'USD',
  'crema cara', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'savings' AND currency = 'USD' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'savings' AND currency = 'USD' LIMIT 1), 'Vida general'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency,
   description, account_id, account_name, category_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2025-03-16', 'expense', 'confirmed', 50.0, 'USD',
  'emilia sevilla', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'savings' AND currency = 'USD' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'savings' AND currency = 'USD' LIMIT 1), 'Vida general'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency,
   description, account_id, account_name, category_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2025-03-22', 'expense', 'confirmed', 75.0, 'USD',
  'excursion a segovia', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'savings' AND currency = 'USD' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'savings' AND currency = 'USD' LIMIT 1), 'Vida general'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency,
   description, account_id, account_name, category_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2025-03-19', 'expense', 'confirmed', 29.0, 'USD',
  'parte alojamiento oporto', NULL, 'Paypal', 'Vida general'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency,
   description, account_id, account_name, category_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2025-03-05', 'expense', 'confirmed', 57.37, 'USD',
  'mas renfe joven', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'savings' AND currency = 'USD' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'savings' AND currency = 'USD' LIMIT 1), 'Vida general'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency,
   description, account_id, account_name, category_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2025-03-30', 'expense', 'confirmed', 74.69999999999999, 'USD',
  'madrid', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'savings' AND currency = 'USD' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'savings' AND currency = 'USD' LIMIT 1), 'Vida general'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency,
   description, account_id, account_name, category_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2025-04-16', 'expense', 'confirmed', 224.13000000000002, 'USD',
  'portugal semana santa', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'savings' AND currency = 'USD' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'savings' AND currency = 'USD' LIMIT 1), 'Vida general'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency,
   description, account_id, account_name, category_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2025-04-21', 'expense', 'confirmed', 69.94, 'USD',
  'españa semana santa', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'savings' AND currency = 'USD' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'savings' AND currency = 'USD' LIMIT 1), 'Vida general'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency,
   description, account_id, account_name, category_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2025-04-17', 'expense', 'confirmed', 65.73, 'USD',
  'converse', NULL, 'Paypal', 'Vida general'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency,
   description, account_id, account_name, category_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2025-04-19', 'expense', 'confirmed', 59.69, 'USD',
  'zapas lluvia', NULL, 'Paypal', 'Vida general'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency,
   description, account_id, account_name, category_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2025-04-19', 'expense', 'confirmed', 22.99, 'USD',
  'bat portatil', NULL, 'Paypal', 'Vida general'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency,
   description, account_id, account_name, category_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2025-05-28', 'expense', 'confirmed', 57.99, 'EUR',
  'auriculares papá', NULL, 'Santander', 'Vida general'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency,
   description, account_id, account_name, category_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2025-05-26', 'expense', 'confirmed', 160.0, 'EUR',
  'celu mamá', NULL, 'Santander', 'Vida general'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency,
   description, account_id, account_name, category_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2025-05-28', 'expense', 'confirmed', 14.99, 'EUR',
  'juguete lolo', NULL, 'Santander', 'Vida general'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency,
   description, account_id, account_name, category_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2025-06-03', 'expense', 'confirmed', 54.33, 'USD',
  'bershka', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'savings' AND currency = 'USD' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'savings' AND currency = 'USD' LIMIT 1), 'Vida general'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency,
   description, account_id, account_name, category_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2025-06-03', 'expense', 'confirmed', 9.22, 'USD',
  'aritos', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'savings' AND currency = 'USD' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'savings' AND currency = 'USD' LIMIT 1), 'Vida general'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency,
   description, account_id, account_name, category_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2025-06-03', 'expense', 'confirmed', 6.93, 'USD',
  'funda manu', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'savings' AND currency = 'USD' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'savings' AND currency = 'USD' LIMIT 1), 'Vida general'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency,
   description, account_id, account_name, category_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2025-06-06', 'expense', 'confirmed', 80.26, 'USD',
  'sevilla', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'savings' AND currency = 'USD' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'savings' AND currency = 'USD' LIMIT 1), 'Vida general'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency,
   description, account_id, account_name, category_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2025-06-21', 'expense', 'confirmed', 30.0, 'USD',
  'camisa y funda HM', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'savings' AND currency = 'USD' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'savings' AND currency = 'USD' LIMIT 1), 'Vida general'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency,
   description, account_id, account_name, category_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2025-08-08', 'expense', 'confirmed', 40.0, 'USDT',
  'cba girlies', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), 'Vida general'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency,
   description, account_id, account_name, category_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2025-08-26', 'expense', 'confirmed', 20.0, 'USD',
  'chat gitipi', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'savings' AND currency = 'USD' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'savings' AND currency = 'USD' LIMIT 1), 'Vida general'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency,
   description, account_id, account_name, category_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2025-09-21', 'expense', 'confirmed', 55.0, 'USDT',
  'gastos', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), 'Vida general'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency,
   description, account_id, account_name, category_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2025-09-26', 'expense', 'confirmed', 20.0, 'USD',
  'chat gitipi', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'cash' AND currency = 'USD' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'cash' AND currency = 'USD' LIMIT 1), 'Vida general'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency,
   description, account_id, account_name, category_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2025-10-17', 'expense', 'confirmed', 30.0, 'USDT',
  'libros', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), 'Vida general'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency,
   description, account_id, account_name, category_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2025-11-05', 'expense', 'confirmed', 20.0, 'USD',
  'chat gitipi', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'savings' AND currency = 'USD' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'savings' AND currency = 'USD' LIMIT 1), 'Vida general'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency,
   description, account_id, account_name, category_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2025-11-11', 'expense', 'confirmed', 20.0, 'USD',
  'claude', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'savings' AND currency = 'USD' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'savings' AND currency = 'USD' LIMIT 1), 'Vida general'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency,
   description, account_id, account_name, category_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2025-12-11', 'expense', 'confirmed', 150.0, 'USDT',
  'rosalia', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), 'Vida general'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency,
   description, account_id, account_name, category_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2025-12-11', 'expense', 'confirmed', 40.0, 'USD',
  'chat y claude', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'savings' AND currency = 'USD' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'savings' AND currency = 'USD' LIMIT 1), 'Vida general'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency,
   description, account_id, account_name, category_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2025-12-18', 'expense', 'confirmed', 60.0, 'USDT',
  'tan bionica', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), 'Vida general'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency,
   description, account_id, account_name, category_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2026-01-12', 'expense', 'confirmed', 31.0, 'USDT',
  'claude', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'savings' AND currency = 'USD' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'savings' AND currency = 'USD' LIMIT 1), 'Vida general'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency,
   description, account_id, account_name, category_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2026-02-12', 'expense', 'confirmed', 20.0, 'USD',
  'claude', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'savings' AND currency = 'USD' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'savings' AND currency = 'USD' LIMIT 1), 'Vida general'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency,
   description, account_id, account_name, category_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2026-02-12', 'expense', 'confirmed', 76.0, 'USDT',
  'babasonicos y c25', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), 'Vida general'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency,
   description, account_id, account_name, category_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2026-02-21', 'expense', 'confirmed', 115.0, 'USDT',
  'tarjetita amigues c25', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), 'Vida general'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency,
   description, account_id, account_name, category_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2026-03-12', 'expense', 'confirmed', 25.0, 'USD',
  'claude', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'savings' AND currency = 'USD' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'savings' AND currency = 'USD' LIMIT 1), 'Vida general'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency,
   description, account_id, account_name, category_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2026-04-12', 'expense', 'confirmed', 20.0, 'USD',
  'claude', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'savings' AND currency = 'USD' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'savings' AND currency = 'USD' LIMIT 1), 'Vida general'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency,
   description, account_id, account_name, category_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2026-04-24', 'expense', 'confirmed', 80000.0, 'ARS',
  'cena', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Mercado Pago' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Mercado Pago' LIMIT 1), 'Vida general'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency,
   description, account_id, account_name, category_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2026-04-24', 'expense', 'confirmed', 112000.0, 'ARS',
  'libro', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Mercado Pago' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Mercado Pago' LIMIT 1), 'Vida general'
);

-- ================================================================
-- 6. TRANSFERENCIAS Y CAMBIOS
--    to_amount / to_currency solo cuando hay cambio de moneda o monto distinto
-- ================================================================

INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2021-03-01', 'transfer', 'confirmed',
  155.54, 'USD', NULL, NULL,
  NULL, 'Freelancer', NULL, 'Paypal'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2021-03-23', 'transfer', 'confirmed',
  72.0, 'USD', NULL, NULL,
  NULL, 'Fiverr', NULL, 'Paypal'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2021-04-13', 'transfer', 'confirmed',
  160.0, 'USD', NULL, NULL,
  NULL, 'Fiverr', NULL, 'Paypal'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2021-04-21', 'transfer', 'confirmed',
  165.6, 'USD', NULL, NULL,
  NULL, 'Fiverr', NULL, 'Paypal'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2021-04-28', 'transfer', 'confirmed',
  120.0, 'USD', NULL, NULL,
  NULL, 'Fiverr', NULL, 'Paypal'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2021-05-18', 'transfer', 'confirmed',
  128.0, 'USD', NULL, NULL,
  NULL, 'Fiverr', NULL, 'Paypal'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2021-05-28', 'transfer', 'confirmed',
  200.0, 'USD', NULL, NULL,
  NULL, 'Fiverr', NULL, 'Paypal'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2021-06-16', 'transfer', 'confirmed',
  100.0, 'USD', 13251.4, 'ARS',
  NULL, 'Paypal', NULL, 'saldo.com.ar'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2021-06-17', 'transfer', 'confirmed',
  13251.4, 'ARS', NULL, NULL,
  NULL, 'saldo.com.ar', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1)
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2021-06-18', 'transfer', 'confirmed',
  150.0, 'USD', 20706.67, 'ARS',
  NULL, 'Paypal', NULL, 'saldo.com.ar'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2021-06-18', 'transfer', 'confirmed',
  20706.67, 'ARS', NULL, NULL,
  NULL, 'saldo.com.ar', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1)
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2021-06-18', 'transfer', 'confirmed',
  32400.0, 'ARS', 200.0, 'USD',
  (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'cash' AND currency = 'USD' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'cash' AND currency = 'USD' LIMIT 1)
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2021-06-22', 'transfer', 'confirmed',
  125.0, 'USD', 16977.72, 'ARS',
  NULL, 'Paypal', NULL, 'saldo.com.ar'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2021-06-22', 'transfer', 'confirmed',
  52.0, 'USD', NULL, NULL,
  NULL, 'Fiverr', NULL, 'Paypal'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2021-06-23', 'transfer', 'confirmed',
  16977.72, 'ARS', NULL, NULL,
  NULL, 'saldo.com.ar', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1)
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2021-06-25', 'transfer', 'confirmed',
  16400.0, 'ARS', 100.0, 'USD',
  (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'cash' AND currency = 'USD' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'cash' AND currency = 'USD' LIMIT 1)
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2021-06-25', 'transfer', 'confirmed',
  125.0, 'USD', 17143.4, 'ARS',
  NULL, 'Paypal', NULL, 'saldo.com.ar'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2021-06-27', 'transfer', 'confirmed',
  17143.4, 'ARS', 17143.49, NULL,
  NULL, 'saldo.com.ar', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1)
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2021-06-28', 'transfer', 'confirmed',
  17700.0, 'ARS', 100.0, 'USD',
  (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'cash' AND currency = 'USD' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'cash' AND currency = 'USD' LIMIT 1)
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2021-06-28', 'transfer', 'confirmed',
  125.0, 'USD', 17830.54, 'ARS',
  NULL, 'Paypal', NULL, 'saldo.com.ar'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2021-06-30', 'transfer', 'confirmed',
  17830.54, 'ARS', NULL, NULL,
  NULL, 'saldo.com.ar', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1)
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2021-06-30', 'transfer', 'confirmed',
  125.0, 'USD', 17501.12, 'ARS',
  NULL, 'Paypal', NULL, 'saldo.com.ar'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2021-07-01', 'transfer', 'confirmed',
  17501.12, 'ARS', NULL, NULL,
  NULL, 'saldo.com.ar', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1)
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2021-07-02', 'transfer', 'confirmed',
  34600.0, 'ARS', 200.0, 'USD',
  (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'cash' AND currency = 'USD' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'cash' AND currency = 'USD' LIMIT 1)
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2021-07-05', 'transfer', 'confirmed',
  241.15, 'USD', 33404.06, 'ARS',
  NULL, 'Paypal', NULL, 'saldo.com.ar'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2021-07-06', 'transfer', 'confirmed',
  33404.06, 'ARS', NULL, NULL,
  NULL, 'saldo.com.ar', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1)
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2021-07-06', 'transfer', 'confirmed',
  34600.0, 'ARS', 200.0, 'USD',
  (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'cash' AND currency = 'USD' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'cash' AND currency = 'USD' LIMIT 1)
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2021-08-03', 'transfer', 'confirmed',
  160.0, 'USD', NULL, NULL,
  NULL, 'Fiverr', NULL, 'Paypal'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2021-08-11', 'transfer', 'confirmed',
  45.0, 'USD', 6401.97, 'ARS',
  NULL, 'Paypal', NULL, 'saldo.com.ar'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2021-08-12', 'transfer', 'confirmed',
  6401.97, 'ARS', NULL, NULL,
  NULL, 'saldo.com.ar', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1)
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2021-07-30', 'transfer', 'confirmed',
  0.8, 'ARS', NULL, NULL,
  (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Reserva Mercado Pago' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Reserva Mercado Pago' LIMIT 1), (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1)
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2021-08-13', 'transfer', 'confirmed',
  16.0, 'USD', NULL, NULL,
  NULL, 'Fiverr', NULL, 'Paypal'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2021-09-04', 'transfer', 'confirmed',
  200.0, 'USD', NULL, NULL,
  NULL, 'Fiverr', NULL, 'Paypal'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2021-09-18', 'transfer', 'confirmed',
  60.0, 'USD', NULL, NULL,
  NULL, 'Fiverr', NULL, 'Paypal'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2021-10-04', 'transfer', 'confirmed',
  22014.21, 'ARS', NULL, NULL,
  NULL, 'Western Union', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1)
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2021-10-04', 'transfer', 'confirmed',
  91.0, 'USD', 13047.93, 'ARS',
  NULL, 'Paypal', NULL, 'saldo.com.ar'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2021-10-04', 'transfer', 'confirmed',
  13047.93, 'ARS', NULL, NULL,
  NULL, 'saldo.com.ar', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1)
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2021-10-05', 'transfer', 'confirmed',
  64.0, 'USD', NULL, NULL,
  NULL, 'Fiverr', NULL, 'Paypal'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2021-10-08', 'transfer', 'confirmed',
  80.0, 'USD', NULL, NULL,
  NULL, 'Fiverr', NULL, 'Paypal'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2021-10-12', 'transfer', 'confirmed',
  21986.87, 'ARS', NULL, NULL,
  NULL, 'Western Union', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1)
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2021-10-25', 'transfer', 'confirmed',
  40.0, 'USD', 6121.32, 'ARS',
  NULL, 'Paypal', NULL, 'saldo.com.ar'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2021-10-26', 'transfer', 'confirmed',
  6121.32, 'ARS', NULL, NULL,
  NULL, 'saldo.com.ar', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1)
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2021-10-26', 'transfer', 'confirmed',
  19600.0, 'ARS', 100.0, 'USD',
  (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'cash' AND currency = 'USD' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'cash' AND currency = 'USD' LIMIT 1)
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2021-10-31', 'transfer', 'confirmed',
  152.0, 'USD', NULL, NULL,
  NULL, 'Fiverr', NULL, 'Paypal'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2021-11-04', 'transfer', 'confirmed',
  27.84, 'ARS', NULL, NULL,
  NULL, 'Jarras', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1)
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2021-12-21', 'transfer', 'confirmed',
  15.0, 'USD', 2258.86, 'ARS',
  NULL, 'Paypal', NULL, 'saldo.com.ar'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2021-12-22', 'transfer', 'confirmed',
  2258.86, 'ARS', NULL, NULL,
  NULL, 'saldo.com.ar', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1)
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', NULL, 'transfer', 'confirmed',
  350.0, 'ARS', NULL, NULL,
  (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'cash' AND currency = 'ARS' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'cash' AND currency = 'ARS' LIMIT 1)
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2022-01-15', 'transfer', 'confirmed',
  120.0, 'USD', NULL, NULL,
  NULL, 'Fiverr', NULL, 'Paypal'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2022-01-27', 'transfer', 'confirmed',
  18.48, 'USD', 17.65, NULL,
  NULL, 'Paypal', NULL, 'Payoneer'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2022-02-02', 'transfer', 'confirmed',
  15.0, 'USD', 14.7, NULL,
  NULL, 'Payoneer', NULL, 'Lucas Genzelis'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2022-02-02', 'transfer', 'confirmed',
  150.0, 'USD', 143.3, NULL,
  NULL, 'Paypal', NULL, 'Payoneer'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2022-02-04', 'transfer', 'confirmed',
  645.0, 'USD', 616.19, NULL,
  NULL, 'Paypal', NULL, 'Payoneer'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2022-02-06', 'transfer', 'confirmed',
  200.0, 'ARS', NULL, NULL,
  (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Mercado Pago' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Mercado Pago' LIMIT 1)
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2022-02-08', 'transfer', 'confirmed',
  53275.41, 'ARS', NULL, NULL,
  NULL, 'Western Union', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1)
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2022-02-08', 'transfer', 'confirmed',
  43600.0, 'ARS', 200.0, 'USD',
  (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'cash' AND currency = 'USD' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'cash' AND currency = 'USD' LIMIT 1)
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2022-02-08', 'transfer', 'confirmed',
  400.0, 'ARS', NULL, NULL,
  (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'cash' AND currency = 'ARS' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'cash' AND currency = 'ARS' LIMIT 1)
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2022-02-08', 'transfer', 'confirmed',
  721.38, 'USD', 706.95, NULL,
  NULL, 'Payoneer', NULL, 'Lucas Genzelis'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2022-02-14', 'transfer', 'confirmed',
  721.65, 'USD', 700.0, NULL,
  NULL, 'Lucas Genzelis', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'cash' AND currency = 'USD' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'cash' AND currency = 'USD' LIMIT 1)
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2022-02-15', 'transfer', 'confirmed',
  52784.79, 'ARS', NULL, NULL,
  NULL, 'Western Union', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1)
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2022-02-16', 'transfer', 'confirmed',
  53184.5, 'ARS', 250.0, 'USD',
  (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'cash' AND currency = 'USD' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'cash' AND currency = 'USD' LIMIT 1)
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2022-02-21', 'transfer', 'confirmed',
  4.0, 'USD', NULL, NULL,
  NULL, 'Fiverr', NULL, 'Paypal'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2022-02-21', 'transfer', 'confirmed',
  51280.73, 'ARS', NULL, NULL,
  NULL, 'Western Union', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1)
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2022-02-21', 'transfer', 'confirmed',
  100.0, 'ARS', NULL, NULL,
  (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'cash' AND currency = 'ARS' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'cash' AND currency = 'ARS' LIMIT 1), (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1)
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2022-02-21', 'transfer', 'confirmed',
  51360.0, 'ARS', 240.0, 'USD',
  (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'cash' AND currency = 'USD' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'cash' AND currency = 'USD' LIMIT 1)
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2022-02-25', 'transfer', 'confirmed',
  0.49, 'ARS', NULL, NULL,
  (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Reserva Mercado Pago' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Reserva Mercado Pago' LIMIT 1), (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1)
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2022-03-02', 'transfer', 'confirmed',
  124425.0, 'ARS', NULL, NULL,
  NULL, 'Western Union', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1)
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2022-03-02', 'transfer', 'confirmed',
  50521.69, 'ARS', NULL, NULL,
  NULL, 'Western Union', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1)
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2022-03-03', 'transfer', 'confirmed',
  138600.0, 'ARS', 660.0, 'USD',
  (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'cash' AND currency = 'USD' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'cash' AND currency = 'USD' LIMIT 1)
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2022-03-03', 'transfer', 'confirmed',
  400.0, 'ARS', NULL, NULL,
  (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'cash' AND currency = 'ARS' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'cash' AND currency = 'ARS' LIMIT 1)
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2022-03-10', 'transfer', 'confirmed',
  49297.39, 'ARS', NULL, NULL,
  NULL, 'Western Union', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1)
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2022-03-11', 'transfer', 'confirmed',
  51500.0, 'ARS', 250.0, 'USD',
  (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'cash' AND currency = 'USD' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'cash' AND currency = 'USD' LIMIT 1)
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2022-03-12', 'transfer', 'confirmed',
  16.0, 'USD', NULL, NULL,
  NULL, 'Fiverr', NULL, 'Paypal'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2022-03-19', 'transfer', 'confirmed',
  48360.79, 'ARS', NULL, NULL,
  NULL, 'Western Union', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1)
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2022-03-21', 'transfer', 'confirmed',
  41200.0, 'ARS', 200.0, 'USD',
  (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'cash' AND currency = 'USD' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'cash' AND currency = 'USD' LIMIT 1)
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2022-03-25', 'transfer', 'confirmed',
  59579.65, 'ARS', NULL, NULL,
  NULL, 'Western Union', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1)
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2022-03-25', 'transfer', 'confirmed',
  3.04, 'ARS', NULL, NULL,
  (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Reserva Mercado Pago' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Reserva Mercado Pago' LIMIT 1), (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1)
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2022-03-28', 'transfer', 'confirmed',
  60600.0, 'ARS', 297.0, 'USD',
  (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'cash' AND currency = 'USD' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'cash' AND currency = 'USD' LIMIT 1)
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2022-03-28', 'transfer', 'confirmed',
  600.0, 'ARS', 3.0, 'USD',
  (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'cash' AND currency = 'ARS' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'cash' AND currency = 'ARS' LIMIT 1), (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'cash' AND currency = 'USD' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'cash' AND currency = 'USD' LIMIT 1)
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2022-04-20', 'transfer', 'confirmed',
  75980.84, 'ARS', NULL, NULL,
  NULL, 'Western Union', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1)
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2022-04-21', 'transfer', 'confirmed',
  40400.0, 'ARS', 200.0, 'USD',
  (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'cash' AND currency = 'USD' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'cash' AND currency = 'USD' LIMIT 1)
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2022-04-21', 'transfer', 'confirmed',
  736.38, 'USD', 700.0, NULL,
  NULL, 'Payoneer', NULL, 'Lucas Genzelis'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2022-05-06', 'transfer', 'confirmed',
  700.0, 'USD', NULL, NULL,
  NULL, 'Lucas Genzelis', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'cash' AND currency = 'USD' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'cash' AND currency = 'USD' LIMIT 1)
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2022-06-17', 'transfer', 'confirmed',
  4.0, 'USD', NULL, NULL,
  NULL, 'Fiverr', NULL, 'Paypal'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', NULL, 'transfer', 'confirmed',
  2.09, 'ARS', NULL, NULL,
  (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Reserva Mercado Pago' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Reserva Mercado Pago' LIMIT 1), (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1)
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2022-08-01', 'transfer', 'confirmed',
  58200.0, 'ARS', 200.0, 'USD',
  (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'cash' AND currency = 'USD' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'cash' AND currency = 'USD' LIMIT 1)
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2022-08-01', 'transfer', 'confirmed',
  5.98, 'ARS', NULL, NULL,
  (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Reserva Mercado Pago' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Reserva Mercado Pago' LIMIT 1), (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1)
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2022-08-11', 'transfer', 'confirmed',
  100941.21, 'ARS', NULL, NULL,
  NULL, 'Western Union', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1)
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2022-08-17', 'transfer', 'confirmed',
  62862.27, 'ARS', NULL, NULL,
  NULL, 'Western Union', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1)
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2022-08-01', 'transfer', 'confirmed',
  114000.0, 'ARS', NULL, NULL,
  (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Mercado Pago' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Mercado Pago' LIMIT 1)
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2022-08-25', 'transfer', 'confirmed',
  66086.97, 'ARS', NULL, NULL,
  NULL, 'Western Union', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1)
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2022-08-25', 'transfer', 'confirmed',
  67000.0, 'ARS', NULL, NULL,
  (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Mercado Pago' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Mercado Pago' LIMIT 1)
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2022-09-01', 'transfer', 'confirmed',
  65188.7, 'ARS', NULL, NULL,
  NULL, 'Western Union', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1)
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2022-09-01', 'transfer', 'confirmed',
  65000.0, 'ARS', NULL, NULL,
  (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Mercado Pago' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Mercado Pago' LIMIT 1)
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2022-09-12', 'transfer', 'confirmed',
  45235.8, 'ARS', NULL, NULL,
  NULL, 'Western Union', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1)
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2022-09-13', 'transfer', 'confirmed',
  45000.0, 'ARS', NULL, NULL,
  (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Mercado Pago' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Mercado Pago' LIMIT 1)
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2022-09-13', 'transfer', 'confirmed',
  176800.0, 'ARS', 650.0, 'USD',
  (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Mercado Pago' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Mercado Pago' LIMIT 1), (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'cash' AND currency = 'USD' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'cash' AND currency = 'USD' LIMIT 1)
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2022-09-15', 'transfer', 'confirmed',
  84.0, 'USD', NULL, NULL,
  NULL, 'Fiverr', NULL, 'Paypal'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2022-12-09', 'transfer', 'confirmed',
  94800.0, 'ARS', NULL, NULL,
  (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Mercado Pago' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Mercado Pago' LIMIT 1)
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2022-12-15', 'transfer', 'confirmed',
  96000.0, 'ARS', 300.0, 'USD',
  (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Mercado Pago' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Mercado Pago' LIMIT 1), (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'cash' AND currency = 'USD' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'cash' AND currency = 'USD' LIMIT 1)
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2022-12-30', 'transfer', 'confirmed',
  20.0, 'USDT', 6741.0, 'ARS',
  (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Mercado Pago' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Mercado Pago' LIMIT 1)
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2023-01-04', 'transfer', 'confirmed',
  500.0, 'USDT', 166500.0, 'ARS',
  (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Mercado Pago' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Mercado Pago' LIMIT 1)
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2023-01-04', 'transfer', 'confirmed',
  176000.0, 'ARS', 500.0, 'USD',
  (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Mercado Pago' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Mercado Pago' LIMIT 1), (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'cash' AND currency = 'USD' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'cash' AND currency = 'USD' LIMIT 1)
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2023-01-04', 'transfer', 'confirmed',
  20.0, 'USD', NULL, NULL,
  NULL, 'Fiverr', NULL, 'Paypal'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2023-01-11', 'transfer', 'confirmed',
  54000.0, 'ARS', 150.0, 'USD',
  (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'cash' AND currency = 'USD' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'cash' AND currency = 'USD' LIMIT 1)
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2023-01-11', 'transfer', 'confirmed',
  13450.0, 'ARS', NULL, NULL,
  (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Mercado Pago' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Mercado Pago' LIMIT 1)
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2023-01-27', 'transfer', 'confirmed',
  240.0, 'USD', NULL, NULL,
  NULL, 'Fiverr', NULL, 'Paypal'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2023-01-31', 'transfer', 'confirmed',
  62900.0, 'USD', 172.0, NULL,
  (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'savings' AND currency = 'USD' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'savings' AND currency = 'USD' LIMIT 1), (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1)
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2023-02-15', 'transfer', 'confirmed',
  200.0, 'USD', NULL, NULL,
  NULL, 'Fiverr', NULL, 'Paypal'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2023-02-15', 'transfer', 'confirmed',
  565.72, 'USD', 540.46, NULL,
  NULL, 'Paypal', NULL, 'Payoneer'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2023-02-16', 'transfer', 'confirmed',
  25.0, 'USDT', 9077.0, 'ARS',
  (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Mercado Pago' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Mercado Pago' LIMIT 1)
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2023-03-02', 'transfer', 'confirmed',
  11.14, 'USDT', 4059.97, 'ARS',
  (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Mercado Pago' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Mercado Pago' LIMIT 1)
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2023-03-30', 'transfer', 'confirmed',
  298.48, 'USDT', 307.48, 'USD',
  (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), NULL, 'Payoneer'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2023-03-30', 'transfer', 'confirmed',
  1021.42, 'USD', 1000.99, NULL,
  NULL, 'Payoneer', NULL, 'Lucas Genzelis'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2023-03-30', 'transfer', 'confirmed',
  2486.36, 'USD', 2436.51, NULL,
  NULL, 'Payoneer', NULL, 'Lucas Genzelis'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2023-04-05', 'transfer', 'confirmed',
  3437.5, 'USD', 3300.0, NULL,
  NULL, 'Lucas Genzelis', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'cash' AND currency = 'USD' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'cash' AND currency = 'USD' LIMIT 1)
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2023-04-05', 'transfer', 'confirmed',
  50.45, 'USDT', 19595.28, 'ARS',
  (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Mercado Pago' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Mercado Pago' LIMIT 1)
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2023-04-05', 'transfer', 'confirmed',
  19625.0, 'ARS', 50.0, 'USD',
  (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Mercado Pago' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Mercado Pago' LIMIT 1), (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'cash' AND currency = 'USD' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'cash' AND currency = 'USD' LIMIT 1)
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2023-06-29', 'transfer', 'confirmed',
  22.0, 'USDT', 10915.52, 'ARS',
  (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Mercado Pago' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Mercado Pago' LIMIT 1)
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2023-07-05', 'transfer', 'confirmed',
  16.0, 'USDT', 7906.72, 'ARS',
  (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Mercado Pago' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Mercado Pago' LIMIT 1)
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2023-07-09', 'transfer', 'confirmed',
  60.0, 'USD', 57.0, NULL,
  NULL, 'Fiverr', NULL, 'Payoneer'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2023-07-20', 'transfer', 'confirmed',
  8400.0, 'ARS', 16.14, 'USDT',
  (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Mercado Pago' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Mercado Pago' LIMIT 1), (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1)
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2023-07-24', 'transfer', 'confirmed',
  42.5, 'USDT', NULL, NULL,
  (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), NULL, 'parte mili jairo'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2023-12-07', 'transfer', 'confirmed',
  200.0, 'USD', 197.0, NULL,
  NULL, 'Fiverr', NULL, 'Payoneer'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2023-12-11', 'transfer', 'confirmed',
  404.0, 'USD', 378.82, 'USDT',
  NULL, 'Payoneer', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1)
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2024-01-07', 'transfer', 'confirmed',
  300.0, 'USDT', 300.0, 'USD',
  (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'cash' AND currency = 'USD' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'cash' AND currency = 'USD' LIMIT 1)
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2024-02-28', 'transfer', 'confirmed',
  100.0, 'USD', 96.0, 'USDT',
  (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'cash' AND currency = 'USD' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'cash' AND currency = 'USD' LIMIT 1), (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1)
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2024-03-10', 'transfer', 'confirmed',
  113.6, 'USD', NULL, NULL,
  NULL, 'Fiverr', NULL, 'Paypal'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2024-03-18', 'transfer', 'confirmed',
  292.0, 'USD', 289.0, NULL,
  NULL, 'Fiverr', NULL, 'Payoneer'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2024-03-18', 'transfer', 'confirmed',
  113.6, 'USD', 99.16, 'USDT',
  NULL, 'Paypal', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1)
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2024-03-18', 'transfer', 'confirmed',
  259.04, 'USD', 241.28, 'USDT',
  NULL, 'Payoneer', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1)
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2024-05-20', 'transfer', 'confirmed',
  440.472, 'USD', 422.9, 'USDT',
  NULL, 'Fiverr', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1)
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2024-08-14', 'transfer', 'confirmed',
  640.0, 'USD', 609.56, 'USDT',
  NULL, 'Fiverr', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1)
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2024-08-15', 'transfer', 'confirmed',
  704.8599999999999, 'USDT', 700.0, 'USD',
  (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'cash' AND currency = 'USD' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'cash' AND currency = 'USD' LIMIT 1)
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2024-09-11', 'transfer', 'confirmed',
  900.0, 'USDT', 900.0, 'USD',
  (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'cash' AND currency = 'USD' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'cash' AND currency = 'USD' LIMIT 1)
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2024-10-10', 'transfer', 'confirmed',
  1272.0, 'USD', 1269.0, NULL,
  NULL, 'Fiverr', NULL, 'Payoneer'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2024-10-16', 'transfer', 'confirmed',
  1269.0, 'USD', 1212.13, 'USDT',
  NULL, 'Payoneer', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1)
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2025-02-13', 'transfer', 'confirmed',
  85.0, 'USD', 85.0, 'USDT',
  (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), NULL, 'Paypal'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2025-04-09', 'transfer', 'confirmed',
  240.0, 'USD', NULL, NULL,
  NULL, 'Fiverr', NULL, 'Paypal'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2025-04-10', 'transfer', 'confirmed',
  94.18, 'USD', NULL, NULL,
  NULL, 'Paypal', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'savings' AND currency = 'USD' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'savings' AND currency = 'USD' LIMIT 1)
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2025-05-26', 'transfer', 'confirmed',
  13.04, 'USDT', 11.31, 'EUR',
  (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), NULL, 'Santander'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2025-05-26', 'transfer', 'confirmed',
  149.25, 'USDT', 130.0, 'EUR',
  (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), NULL, 'Santander'
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2025-05-30', 'transfer', 'confirmed',
  253.42, 'USDT', 254.0, 'USD',
  (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'savings' AND currency = 'USD' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'savings' AND currency = 'USD' LIMIT 1)
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2025-05-30', 'transfer', 'confirmed',
  500.0, 'USDT', 500.0, 'USD',
  (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Binance' LIMIT 1), (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'cash' AND currency = 'USD' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'cash' AND currency = 'USD' LIMIT 1)
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2025-05-30', 'transfer', 'confirmed',
  18.0, 'EUR', 26.0, 'USD',
  NULL, 'Santander', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'savings' AND currency = 'USD' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'savings' AND currency = 'USD' LIMIT 1)
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2025-07-08', 'transfer', 'confirmed',
  313.48, 'USD', 315.0, NULL,
  (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'savings' AND currency = 'USD' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'savings' AND currency = 'USD' LIMIT 1), (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'cash' AND currency = 'USD' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'cash' AND currency = 'USD' LIMIT 1)
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2025-07-08', 'transfer', 'confirmed',
  5.0, 'USD', NULL, NULL,
  NULL, 'Paypal', (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'cash' AND currency = 'USD' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'cash' AND currency = 'USD' LIMIT 1)
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2025-09-15', 'transfer', 'confirmed',
  5000.0, 'USD', NULL, NULL,
  (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'cash' AND currency = 'USD' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'cash' AND currency = 'USD' LIMIT 1), (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'savings' AND currency = 'USD' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'savings' AND currency = 'USD' LIMIT 1)
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2026-02-02', 'transfer', 'confirmed',
  7285.0, 'USD', NULL, NULL,
  (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'cash' AND currency = 'USD' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'cash' AND currency = 'USD' LIMIT 1), (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'savings' AND currency = 'USD' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'savings' AND currency = 'USD' LIMIT 1)
);
INSERT INTO transactions
  (user_id, date, type, status, amount, currency, to_amount, to_currency,
   account_id, account_name, to_account_id, to_account_name)
VALUES (
  '402ad72e-fbb4-4316-aa69-669dd4296bda', '2026-05-10', 'transfer', 'confirmed',
  100000.0, 'ARS', NULL, NULL,
  (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND type = 'checking' AND currency = 'ARS' AND name ILIKE 'Banco Macro%' LIMIT 1), (SELECT id   FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Mercado Pago' LIMIT 1), (SELECT name FROM accounts WHERE user_id = '402ad72e-fbb4-4316-aa69-669dd4296bda' AND name = 'Mercado Pago' LIMIT 1)
);

