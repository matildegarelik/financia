# FinanzApp

Gestor de finanzas personales con soporte multi-moneda. Permite llevar el control de cuentas, transacciones, presupuestos, inversiones y proyecciones financieras.

## Funcionalidades

### Dashboard
Vista general del estado financiero: saldo total por moneda, ingresos y gastos del mes, transacciones recientes, resumen de presupuestos e inversiones.

### Transacciones
- Registro de ingresos, gastos y transferencias entre cuentas
- Estados: confirmado, en cuotas, proyectado
- Soporte de transacciones recurrentes (semanal, quincenal, mensual, anual)
- Seguimiento de cuotas (cuota actual / total)
- Campos para proyectos y clientes (ideal para freelancers)
- Importación de transacciones por archivo CSV

### Cuentas
- Tipos: cuenta corriente, caja de ahorro, tarjeta de crédito, efectivo, inversión y otras
- Multi-moneda por cuenta (USD, EUR, ARS, COP, CLP, PEN)
- Saldo en tiempo real, color e ícono personalizables
- Posibilidad de desactivar cuentas sin eliminarlas

### Presupuestos
- Presupuestos por categoría con periodos semanal, mensual o anual
- Seguimiento del gasto real vs. presupuestado
- Duplicación de presupuestos entre meses

### Inversiones
- Tipos: acciones, bonos, cripto, inmuebles, fondos mutuos, ETF, CETES y otras
- Registro por plataforma/broker con moneda propia
- Cálculo de ganancia/pérdida (P&L)

### Categorías
- Ingresos y gastos con ícono y color personalizados
- Soporte de jerarquía (categoría padre/hijo)

### Proyectado
- Comparativa mes a mes de transacciones proyectadas vs. reales
- Cálculo de diferencias y saldo proyectado

### Estadísticas
- Análisis histórico por tipo, categoría y cuenta
- Gráficos de tendencias y distribución de gastos

### Configuración
- Monedas activas: elegir cuáles aparecen en formularios
- Tipos de cambio: obtención automática vía [Frankfurter API](https://www.frankfurter.app/) o ingreso manual
- Saldos iniciales de cuentas
- Favoritos de la barra de navegación móvil

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18 + Vite 6 |
| Routing | React Router 6 |
| Estado / Fetching | TanStack React Query 5 |
| UI | shadcn/ui + Radix UI + Tailwind CSS |
| Formularios | React Hook Form + Zod |
| Gráficos | Recharts |
| Auth + DB | Supabase |
| Deploy | Vercel |

## Setup local

### 1. Crear proyecto en Supabase

1. Entrá a [supabase.com](https://supabase.com) y creá un nuevo proyecto
2. En el SQL Editor, copiá y ejecutá el contenido de `supabase/schema.sql`
3. En **Authentication → Providers**, habilitá Email y opcionalmente Google OAuth

### 2. Variables de entorno

Copiá el template y completá con tus credenciales de Supabase:

```bash
cp .env.example .env
```

Las credenciales están en tu proyecto de Supabase en **Settings → API**:

```
VITE_SUPABASE_URL=https://xxxxxxxxxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Instalar dependencias y correr

```bash
npm install
npm run dev
```

## Deploy en Vercel

1. Importá el repositorio en [vercel.com](https://vercel.com)
2. En **Settings → Environment Variables**, agregá `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`
3. Build command: `npm run build` — Output directory: `dist`
4. El archivo `vercel.json` ya configura el rewrite necesario para que las rutas de la SPA funcionen correctamente

## Google OAuth (opcional)

Para habilitar login con Google:
1. Creá un proyecto en [Google Cloud Console](https://console.cloud.google.com) y obtené un Client ID y Secret
2. En Supabase → Authentication → Providers → Google, ingresá las credenciales
3. Agregá la URL de tu app (`https://tu-app.vercel.app`) como Authorized Redirect URI en Google Cloud

## Estructura del proyecto

```
finanzapp/
├── src/
│   ├── api/
│   │   ├── supabaseClient.js   # Cliente Supabase + wrappers de entidades
│   │   └── base44Client.js     # Shim de compatibilidad (redirige a Supabase)
│   ├── components/
│   │   ├── layout/             # AppLayout, Sidebar
│   │   ├── dashboard/          # Widgets del dashboard
│   │   ├── transactions/       # Formulario e ImportModal
│   │   ├── shared/             # PageHeader, StatCard, CurrencySelector
│   │   └── ui/                 # Componentes shadcn/ui
│   ├── lib/
│   │   ├── AuthContext.jsx     # Auth reactivo con Supabase
│   │   ├── currency-context.jsx
│   │   └── formatters.js
│   └── pages/
│       ├── auth/               # SignIn, Register, ForgotPassword, ResetPassword
│       ├── Dashboard.jsx
│       ├── Transactions.jsx
│       ├── Accounts.jsx
│       ├── Budgets.jsx
│       ├── Investments.jsx
│       ├── Categories.jsx
│       ├── Analytics.jsx
│       ├── Projected.jsx
│       └── Settings.jsx
├── supabase/
│   └── schema.sql              # DDL + RLS para deployar en Supabase
├── entities/                   # Schemas de referencia (documentación)
├── .env.example
├── vercel.json
└── vite.config.js
```
