# Migraciones de Supabase

Cada archivo en esta carpeta es una migración incremental. El nombre sigue el formato:

```
YYYYMMDD_NNN_descripcion.sql
```

## Cómo aplicar una migración

1. Abrí tu proyecto en [supabase.com](https://supabase.com)
2. Entrá a **SQL Editor**
3. Copiá y pegá el contenido del archivo `.sql`
4. Ejecutá

## Migraciones disponibles

| Archivo | Descripción |
|---------|-------------|
| `20260516_001_account_types_and_budget_currency.sql` | Agrega tipos `debit_card` y `crypto` a cuentas; agrega columna `currency` a presupuestos |

## Flujo recomendado para nuevos cambios

1. **Hacés un cambio en el código** (nuevo campo, nuevo tipo, nueva tabla)
2. **Actualizás `supabase/schema.sql`** — el schema completo siempre refleja el estado final
3. **Creás un nuevo archivo de migración** en `supabase/migrations/` con solo el `ALTER TABLE` o `CREATE TABLE` incremental
4. **Corrés la migración** en el SQL Editor de Supabase

## Consejo: Supabase CLI (opcional, más avanzado)

Si querés automatizar más, podés usar el [Supabase CLI](https://supabase.com/docs/guides/cli):

```bash
# Instalar
npm install -g supabase

# Linkear tu proyecto
supabase link --project-ref TU_PROJECT_REF

# Generar migración automática desde diff
supabase db diff --use-migra -f nombre_migracion

# Aplicar migraciones
supabase db push
```
