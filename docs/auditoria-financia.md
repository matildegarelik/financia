# Auditoría Financia — hallazgos y propuesta de diseño (2026-10-23, última actualización 2026-10-25)

Relevamiento completo de: multi-divisa, presupuestos, proyecciones, transferencias, tarjetas de crédito, balances, y el caso de préstamos/pagos a terceros. Incluye diseño de las features nuevas pedidas (Terceros/Deudas, Suscripciones, Wishlist) y rediseños de UI (Categorías, Tarjetas de crédito).

Ver también `docs/multidivisas-analisis.md` (análisis previo sobre tasas históricas, sigue sin implementarse).

---

## Resumen ejecutivo

Lo que está **bien resuelto** (no tocar): cálculo de balance de cuentas (`computeAccountBalance`), deuda de tarjeta vs. total de resumen, modelo de transferencia como fila única.

Lo que está **roto de forma concreta** (bugs, no decisiones de diseño):
1. Presupuestos mezclan transacciones de distintas divisas sin convertir antes de sumar.
2. Tres fórmulas distintas y no equivalentes de "cuánto gastaste de este presupuesto" (Budgets, Projected, Dashboard) → números distintos para lo mismo.
3. Todo el sistema convierte divisas históricas con la tasa de **hoy**, no la de la fecha de la transacción — los reportes del pasado cambian solos cuando actualizás el dólar.
4. Transferencia entre cuentas de distinta divisa puede perder plata si el monto destino queda vacío (bug confirmado en el flujo de pago de tarjeta cross-currency).
5. Pago de resumen de tarjeta en una cuenta de otra divisa no convierte el monto (hoy la UI lo bloquea, pero el código de la mutación no lo valida).
6. La pantalla de Tarjetas usa un día de cierre/vencimiento default hardcodeado duplicado en dos archivos, ignorando lo configurado por la usuaria en algunos casos.

Lo que es una **carencia de modelado**, no un bug: no existe forma de registrar "le presté esto a alguien" o "pagué esto por otra persona" sin que quede un apaño manual (checkbox "no contar en ingresos/gastos" sin vínculo a la devolución). Se propone la entidad **Terceros/Deudas** (sección 5).

---

## Checklist de pendientes

_Se va actualizando a medida que avanzamos. Última actualización: 2026-10-23._

### Resueltos recientemente (2026-10-25)
- [x] **Bug de divisa al editar Inversiones/Cuentas/Presupuestos/Suscripciones/Proyectado.** Caso reportado: al editar una inversión de Binance en EUSDT, la divisa quedó guardada como ARS. Causa confirmada: el `<Select>` de moneda en esos 5 formularios estaba poblado **solo** con `activeCurrencies` (las monedas activas en Configuración, persistidas en `localStorage` — ver hallazgo 1.5). `Settings.jsx::removeCurrency` permite desactivar cualquier moneda sin chequear si algo la usa, y además `activeCurrencies` vive solo en el navegador: cambiar de dispositivo, limpiar el storage, o simplemente desactivarla en Configuración hace que esa divisa desaparezca de la lista de opciones, y al reabrir y guardar el registro se pierde silenciosamente. **Arreglado** en `Investments.jsx`, `Accounts.jsx`, `Budgets.jsx`, `Suscripciones.jsx` y `TransactionFormProjected.jsx`: cada formulario ahora incluye la divisa actual del registro en las opciones del `<Select>` aunque no esté en `activeCurrencies`, así nunca se pierde al editar y guardar.
- [x] **Dato ya corrompido a recuperar manualmente** (corregido a USDT en la base, 2026-10-28): la inversión de Binance específica que se reportó quedó guardada como ARS antes de este fix — hay que volver a agregar "EUSDT" como divisa custom en Configuración y re-seleccionarla en esa inversión (los montos numéricos no cambiaron, solo la etiqueta de moneda estaba mal). El código nuevo previene que vuelva a pasar, pero no puede adivinar retroactivamente cuál era la divisa correcta de un dato ya sobrescrito.
- [x] **Gráficos de Analytics poco útiles** — implementadas A, B, C y E (2026-10-28), ver sección 13.
- [x] **3.5 — Transferencias: ya no se elige modo ni se ingresa tasa a mano.** Ahora siempre se ingresa monto origen + monto destino, y la tasa efectiva y la diferencia contra la tasa de referencia se calculan solas (ver sección 3.5 actualizada).
- [x] **UI de Tarjetas de crédito rediseñada** (sección 8) — ver detalle ahí.
- [x] **Desplegable de categorías confuso en páginas nuevas (y duplicado en código en 3 formularios viejos).** `Suscripciones.jsx` mostraba las categorías en una lista plana sin jerarquía (al revés de Transacciones, que marca categoría padre vs. subcategoría con "↳"). Al revisar, encontré que la lógica de armar esa jerarquía estaba **copiada 3 veces** (`TransactionForm.jsx`, `TransactionFormProjected.jsx`, `Budgets.jsx`), cada copia ligeramente distinta. Se extrajo a `domain/categories.js::buildCategoryTree` (única fuente de verdad) y se usa en los 4 lugares, incluido el que faltaba en Suscripciones.
- [x] **Bug en `Projected.jsx` → vista "Resumen" → columna "Del año".** Para un año futuro, esa columna mostraba "—" (nada) porque solo sumaba transacciones proyectadas sueltas, nunca los presupuestos — mientras que la columna "Ahorro total" (al lado) sí incluye presupuestos (usa `computeMonth` acumulado mes a mes) y mostraba un número. Quedaba inconsistente: una columna vacía al lado de otra con datos, para el mismo año. **Arreglado:** "Del año" ahora usa el mismo cálculo mensual (`computeMonth`, que ya incluye presupuestos) sumado a lo largo de los 12 meses, igual que ya hacía "Ahorro total". Para años futuros se muestra en color neutro con "≈" (no verde/rojo, porque no es confirmado) — mismo criterio visual que ya usaba el año en curso.
- [x] **Nueva página Wishlist** (sección 12) — lista simple de cosas para comprar con precio y categoría de texto libre, sin relación con el resto de la app. **Falta aplicar la migración SQL manualmente** (ver 12.1).

### Resueltos (2026-10-28)
- [x] Crash al editar una inversión con divisa vacía/null (`Select.Item` con value `""`), introducido por el fix de divisas del 25/10. Corregido en los 5 formularios. La inversión de Binance se corrigió a USDT en la base.
- [x] Sección 11 — override padre/subcategoría en presupuestos, bloqueo de duplicados, "Copiar del mes anterior" sin duplicar.

### Bugs y limpieza (sección de "empecemos por los bugs")
- [x] 2.1 — Presupuestos mezclaban divisas sin convertir antes de sumar (`domain/budgets.js`)
- [x] 2.2 — Unificar criterio de "categoría cubierta por presupuesto" entre Presupuestos y Proyectado (rollup de subcategorías)
- [x] 2.4 — Código muerto `{false && (...)}` en `Budgets.jsx`
- [x] 4.2 — Función `transactionMatchesStatement` duplicada y no usada en `formatters.js`
- [x] Eliminado `BudgetOverview.jsx` (componente dashboard no importado por nadie)
- [x] 2.3 — `Projected.jsx` ahora muestra un badge "Ya cubierta por un presupuesto" en las proyecciones individuales cuya categoría ya tiene presupuesto ese mes (no se cuentan dos veces, pero antes no quedaba claro por qué)
- [x] 2.5 — Código muerto `{false && transferDifferences...}` en `Projected.jsx` (eliminado)
- [x] 3.1 — `TransactionForm.jsx` ahora bloquea el guardado de una transferencia cross-currency si el monto destino queda vacío o en 0 (antes dependía solo del atributo HTML `required`, que no impide un `0`)
- [x] 4.1 — `CreditCards.jsx::payStatementMut` ahora convierte el monto a la divisa de la cuenta de pago cuando difiere de la de la tarjeta, en vez de guardar el número crudo de la tarjeta. El botón de pago sigue bloqueado en la UI si las divisas no coinciden (habilitarlo del todo requiere además actualizar el chequeo de saldo suficiente, que hoy solo contempla same-currency — queda anotado como pendiente menor).
- [x] 4.3 — Confirmado que los dos defaults de día de cierre de tarjeta (`formatters.js` y `domain/creditCards.js`) eran matemáticamente idénticos; se dedupe: `domain/creditCards.js` ahora reutiliza las funciones de `formatters.js` en vez de reimplementarlas, así no pueden desincronizarse a futuro.
- [x] Analytics.jsx: eliminado el loop muerto `byCat` que calculaba un mapa y lo descartaba (la función ya usaba `getTopExpenseCategories` en su lugar).

### Features nuevas
- [x] Entidad Terceros/Deudas (sección 5) — reemplaza el checkbox suelto "no contar en ingresos/gastos". Migración SQL aplicada (2026-10-23), feature operativa.
- [x] Fix: borrar desde Transacciones la transacción original de un préstamo, o la de una devolución, dejaba huérfano el registro en `third_party_debts`/`debt_settlements`. Ahora `Transactions.jsx::deleteMut` borra también lo asociado.
- [x] Fix: el default de cuenta al "Registrar devolución" ahora resuelve a `default_payment_account_id` de la tarjeta cuando el préstamo/pago original se hizo con tarjeta de crédito, en vez de sugerir la tarjeta misma.
- [x] Suscripciones (sección 6) — menú nuevo, pausable. Migración SQL aplicada (2026-10-25), feature operativa.
- [x] Suscripciones pagadas a/para un tercero (sección 6.3) — reutiliza el mismo mecanismo de Terceros/Deudas, sin duplicar lógica (`domain/debts.js::buildDebtPayload` compartido entre alta manual y materialización automática).
- [x] Categorías rediseñadas como lista jerárquica en vez de grilla de tarjetas (sección 10).
- [x] Estadísticas: cumplimiento histórico de presupuesto en Analytics (sección 9) — `domain/budgets.js::getMonthlyBudgetCompliance`/`getCategoryOverBudgetFrequency`.

### Estructural (grande, no bloqueante para el uso diario)
- [ ] 1.1 / 1.2 — Tipo de cambio histórico por fecha (hoy todo se recalcula con la tasa actual)
- [ ] 3.5 — Rediseñar ganancia/pérdida de cambio en transferencias para que sea automática y consistente (depende de 1.1/1.2)

---

## 1. Multi-divisa y tipo de cambio

| # | Hallazgo | Dónde | Severidad |
|---|---|---|---|
| 1.1 | Todas las conversiones a la divisa de visualización usan la tasa **actual** (`exchangeRates`), nunca la vigente a la fecha de la transacción. Un gasto en USD de hace 6 meses cambia de valor en ARS cada vez que actualizás el dólar en Settings. Afecta Dashboard, Accounts, Analytics, Projected, Budgets — toda la capa de reporting. | `lib/formatters.js:convertCurrency`, `domain/reporting.js` | Crítico (estructural) |
| 1.2 | Solo existe **una tasa vigente por par** en la tabla `ExchangeRate` (se sobreescribe, no hay histórico por fecha). Es la causa raíz de 1.1: para resolverlo hay que guardar un snapshot de tasa en cada transacción al crearla, igual que ya hace `transferExchange.js` para transferencias (pero eso no se reutiliza para transacciones normales). | `Settings.jsx`, `ExchangeRate` table | Crítico |
| 1.3 | Si falta el tipo de cambio para un par (directo, inverso o vía ARS), `convertCurrency` devuelve el monto **sin convertir** en vez de avisar. Un monto en EUR se puede sumar como si fuera ARS/USD sin ningún aviso visual si falta configurar `EUR_ARS`. | `lib/formatters.js:51-63` | Medio |
| 1.4 | El puente vía ARS solo prueba `from→ARS` y `ARS→to` directos, no sus combinaciones inversas. Si solo existen `ARS_EUR` y `USD_ARS` (sin `EUR_ARS`/`ARS_USD`), no hay bridging posible → cae en el fallback silencioso de 1.3. | `lib/formatters.js:58-61` | Medio |
| 1.5 | `activeCurrencies`/`displayCurrency` viven solo en `localStorage`, no en el usuario en Supabase. Se pierden al cambiar de dispositivo o limpiar el storage. | `lib/currency-context.jsx` | Menor |
| 1.6 | Se puede agregar una divisa custom como activa sin forzar configurar su tipo de cambio, lo que dispara el fallback silencioso de 1.3. | `CurrencySelector.jsx` | Menor |

**Nota de diseño:** `transferExchange.js` ya captura un `exchange_rate` histórico por transacción para transferencias. El resto del sistema (transacciones normales) no lo hace — es una inconsistencia de arquitectura entre dos partes del mismo problema.

---

## 2. Presupuestos y proyecciones

| # | Hallazgo | Dónde | Severidad |
|---|---|---|---|
| 2.1 | ✅ **RESUELTO** — `getBudgetProgress` suma `tx.amount` crudo de todas las transacciones que matchean la categoría, **sin convertir cada una a la divisa del presupuesto antes de sumar**. Si una categoría tiene gastos en ARS y USD, el resultado es una suma sin sentido. `sumConvertedBudgetProgress` agravaba esto: convertía el total ya mezclado como si fuera 100% de una sola divisa. | `domain/budgets.js:52-67` | Crítico |
| 2.2 | ⚠️ **PARCIALMENTE RESUELTO** — había **dos** implementaciones independientes de "cuánto se gastó de este presupuesto" con reglas distintas (no tres: `BudgetOverview.jsx` nunca estaba importado en ningún lado, era código muerto que se eliminó, no un bug activo — corrección sobre la primera versión de este documento). | — | Crítico |

| Implementación | Convierte divisa | Rollup subcategorías | Fecha usada |
|---|---|---|---|
| `domain/budgets.js::getBudgetProgress` (usado por Budgets.jsx y Dashboard.jsx) | ✅ (ya arreglado en 2.1) | ✅ (padre cubre hijas) | `getReportingDate` (respeta cierre de tarjeta) |
| `Projected.jsx::computeMonth` | ✅ | ✅ (arreglado — ver abajo) | `getReportingDate` |

Consecuencia que había: un presupuesto en una categoría padre con subcategorías se veía bien en *Presupuestos* (rollup correcto) pero en *Proyectado* esos gastos de subcategoría se contaban además como "gasto suelto" → total proyectado inflado. Se corrigió haciendo que `computeMonth` use el mismo helper `getMatchingCategoryIds` de `domain/budgets.js` para decidir qué categorías ya están cubiertas por un presupuesto (antes solo comparaba `category_id` exacto).

**Pendiente dentro de 2.2:** `computeMonth` sigue siendo una función propia y grande en `Projected.jsx`, no una reutilización 1:1 de `domain/budgets.js` — comparte ahora el criterio de categorías (lo que causaba el bug real), pero no se reescribió para llamar literalmente a `getBudgetProgress`. Reescribirla por completo es más riesgoso (maneja desglose multi-divisa, vista anual, balance proyectado) y no está justificado solo para este bug — se deja así a menos que aparezca una futura inconsistencia concreta.

| 2.3 | ⬜ Pendiente — transacciones `projected` cuya categoría tuvo presupuesto el mes pasado pero no este mes quedan contadas como "one-off" sin aviso — responsabilidad manual del usuario, sin validación en UI. | `Projected.jsx:140-146` | Medio |
| 2.4 | ✅ **RESUELTO** — bloque de código muerto `{false && (...)}` que duplicaba ~35 líneas del bloque activo de "Gastos no planificados", eliminado. | `Budgets.jsx` | Limpieza |
| 2.5 | ✅ **RESUELTO** (nuevo, detectado al unificar 2.2) — había otro bloque de código muerto `{false && transferDifferences.length > 0 && (...)}` en `Projected.jsx` (vista mensual), duplicando el bloque activo de "Diferencias de transferencias" que está más abajo en la misma vista. Mismo patrón que 2.4, eliminado. | `Projected.jsx` | Limpieza |

---

## 3. Transferencias entre cuentas

| # | Hallazgo | Dónde | Severidad |
|---|---|---|---|
| 3.1 | **Plata puede desaparecer**: en una transferencia cross-currency en modo `amounts_neutral`, si el usuario no completa `to_amount`, se guarda `null`. `getTransferDestinationAmount` devuelve `0` en ese caso → la cuenta origen se debita completo, la cuenta destino no recibe nada. El formulario principal (`TransactionForm.jsx`) exige `to_amount` cuando detecta cross-currency, así que el camino normal está cubierto — pero cualquier inserción que no pase por ese formulario (ver 4.1) queda expuesta. | `lib/formatters.js:245-251`, `TransactionForm.jsx:105-128` | Alto (latente) |
| 3.2 | Tres modos de cálculo (`rate`, `amounts_neutral`, `legacy`) coexisten sin una fuente de verdad única; transferencias históricas no son comparables entre sí según qué modo estaba activo al crearlas. | `transferExchange.js` | Alto |
| 3.3 | No se valida consistencia entre `tx.to_currency` y la divisa actual de la cuenta destino si esta cambió después. | `formatters.js` | Medio |
| 3.4 | El selector de categoría en una transferencia muestra todas las categorías, pero nunca se usa (las transferencias están siempre excluidas de `isRegularExpense`/`isRegularIncome`) — dato muerto, confunde. | `TransactionForm.jsx:152` | Bajo/UX |

**Dato positivo:** el modelo es una única fila por transferencia (no dos filas vinculadas) — no hay riesgo de inconsistencia por edición/borrado parcial.

### 3.5 Cómo funciona hoy la "ganancia/pérdida de cambio" en transferencias (detalle)

Al crear una transferencia cross-currency, la usuaria elige a mano uno de dos modos (`TransactionForm.jsx:285-334`, `lib/transferExchange.js`):

- **`amounts_neutral`** (default, botón "Montos sin ganancia"): se tipea a mano el monto recibido en destino. Se guarda la tasa implícita (`to_amount/amount`) solo informativamente, pero `exchange_difference` queda **siempre en 0** — no importa si la tasa usada fue buena o mala, nunca se registra ganancia ni pérdida.
- **`rate`** (botón "Usar tasa"): se autocompleta una tasa sugerida desde la tabla de `ExchangeRate` de Configuración (la misma tasa única sin histórico del hallazgo 1.2, no una cotización en vivo), editable, que calcula `to_amount = amount × tasa`. El campo "Monto recibido" sigue siendo editable manualmente después y puede desincronizarse de la tasa mostrada. En este modo sí se calcula `exchange_difference = monto_recibido_real − (monto_enviado × tasa_de_referencia_de_settings)`.
- **`legacy`**: no seleccionable desde la UI, es solo el estado en que caen transferencias viejas sin este campo al editarlas — no recalcula nada, conserva lo que ya estaba guardado.

Esa `exchange_difference` **no es cosmética**: se usa activamente en `domain/reporting.js::sumIncomeExpense` (diferencia positiva → se suma a "ingresos"; negativa → se suma a "gastos" bajo la categoría "Diferencia de transferencia"), y se refleja en Analytics y en Proyectado.

**Por qué es inconsistente:**
- Es una elección manual por transferencia individual — la misma operación económica puede registrarse con o sin "ganancia" según qué botón se tocó ese día, dando resultados de reporte distintos para cosas iguales.
- La tasa "de referencia" es lo último guardado a mano en Configuración, no una cotización real a la fecha — si no se actualiza seguido, la "ganancia/pérdida" calculada refleja desactualización de Settings, no una diferencia de cambio real.
- Con "sin ganancia" se puede estar ocultando una pérdida real (cambiaste a peor tasa) sin que quede registro en ningún lado.
- No hay validación de que el monto recibido ingresado a mano sea razonable respecto a ninguna tasa.

**Causa raíz común con 1.1/1.2:** no existe un concepto sólido de "tasa de mercado vigente a la fecha X" en toda la app — esta feature de ganancia/pérdida se construyó sobre esa base débil, por eso quedaba a mitad de camino.

**✅ RESUELTO (2026-10-25):** se eliminó la elección manual de modo del formulario. Ahora el flujo es único: se ingresa monto origen y monto destino (como antes era "amounts_neutral"), y la tasa efectiva se muestra calculada en pantalla (solo informativa, no editable). Todas las transferencias cross-currency nuevas usan `transfer_calculation_mode: "rate"` por default, así que `exchange_difference` se calcula siempre contra la tasa de referencia de Configuración — ya no hay que elegir "con/sin ganancia", queda registrada automáticamente. Las transferencias viejas guardadas como `amounts_neutral` conservan su comportamiento al editarlas (no se recalculan retroactivamente, ya no hay botón para cambiarles el modo). Sigue pendiente lo de fondo: la "tasa de referencia" contra la que se compara sigue siendo la actual de Configuración, no una histórica a la fecha (1.1/1.2) — eso queda igual hasta resolver esa parte estructural.

---

## 4. Tarjetas de crédito y balances

| # | Hallazgo | Dónde | Severidad |
|---|---|---|---|
| 4.1 | **Pago de resumen en divisa distinta a la tarjeta no convierte el monto**: `payStatementMut` fija `amount: statement.total_amount` (número en divisa de la tarjeta) pero lo etiqueta `currency: paymentAccount.currency`, sin convertir. Ej.: deuda USD 1000, pago desde cuenta ARS → se descuentan 1000 "ARS" de la cuenta, no su equivalente real. La UI bloquea el botón si las divisas no coinciden, pero el código de la mutación no lo valida — es un bug latente si se habilita (lo cual hace falta si querés pagar tarjetas en otra divisa). Además, si este flujo generara un `to_amount` vacío, cae en el bug 3.1. | `CreditCards.jsx:112-130` | Alto |
| 4.2 | ✅ **RESUELTO** — había dos funciones `transactionMatchesStatement` con reglas distintas (una en `formatters.js`, no usada en ningún lado; la real en `domain/creditCards.js`). Se eliminó la versión muerta de `formatters.js`. | `domain/creditCards.js:63-76` (la que queda) | Medio (riesgo futuro) |
| 4.3 | La pantalla de Tarjetas usa un día de cierre "penúltimo jueves del mes" hardcodeado y **duplicado** en dos archivos (`lib/formatters.js` y `domain/creditCards.js`) como fallback cuando no hay `statement_close_day`/`statement_due_day` configurado — confirmar que ambos quedan siempre sincronizados si se edita uno. | `formatters.js:145-166`, `domain/creditCards.js:22-45` | Medio |
| 4.4 | `total_amount` persistido en `CreditCardStatement` es básicamente de solo escritura: siempre se recalcula en vivo (`getStatementTotal`) salvo en "deshacer pago", donde sí se lee el valor congelado al momento del pago (correcto, pero no documentado). | `domain/creditCards.js:78-109` | Info |
| 4.5 | **Cálculo de balance de cuentas está bien centralizado** — `computeAccountBalance`/`computeTotalSavings` son la única fuente de verdad, usados consistentemente en Dashboard, Accounts, BalanceCard, CreditCards. No hay fórmulas divergentes entre pantallas. | `domain/transactions.js` | OK — confirmado, no es el problema que se sospechaba |
| 4.6 | Deuda de tarjeta ("deuda actual", acumulada) y "total a pagar" del resumen (solo el período) son conceptos separados y correctamente distinguidos; un pago es un `transfer` que no toca `isRegularExpense`, evitando doble conteo entre "comprar con tarjeta" y "pagar el resumen". | `CreditCards.jsx`, `domain/creditCards.js` | OK |

---

## 5. Préstamos y pagos por terceros — diseño de la nueva entidad

### 5.1 Qué existe hoy y por qué no alcanza

Hoy existe un campo `reporting_mode` en `transactions`, con un checkbox **"No contar en ingresos/gastos"** en el formulario (`TransactionForm.jsx:356-368`, `TransactionFormProjected.jsx`) que setea `reporting_mode: "neutral"`. Cuando está activo, la transacción:
- **sí** impacta el saldo de la cuenta (`computeAccountBalance` filtra por `type`, no por `reporting_mode` — la plata salió o entró de verdad);
- **no** impacta presupuestos/proyectado/analytics (`isRegularExpense`/`isRegularIncome` exigen `reporting_mode === "normal"`).

Esto está bien pensado para el gasto del préstamo en sí, pero le faltan tres cosas:
- No vincula el préstamo con su devolución — son dos transacciones sueltas sin relación.
- No recuerda marcar la devolución también como "neutral" — si te olvidás, se cuenta como ingreso real e infla el mes.
- No hay ningún lugar que diga "Juan te debe $15.000" — no existe el concepto de saldo pendiente por persona.

**Decisión de diseño (a confirmar con vos antes de implementar):** reemplazar el checkbox genérico "no contar en ingresos/gastos" por un flujo explícito y guiado de **Terceros/Deudas**, que siga usando `reporting_mode: "neutral"` internamente (no se toca esa parte del motor, ya funciona) pero deje de exponerlo como checkbox libre — en vez de eso, la usuaria elige "Es un préstamo / pagué algo por alguien" y el sistema hace todo el resto (incluida la devolución) sin que haya que acordarse de nada.

El resto de usos de `reporting_mode` (`"investment"`, `"credit_card_payment"`) son flujos separados, ya resueltos, y **no se tocan**.

### 5.2 Modelo de datos (implementado)

**Tabla nueva `third_party_debts`** (`supabase/migrations/20261023_009_third_party_debts.sql`):
- `id`, `user_id`
- `person_name` (texto libre; la UI sugiere nombres ya usados vía `<datalist>`, sin tabla de personas separada — decisión tomada con la usuaria)
- `direction`: `"me_deben"` (prestaste plata, o pagaste algo por alguien) | `"debo"` (te prestaron, o pagaron algo por vos)
- `amount`, `currency` (monto original de la deuda)
- `origin_transaction_id` (la transacción que generó la deuda; sin FK formal porque `transactions` no tiene PK referenciable desde otra tabla en este esquema)
- `notes`, `created_at`

**Tabla nueva `debt_settlements`** (soporta devoluciones parciales):
- `id`, `user_id`, `debt_id` → FK a `third_party_debts` (ON DELETE CASCADE), `transaction_id`, `amount`, `currency`, `date`, `created_at`

**Nota de diseño vs. la propuesta original:** no se guarda un campo `status` en `third_party_debts` — se calcula siempre en el cliente (`domain/debts.js::getDebtStatus/getDebtPendingAmount`) comparando `amount` contra la suma de `debt_settlements`. Es el mismo criterio que ya usa el resto de la app para evitar una segunda fuente de verdad que se pueda desincronizar (igual que `CreditCardStatement.total_amount`, que también se recalcula en vivo).

### 5.3 Flujo de usuario (implementado)

1. Al crear una transacción de ingreso o gasto (`TransactionForm.jsx`, **solo en transacciones nuevas**, no al editar), checkbox **"Es un préstamo o pago a/de un tercero"** → aparece campo "¿Quién?" con autocompletado de personas ya usadas.
2. Al guardar: la transacción se crea igual que antes (`reporting_mode: "neutral"`), y además se crea el registro en `third_party_debts` con `origin_transaction_id` apuntando a ella. Dirección automática según `type` (`expense` → `me_deben`; `income` → `debo`).
3. Pantalla nueva **"Terceros"** (menú lateral, ícono de mano con moneda): tarjetas de "Te deben" / "Les debés" en total, y lista por persona con saldo neto; cada persona se expande para ver el detalle de cada deuda y su estado (pendiente/parcial/saldada).
4. Para liquidar: botón **"Registrar devolución"** sobre una deuda con saldo pendiente → diálogo con monto (prellenado al pendiente), cuenta y fecha → al confirmar, crea la transacción (`income` si `me_deben`, `expense` si `debo`, siempre `reporting_mode: "neutral"`) y el `debt_settlement` vinculado. El estado de la deuda se recalcula solo. Soporta devoluciones parciales (podés registrar varias devoluciones hasta saldarla). La cuenta por defecto en el diálogo es la cuenta desde donde "realmente salió" la plata del préstamo/pago original: si se pagó con tarjeta de crédito, no se sugiere la tarjeta misma, sino `default_payment_account_id` de esa tarjeta (la cuenta bancaria configurada para pagar su resumen) — mismo criterio que ya usa `CreditCards.jsx` para pagar resúmenes.

**Confirmado (pregunta de la usuaria):** un pago hecho por un tercero con tarjeta de crédito afecta el saldo correctamente (impacta la deuda de la tarjeta, igual que cualquier compra), pero al estar en `reporting_mode: "neutral"` queda excluido de presupuestos, proyectado y gastos por categoría en todos los reportes (`isRegularExpense`/`isRegularIncome` ya lo filtran en `domain/budgets.js`, `Projected.jsx` y `domain/reporting.js`) — tal como se esperaba, sin necesidad de ningún cambio adicional. Lo único que sí sigue impactando, correctamente, es el resumen de esa tarjeta (le seguís debiendo ese monto al banco, sección 5.4).

**Alcance deliberadamente dejado afuera por ahora:** `TransactionFormProjected.jsx` (proyecciones futuras) mantiene el checkbox simple "No contar en ingresos/gastos" sin el flujo de Terceros — una proyección es una hipótesis de algo que todavía no pasó, no tiene sentido crear una deuda real todavía. Si se confirma como transacción real más adelante, ahí sí se puede marcar como préstamo.

### 5.4 Impacto en cada parte del sistema (verificado contra el código actual)

| Área | Cómo impacta hoy una transacción `neutral` | Qué hay que hacer |
|---|---|---|
| **Saldo de cuentas** (`computeAccountBalance`, `domain/transactions.js:7-23`) | Filtra por `tx.type`, no por `reporting_mode` → el préstamo (expense) ya resta del saldo real, la devolución (income neutral) ya suma. Esto es correcto: la plata realmente salió/entró. | **Nada que cambiar.** No se toca esta función. |
| **Presupuestos** (`domain/budgets.js`, vía `isRegularExpense`/`isRegularIncome`) | Ya excluye `reporting_mode !== "normal"` → el préstamo y su devolución ya quedan afuera de presupuestos. | **Nada que cambiar** en la exclusión. Sí hay que arreglar el bug 2.1 (conversión de divisa) para que el resto de presupuestos sea confiable — pero no es específico de préstamos. |
| **Proyectado** (`Projected.jsx`) | Mismo mecanismo (`isRegularExpense`/`isRegularIncome`) → ya excluido. | **Nada que cambiar** por este feature. Sí conviene unificar `computeMonth` con `domain/budgets.js` (bug 2.2), en paralelo. |
| **Resumen de tarjeta de crédito** (`transactionMatchesStatement`, `domain/creditCards.js:63-76`) | **No** filtra por `reporting_mode`, solo por `type === "expense" && !is_credit_card_payment && status !== "projected"`. Si pagás algo por un tercero con la tarjeta, la compra sigue apareciendo en el resumen a pagar. | **Esto es correcto y no se toca**: le seguís debiendo ese monto al banco sin importar quién se beneficia del gasto. La deuda "con el banco" y la deuda "con la persona" son dos cosas distintas y ambas deben existir en paralelo. |
| **Analytics** | Usa `isRegularExpense`/`isRegularIncome` igual que presupuestos → ya excluido. | Nada que cambiar. |
| **Multi-divisa** | La deuda puede estar en una divisa distinta a la de display. | El saldo pendiente en la pantalla "Terceros" debe convertirse a la divisa de display igual que el resto de la app (una vez resuelto 1.1, con tasa histórica si corresponde a la fecha del préstamo). |

### 5.5 Limpieza (implementada)

- Se reemplazó el checkbox libre "No contar en ingresos/gastos" en `TransactionForm.jsx` por el flujo guiado de 5.3, **solo al crear una transacción nueva**. Si estás editando una transacción que ya era `neutral` (de antes de este cambio), se sigue mostrando el checkbox simple sin el campo de persona — no se le fuerza a inventar una deuda retroactiva para algo que ya existía.
- El campo `reporting_mode: "neutral"` sigue existiendo como valor interno (lo sigue leyendo todo el motor de reportes); deja de ser una opción expuesta como texto libre sin contexto en transacciones nuevas.
- **Decisión confirmada con la usuaria:** las transacciones `neutral` creadas antes de este cambio (préstamos viejos) se dejan como están, sin migración automática ni retroactiva.

### 5.6 Estado

- ✅ Migración `supabase/migrations/20261023_009_third_party_debts.sql` aplicada manualmente por la usuaria desde el SQL Editor de Supabase (2026-10-23). Tablas `third_party_debts` y `debt_settlements` ya existen en producción.
- Pantalla "Terceros" y el flujo guiado en el formulario de transacciones ya están operativos.

---

## 6. Suscripciones (implementado)

Mismo vocabulario de frecuencias que ya usaban las recurrencias (`weekly`/`biweekly`/`monthly`/`yearly`), pero como entidad propia sin cantidad total fija y con estado pausable:

- Tabla nueva `subscriptions` (`supabase/migrations/20261023_010_subscriptions.sql`): `name`, `amount`, `currency`, `category_id`, `account_id`, `frequency`, `next_charge_date`, `status` (`"active"` | `"paused"` | `"cancelled"`). Se agregó también `subscription_id` a `transactions` para poder rastrear qué transacción vino de qué suscripción.
- **Cómo se generan las transacciones:** la app no tiene backend con cron, así que la materialización pasa al entrar a la pantalla "Suscripciones" (`domain/subscriptions.js::getDueSubscriptions`/`buildDueOccurrences`): se revisan las suscripciones activas con `next_charge_date <= hoy`, se crea una transacción `expense`/`reporting_mode: "normal"` por cada período vencido (soporta "atraparse" si pasaron varios períodos sin abrir la app), y se avanza `next_charge_date` al próximo período futuro.
- **Pausar/reanudar:** pausar solo cambia `status`, no genera nada hasta que se reanuda. Al reanudar, `next_charge_date` salta directo al próximo período futuro (no cobra retroactivo el tiempo que estuvo pausada).
- Pantalla **"Suscripciones"** (menú lateral): total mensual equivalente de las activas (semanal/quincenal/anual normalizado a mensual para comparar), listado con monto, frecuencia, cuenta, categoría, próximo cobro, y botones pausar/reanudar, editar, eliminar.
- A diferencia de los préstamos de Terceros, estas transacciones son `reporting_mode: "normal"` — sí impactan presupuestos, proyectado y analytics, porque son gasto real propio.

### 6.1 Precio histórico y dónde se chequea (confirmado con la usuaria)

- **Cambios de precio no afectan lo histórico:** cada vez que se materializa un cobro, se crea una transacción nueva con una copia del monto vigente de la suscripción en ESE momento (`amount: sub.amount` al momento de crear la transacción). Si después editás el precio de la suscripción, solo los cobros futuros usan el precio nuevo — las transacciones ya creadas no se tocan, igual que cualquier otra transacción confirmada de la app.
- **Se chequea desde dos pantallas, sin duplicar lógica:** la detección y creación de cobros vencidos vive en un solo lugar, `src/hooks/useMaterializeDueSubscriptions.js`, y lo llaman tanto `Suscripciones.jsx` como `Dashboard.jsx`. Cualquier pantalla nueva que se quiera agregar a futuro (ej. Proyectado) solo necesita llamar a ese mismo hook — no hay que copiar la lógica de materialización.
- **Limitación conocida:** sigue sin haber cron en el backend, así que la materialización corre cuando se visita una de esas dos pantallas (no en tiempo real). Si no entrás a ninguna de las dos durante varios períodos, los cobros vencidos se generan todos juntos la próxima vez (con sus fechas correctas, no se pierde ningún cobro).

### 6.2 Estado

- ✅ Migración `supabase/migrations/20261023_010_subscriptions.sql` aplicada (2026-10-25). Tabla `subscriptions` y columna `subscription_id` en `transactions` ya existen.

### 6.3 Suscripciones pagadas a/para un tercero (implementado)

Caso planteado por la usuaria: una suscripción que en realidad paga ella pero le corresponde a otra persona (ej. paga un Netflix compartido y la otra persona le devuelve su parte cada período).

- Se agregó `debt_person_name` a `subscriptions` (`supabase/migrations/20261025_011_subscription_debt_person.sql`).
- Al crear/editar la suscripción, checkbox **"Es un pago a/para un tercero"** con el mismo campo de persona y autocompletado que usa Terceros (`getPersonSuggestions`). Si se marca, no se pide categoría (no es gasto propio categorizable).
- En la materialización (`useMaterializeDueSubscriptions.js`), si la suscripción tiene `debt_person_name`, cada cobro se crea con `reporting_mode: "neutral"` (no `"normal"`) y además se crea un `third_party_debts` por ese cobro, usando el mismo payload que ya usa el alta manual en Transacciones — se extrajo a `domain/debts.js::buildDebtPayload` para no duplicar esa lógica entre los dos lugares que crean deudas.
- Resultado: cada período genera su propia deuda independiente (no una deuda acumulada única) — tiene sentido porque cada cobro es un "préstamo" nuevo que la otra persona te devuelve por separado; se ven todas agrupadas bajo el nombre de esa persona en la pantalla "Terceros".
- La pantalla "Suscripciones" muestra una etiqueta "Para {persona}" en lugar de la categoría cuando aplica.

---

## 7. Otros hallazgos menores

- `Analytics.jsx:209-221`: cálculo de `byCat` que se llena en un loop pero nunca se usa (la función retorna `getTopExpenseCategories(...)` en su lugar) — código muerto, no afecta resultados.
- `transferExchange.js`: no valida que el monto destino ingresado manualmente tenga relación plausible con la tasa de mercado — se puede guardar cualquier número sin aviso.
- `ImportModal.jsx` (importación CSV): no valida `reporting_mode` ni evita duplicados al importar.

---

## 8. UI de Tarjetas de crédito (implementado)

Lo que encontré revisando `CreditCards.jsx`/`CreditCardPanel`/`StatementMonthRow` que explicaba por qué "se ve mal mobile y no es cómodo", y lo que se hizo con cada punto:

- ✅ Había un `<div>` vacío suelto (resto de una maqueta vieja) — eliminado.
- ✅ El texto "Cierre por defecto: penúltimo jueves..." estaba **hardcodeado siempre igual**, aunque la tarjeta tuviera configurado un día de cierre custom (`statement_close_day`/`statement_due_day`) — ahora muestra el día real configurado, o aclara "(default)" si no hay uno custom.
- ✅ La grilla superior repetía el nombre de la tarjeta dos veces (ya está en el título) — se sacó la celda duplicada.
- ✅ Cada "mes" apilaba 3-4 recuadros anidados (badge+mes, total, cuenta de pago, saldo, botón) siempre visibles — ahora cada mes es **una fila compacta colapsada por defecto** (mes + total + estado en una línea), y todo el detalle (fechas, cuenta de pago, saldo, acción de pago/deshacer, transacciones) vive en un panel único que se expande al tocar la fila.
- ✅ Botones de ícono de 32×32px, por debajo del tamaño táctil recomendado — la fila completa ahora es el área clickeable (min-height 44px) para expandir, y el botón de editar pasó a 36×36px dentro del panel expandido.
- ✅ El estado "Revisar moneda" no explicaba qué hacer — ahora, cuando aplica, muestra un mensaje explícito explicando que la tarjeta y la cuenta de pago están en divisas distintas y qué hacer al respecto.

## 9. Estadísticas — cumplimiento histórico de presupuesto (implementado)

`Analytics.jsx` tenía: Ingresos vs Gastos por período, Ahorro acumulado, Top categorías de gasto, Tarjeta vs otros medios, Top comercios — nada que respondiera "¿qué tan bien respeté los presupuestos que me puse?" a lo largo del tiempo (ese dato solo existía para el mes actual, en `Budgets.jsx`).

**Se agregó** una tarjeta nueva "Cumplimiento de presupuesto" (independiente del filtro de fecha general, porque es inherentemente mensual):
- Selector de ventana: últimos 6 o 12 meses.
- Por cada mes: total presupuestado (gasto) vs. total gastado real contra esos mismos presupuestos — reutiliza `domain/budgets.js::sumConvertedBudgetAmounts`/`sumConvertedBudgetProgress`/`getBudgetProgress` ya existentes, sin tocar el motor de cálculo (nuevas funciones `getMonthlyBudgetCompliance`/`getCategoryOverBudgetFrequency` en `domain/budgets.js` que solo iteran meses pasados).
- Gráfico combinado: barras (presupuestado vs. gastado) + línea de "% cumplimiento" en eje secundario.
- Promedio de cumplimiento del período elegido.
- Lista de "categorías que más seguido se excedieron" (cuántos de los meses con presupuesto configurado se gastó de más) — candidatas a resubir el presupuesto.
- Meses sin ningún presupuesto de gasto configurado simplemente no aportan al promedio ni aparecen en la lista de categorías (no se inventa un "0% cumplimiento" sin sentido).

**Limitación conocida:** la precisión de meses pasados en otra divisa depende de 1.1/1.2 (tasa histórica) — hoy convierte con la tasa de hoy, igual que el resto de la app.

## 10. Categorías — tabla jerárquica (implementado)

Se reemplazó la grilla de tarjetas sueltas (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`, una card por categoría padre) por **una sola lista/tabla** (un `Card` conteniendo filas `divide-y`), con las categorías padre arrastrables para reordenar (igual que antes) y sus subcategorías desplegables debajo, indentadas — mismo patrón visual que ya usan Terceros y Suscripciones. No cambió ninguna lógica de datos, solo la presentación. Revisalo en mobile y decime si el estilo de fila te convence o prefieras algo distinto (ej. una tabla HTML real con columnas fijas tipo planilla).

## 11. Presupuestos vs. Proyectado — por qué permite duplicados y cómo lo pensaría distinto

**El problema concreto:** hoy se puede crear más de un `Budget` para la misma categoría en el mismo mes, y también se puede crear un presupuesto para una subcategoría cuando el padre ya tiene uno ese mes (o viceversa). Como `getMatchingCategoryIds` hace que un presupuesto de categoría padre "cubra" automáticamente a sus hijas, si además creás un presupuesto aparte para esa hija, las transacciones de esa hija se cuentan **dos veces** al sumar el total general (`sumConvertedBudgetProgress` suma el progreso de CADA presupuesto, y ambos — el del padre y el del hijo — contarían las mismas transacciones). Nada en la UI avisa ni lo impide.

Esto es la causa de fondo de la sensación de que "hay cosas que no cuadran": el total de "gastado" en Presupuestos puede estar inflado por doble conteo sin que se note, y lo mismo se propaga a Proyectado porque usa el mismo criterio de categorías cubiertas.

**Cómo lo pensaría distinto — dos niveles de solución:**

- **Opción A (acotada, solo validación):** al crear/editar un presupuesto, bloquear por UI: (1) duplicado exacto — misma categoría + mismo mes; (2) elegir una categoría padre si alguna de sus hijas ya tiene presupuesto ese mes, o elegir una hija si el padre ya tiene uno. Simple de implementar, pero es rígido: te obliga a elegir "todo por el padre" o "todo desglosado por hijas", sin poder mezclar.
- **Opción B (la que recomendaría):** permitir la combinación, pero con semántica de **"override"**, como hacen la mayoría de las apps de presupuesto (YNAB, Firefly III): un presupuesto en la categoría padre cubre automáticamente a todas sus hijas **excepto las que tengan su propio presupuesto ese mes** — esas quedan excluidas del rollup del padre y se trackean aparte. Así podés presupuestar "Comida" en general, y el mes que quieras controlar más fino, agregar un presupuesto específico para "Comida > Delivery" sin romper nada ni duplicar conteo.
  - Requiere un cambio puntual (no grande) en `domain/budgets.js::getMatchingCategoryIds`: cuando el budget es de una categoría padre, excluir de la cobertura a las hijas que tengan su propio budget ese mes. Como `Projected.jsx` ya reutiliza esta misma función (gracias a la unificación de la sección 2.2), el arreglo se propaga solo a Proyectado sin tocarlo de nuevo — es la razón por la que vale la pena unificar antes de "parchar" cada pantalla por separado.
  - Se complementa con una validación más simple en la UI: solo bloquear el duplicado exacto (mismo category_id + mismo mes), que sí es un error sin ningún caso de uso válido.

**✅ IMPLEMENTADO (2026-10-28) — Opción B:**
- `domain/budgets.js::getMatchingCategoryIds` recibe los presupuestos del mes y excluye del padre las subcategorías con presupuesto propio. Se pasa vía la opción `budgets` en `getBudgetProgress`/`transactionMatchesBudget` (Budgets.jsx, Dashboard.jsx, `getMonthlyBudgetCompliance`, `getCategoryOverBudgetFrequency`). La etiqueta "incluye N subcategorías" también descuenta las que tienen presupuesto propio.
- Proyectado no necesitó cambios: usa la unión de categorías cubiertas, que no cambia con el override.
- Formulario de presupuesto: bloquea crear/editar a una categoría que ya tiene presupuesto ese mes (`findDuplicateBudget`).
- "Copiar del mes anterior" saltea categorías que ya tienen presupuesto en el mes destino (antes, tocarlo dos veces duplicaba todo).
- Duplicados que ya existan en la base de antes de este cambio no se borran solos: hay que eliminarlos a mano desde Presupuestos.

**Sobre la relación con Proyectado:** la usaste bien al intuir que debería ser "estimo, y después voy siguiendo mes a mes" — y así está pensado hoy (`computeMonth` mezcla presupuesto como base + proyecciones sueltas para lo no presupuestado, y compara contra lo real). Lo que no cuadra no es el concepto, sino que el "no cuadra" que notás probablemente viene de este mismo problema de doble conteo (sección 11) y de la falta de aviso cuando una proyección individual ya quedó cubierta por un presupuesto (2.3, ya con badge visual ahora). Una vez resuelto el override de la Opción B, valdría la pena que me confirmes si sigue sintiéndose raro con un caso concreto tuyo.

---

## 12. Wishlist (implementado)

Pedido nuevo (2026-10-25): una pantalla sin relación con el resto de la app — solo anotar cosas para comprar con precio y categoría, poder marcarlas como ya compradas (se ocultan por defecto) y filtrar para verlas también.

- Tabla nueva `wishlist_items` (`supabase/migrations/20261025_012_wishlist.sql`): `name`, `category`, `price`, `currency`, `is_purchased`, `purchased_at`, `notes`, `sort_order`.
- **Categoría — decisión explícita de diseño:** no hay una tabla de categorías propia ni se reutiliza la entidad `Category` del resto de la app. `category` es una columna de texto simple en `wishlist_items`; el conjunto de categorías "existentes" se deriva en el cliente con un distinct sobre los items ya cargados (`[...new Set(items.map(i => i.category))]`), sin ningún query SQL especial. En la UI se usa como si fuera un conjunto cerrado: pestañas por categoría arriba de la lista (+ "Todas"), y en el formulario de alta/edición un `<Select>` con las categorías existentes + opción "+ Nueva categoría" que revela un input de texto para escribir una que no exista todavía. Al editar un item, su categoría actual siempre aparece en el selector (por construcción, viene de los mismos items de los que se derivan las pestañas) — no hay riesgo de que se "pierda" como pasaba con las divisas desactivadas.
- Pantalla **"Wishlist"** (menú lateral): alta/edición, tarjeta con el total estimado de lo pendiente (convertido a la divisa de display), checkbox "Mostrar compradas" (default apagado — por defecto solo se ven las pendientes), pestañas de categoría, botón para marcar/desmarcar comprada, eliminar.

### 12.1 Pendiente antes de poder usarlo

- **Aplicar la migración SQL manualmente**: `supabase/migrations/20261025_012_wishlist.sql` crea la tabla `wishlist_items`. Mismo procedimiento que las migraciones anteriores (SQL Editor de Supabase). **Importante:** antes de correrla, confirmá en el SQL Editor que no tira ningún error (como pasó con la de Suscripciones, que quedó sin aplicar la primera vez sin que quedara claro por qué) — si tira error, pegame el mensaje exacto.

## 13. Analytics — gráficos poco útiles

**✅ IMPLEMENTADO (2026-10-28) — A + B + C + E (D descartada por la usuaria):**
- Cálculos nuevos en `domain/analytics.js` (`getMonthlyNetSavings`, `getMonthOverMonthComparison`, `getSpendingPace`); `Analytics.jsx` solo los muestra.
- **A:** "Ahorro acumulado" reemplazado por barras de ahorro neto por mes (verde/rojo). Con un solo mes elegido muestra además los 5 anteriores, atenuados, como referencia.
- **B:** el gráfico diario ya no existe. "Ingresos vs Gastos" agrupa siempre por mes y solo aparece cuando el rango abarca varios meses. Las tarjetas de promedio pasan a "promedio mensual" (o "del mes" con un solo mes).
- **C:** "Ritmo de gasto" (solo con un mes): acumulado real de gasto en categorías con presupuesto vs. el presupuesto total repartido parejo. Suma transacciones, no presupuestos, así que no hay doble conteo. Independiente del filtro de categorías, igual que el cumplimiento de presupuesto.
- **E:** "Gasto vs. mes anterior" (solo con un mes): total, % de cambio y las 5 categorías que más cambiaron. Si el mes está en curso, se compara contra el mismo tramo de días del mes anterior. Respeta el filtro de categorías. El top de categorías del mes ya existía y se mantiene.

**🔁 REDISEÑADO (2026-10-28, segunda vuelta)** — feedback de la usuaria: el filtro de arriba ya no tenía sentido (cada tarjeta lo respetaba distinto) y el cumplimiento de presupuesto era confuso ("0k" en el eje; "% cumplimiento" donde menos era mejor).
- **Selector único arriba con dos modos:** *Mes* (navegador ‹ mes ›) y *Período* (3/6/12 meses, este año, año pasado, personalizado por mes). Todo en pantalla obedece a ese selector, sin excepciones.
- **Se eliminó el filtro global de categorías.** Su uso pasó a la tarjeta *Evolución por categoría* (modo Período): una línea por mes por cada categoría elegida, incluyendo subcategorías. Por defecto muestra las 3 categorías padre con más gasto.
- **Mes:** resumen del mes, gasto vs. mes anterior, ritmo de gasto, top categorías, medios de pago, comercios.
- **Período:** promedios mensuales, ingresos vs gastos por mes, ahorro neto por mes, cumplimiento de presupuesto, evolución por categoría, top categorías, medios de pago, comercios.
- **Cumplimiento rehecho:** barras de "% del presupuesto usado" con línea fija en 100%; verde si quedó por debajo, rojo si se pasó; el mes en curso atenuado. En vez del promedio: "Te mantuviste dentro del presupuesto en X de Y meses cerrados". Sin pestañas 6/12 propias: usa los meses del período.
- **Ejes compactos** en todos los gráficos (`formatCompactNumber`: 350, 1,2k, 1,5M).

### Propuesta original

Pedido de la usuaria (2026-10-25), todavía sin implementar porque quiere pensarlo antes de elegir:

**Problema 1 — "Ingresos vs Gastos por día" no tiene escala útil.** Cuando se mira un rango que agrupa por día (`groupByDay`, rangos ≤ ~62 días), los días de cobro de sueldo y los días de pago de tarjeta generan picos enormes comparados con el resto de los días en ~0 — la escala del gráfico queda dominada por esos dos picos y el resto se ve plano/inútil.

**Problema 2 — "Ingreso promedio" / "Gasto promedio" por día es poco relevante** cuando se está mirando un mes específico (sí tiene sentido cuando el rango es de varios meses, ahí promedia bien).

**Problema 3 — "Ahorro acumulado"** (línea que suma el ahorro de todo el rango visible) no es lo que la usuaria quiere ver — prefiere ver el neto ahorrado *de ese mes* o *por cada mes*, no un acumulado corriendo.

**Alternativas propuestas (a elegir, no son excluyentes entre sí):**

| # | Propuesta | Qué resuelve |
|---|---|---|
| A | Reemplazar "Ahorro acumulado" por un gráfico de **barras de ahorro neto por mes** (una barra por mes, no una línea acumulada) | Responde directamente al problema 3 — "cuánto ahorré *este* mes", no un corrido histórico. |
| B | Cuando el rango es un solo mes (`groupByDay`), **ocultar el gráfico diario de ingresos/gastos** y mostrarlo solo cuando el rango abarca varios meses (ahí sí tiene escala razonable) | Resuelve el problema 1 sin necesidad de inventar un gráfico nuevo — simplemente no se muestra donde no tiene sentido. |
| C | En su lugar, para un mes específico, mostrar un **gráfico de "ritmo de gasto"**: acumulado de gasto real día por día contra una línea de referencia del presupuesto repartido uniformemente en el mes (día 1 = presupuesto/30, día 15 = presupuesto/2, etc.) — responde "¿estoy gastando más rápido o más lento de lo que planeé este mes?" | Da algo *más* útil que el gráfico diario actual para la vista de un mes, en vez de solo ocultar algo. |
| D | Reemplazar "Ingreso/Gasto promedio por día" por **promedio por semana** cuando el rango es un mes (menos sensible a que un solo día de cobro/pago de tarjeta domine el número) | Resuelve el problema 2 sin sacar el dato, solo cambia la unidad de tiempo. |
| E | Mostrar en la vista de un mes específico, en vez de (o adicional a) los promedios diarios: **top categorías de gasto de ese mes** y **comparación contra el mes anterior** (¿gasté más o menos que el mes pasado, y en qué categoría cambió más?) | Da contexto "relevante para ese mes" que hoy no existe en ningún lado de Analytics para un mes individual — distinto de lo que ya hace la sección de cumplimiento de presupuesto (que compara contra lo presupuestado, no contra el mes anterior). |

**Mi recomendación si tuviera que elegir una combinación:** A (barras de ahorro neto mensual, siempre) + B (ocultar el gráfico diario cuando el rango es un mes) + E (categorías del mes + comparación contra el mes anterior, para llenar el hueco que deja ocultar el gráfico diario). D es un complemento fácil y barato de sumar sea cual sea el resto. C es la más vistosa pero también la que más trabajo lleva (requiere repartir el presupuesto día a día) — la dejaría para una segunda vuelta si las otras no alcanzan.

---

## Plan de acción sugerido

1. ✅ **Hecho** — Bugs acotados de alto impacto, bajo riesgo: 2.1 (conversión de divisa en presupuestos), 2.4 (código muerto en Budgets.jsx), 4.2 (código muerto en formatters.js), eliminación de `BudgetOverview.jsx`.
2. ✅ **Hecho** — Unificación de presupuestos/proyectado (2.2): `Projected.jsx::computeMonth` ahora usa el mismo criterio de categorías (`getMatchingCategoryIds`) que `domain/budgets.js`, con rollup de subcategorías correcto.
3. ✅ **Hecho** — Entidad Terceros/Deudas (sección 5): nuevo esquema + pantalla + limpieza del checkbox viejo. Migración aplicada.
4. ✅ **Hecho** — Suscripciones (sección 6): nuevo esquema + pantalla + caso de pagos a terceros. Migración aplicada.
5. ✅ **Hecho** — Transferencias cross-currency (3.1, 4.1): validación dura que impide guardar con `to_amount` vacío/0, y conversión correcta en pago de tarjeta cross-currency.
6. ✅ **Hecho** — Flujo de transferencias simplificado (3.5): se ingresan monto origen + monto destino directamente, sin elegir modo ni ingresar tasa a mano; la tasa efectiva y la diferencia contra la tasa de referencia se calculan solas.
7. ✅ **Hecho** — Categorías en lista/tabla jerárquica en vez de grilla de tarjetas (sección 10).
8. ✅ **Hecho** — Estadísticas de cumplimiento histórico de presupuesto (sección 9).
9. ✅ **Hecho** — Rediseño de UI de tarjetas de crédito para mobile (sección 8): filas colapsadas por defecto, un solo panel de detalle, textos de cierre/vencimiento reales, targets táctiles más grandes, mensaje explícito en el caso de divisas distintas.
10. ✅ **Hecho** — Dedupe de jerarquía de categorías en 4 formularios (incluido el desplegable confuso de Suscripciones) → `domain/categories.js::buildCategoryTree`.
11. ✅ **Hecho** — Fix de la columna "Del año" en Proyectado → Resumen (no incluía presupuestos para años futuros).
12. ✅ **Hecho** — Wishlist (sección 12): nueva pantalla, sin relación con el resto de la app. Migración aplicada (2026-10-28).
13. ✅ **Hecho (2026-10-28)** — Gráficos de Analytics (sección 13): la usuaria eligió A + B + C + E (D descartada).
14. ⬜ **Siguiente candidato** — Tipo de cambio histórico (1.1, 1.2): el más grande y estructural — requiere guardar snapshot de tasa por transacción. No bloqueante para el uso diario, pero es la raíz de por qué los reportes históricos "se mueven solos".
15. ✅ **Hecho (2026-10-28)** — Presupuestos padre/subcategoría con semántica de override (sección 11, Opción B) + bloqueo de duplicado exacto + "Copiar del mes anterior" ya no duplica.

Ver el checklist detallado al principio del documento para el estado ítem por ítem.
