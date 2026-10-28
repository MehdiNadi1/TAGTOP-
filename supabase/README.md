# Guide de Configuration Supabase — TAGTOP Backend Foundation (Phase 2A)

Ce document décrit étape par étape la procédure pour connecter votre projet TAGTOP à une instance PostgreSQL hébergée sur Supabase.

---

## 1. Création du Projet Supabase

1. Rendez-vous sur le tableau de bord officiel : [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Cliquez sur **New Project**.
3. Renseignez les paramètres suivants :
   - **Name** : `tagtop-production` (ou `tagtop-dev`)
   - **Database Password** : Générez un mot de passe fort et conservez-le en lieu sûr.
   - **Region** : Choisissez `eu-west-1` (Europe - Irlande ou Francfort) pour une latence minimale depuis le Maroc.
   - **Plan** : Free Tier ou Pro.
4. Cliquez sur **Create new project** et attendez l'initialisation (environ 1 à 2 minutes).

---

## 2. Exécution des Migrations SQL

Vous pouvez appliquer le schéma de base de données de deux manières :

### Option A : Via le SQL Editor de Supabase (Le plus rapide)
Dans votre tableau de bord Supabase, ouvrez le menu **SQL Editor** dans la barre latérale gauche, puis copiez/collez et exécutez dans l'ordre les scripts suivants situés dans `supabase/migrations/` :

1. `supabase/migrations/20261028000000_tagtop_initial_schema.sql` (Tables, ENUMs, triggers de dates)
2. `supabase/migrations/20261028000001_tagtop_rls_policies.sql` (Politiques de sécurité RLS multi-tenant)
3. `supabase/migrations/20261028000002_tagtop_rpc_and_admin.sql` (Procédures stockées sécurisées RPC)
4. *(Optionnel)* `supabase/seed.sql` (Données de démonstration marocaines)

### Option B : Via le CLI Supabase
Si vous avez installé `supabase-cli` :
```bash
supabase link --project-ref <votre-project-id>
supabase db push
```

---

## 3. Configuration des Variables d'Environnement

Dans le tableau de bord Supabase :
1. Accédez à **Project Settings** (icône roue crantée) > **API**.
2. Copiez l'**URL du projet** (`Project URL`).
3. Copiez la clé **Public Anon Key** (`anon` `public`).
4. **ATTENTION :** Ne copiez JAMAIS la clé secrète `service_role` dans votre code frontend ou dans un fichier `.env` public.

Créez un fichier `.env` à la racine de votre projet TAGTOP en vous basant sur `.env.example` :

```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 4. Attribution du Rôle Founder / Administrateur

Par défaut, tout nouvel utilisateur s'inscrivant via Supabase Auth reçoit automatiquement le rôle `customer`.
Pour accorder à votre propre compte le rôle `founder_admin` :

1. Créez votre compte sur l'application ou dans **Authentication** > **Users** sur Supabase.
2. Ouvrez le **SQL Editor** de Supabase et exécutez :
```sql
UPDATE public.users
SET role = 'founder_admin'
WHERE email = 'votre-email-administrateur@tagtop.ma';
```
Ce compte bénéficiera dès lors des permissions d'administration complètes via les politiques Row Level Security (RLS) et les fonctions RPC dédiées.

---

## 5. Configuration de l'Authentification

Dans **Authentication** > **URL Configuration** :
- **Site URL** : `https://mehdinadi1.github.io/TAGTOP-/` (ou votre domaine personnalisé `https://tagtop.ma`)
- **Redirect URLs** :
  - `http://localhost:3000/**`
  - `https://mehdinadi1.github.io/TAGTOP-/**`
