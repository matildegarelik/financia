# Análisis: estadísticas históricas con tasas de cambio cambiantes

## El problema

El sistema guarda transacciones con monto original en su moneda (`amount` + `currency`).
Las tasas de cambio son **una sola fila por par** (tabla `exchange_rates`) que se sobreescribe con la tasa actual.

Cuando se calculan analytics, **todas las transacciones históricas se convierten con la tasa de hoy**.
Eso hace que 1200 ARS de 2014 (≈ USD 200 en ese momento) aparezcan como si valieran lo mismo que 1200 ARS de hoy (≈ USD 1.20).

## Estado actual del sistema

- `exchange_rates`: `from_currency`, `to_currency`, `rate`, `updated_at` (texto), `created_at`
- Sin historial: al actualizar una tasa, el valor anterior se pierde
- `transactions`: guarda `currency` original + `amount` sin convertir ✅
- Analytics convierte todo al `displayCurrency` con `convert()` → usa tasa actual ❌ para historia
- La API externa ya usada (`fawazahmed0`) **soporta fechas históricas**: `currency-api@2024-01-15/v1/...`

## Opciones analizadas

### Opción A: Snapshot de tasa en cada transacción
Agregar columna `rate_snapshot` (JSON o numeric) a `transactions` que guarde la tasa vigente al crear.

- ✅ Simple, sin tabla extra
- ✅ Correcto para transacciones futuras
- ❌ Transacciones pasadas quedan sin dato
- ❌ Requiere elegir moneda base fija (ej. USD)

### Opción B: Tabla histórica de tasas
Múltiples filas por par con fecha: `from`, `to`, `rate`, `date`. Analytics busca la tasa más cercana.

- ✅ Más correcto matemáticamente
- ✅ La API de fawazahmed0 permite poblar retroactivamente
- ❌ Requiere migración + UX para cargar datos históricos
- ❌ Más consultas en runtime

### Opción C: No convertir, mostrar por moneda original
En analytics históricos, agrupar por moneda (ARS, USD por separado) en vez de convertir todo.
Infraestructura `byCurrency()` ya existe en el código.

- ✅ Siempre 100% exacto
- ✅ Casi sin cambios de backend
- ❌ Más difícil de comparar en una sola vista

## Recomendación

Combinar según el caso de uso:

| Caso | Solución |
|------|----------|
| Patrimonio actual / proyecciones | Tasa de hoy ✅ (ya correcto) |
| Estadísticas históricas por moneda | **Opción C**: mostrar ARS y USD separados |
| "¿Cuánto valía en USD?" on-demand | **Opción B on-demand**: llamar a fawazahmed0 histórico solo cuando se pide |
| Transacciones nuevas | **Opción A**: guardar snapshot de tasa al crear |

La clave es **no mezclar monedas distintas al comparar períodos históricos largos**. La conversión solo tiene sentido como snapshot del presente.

## Deuda técnica identificada

- `exchange_rates.updated_at` es `text` en vez de `date` — debería ser `date`
- No hay índice en `(from_currency, to_currency)` en `exchange_rates`