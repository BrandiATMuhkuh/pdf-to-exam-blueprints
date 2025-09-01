alter table "public"."blueprint_edges" drop constraint "edge_blueprint_id_fkey1";


  create table "public"."blueprints" (
    "blueprint_id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "name" text not null default ''::text,
    "description" text not null default ''::text,
    "file_id" text not null default ''::text,
    "ai_notes" text not null default ''::text
      );


alter table "public"."blueprints" enable row level security;

alter table "public"."blueprint_edges" alter column "blueprint_id" set not null;

CREATE UNIQUE INDEX blueprints_pkey ON public.blueprints USING btree (blueprint_id);

alter table "public"."blueprints" add constraint "blueprints_pkey" PRIMARY KEY using index "blueprints_pkey";

alter table "public"."blueprint_edges" add constraint "blueprint_edges_blueprint_id_fkey" FOREIGN KEY (blueprint_id) REFERENCES blueprints(blueprint_id) ON DELETE CASCADE not valid;

alter table "public"."blueprint_edges" validate constraint "blueprint_edges_blueprint_id_fkey";

grant delete on table "public"."blueprints" to "anon";

grant insert on table "public"."blueprints" to "anon";

grant references on table "public"."blueprints" to "anon";

grant select on table "public"."blueprints" to "anon";

grant trigger on table "public"."blueprints" to "anon";

grant truncate on table "public"."blueprints" to "anon";

grant update on table "public"."blueprints" to "anon";

grant delete on table "public"."blueprints" to "authenticated";

grant insert on table "public"."blueprints" to "authenticated";

grant references on table "public"."blueprints" to "authenticated";

grant select on table "public"."blueprints" to "authenticated";

grant trigger on table "public"."blueprints" to "authenticated";

grant truncate on table "public"."blueprints" to "authenticated";

grant update on table "public"."blueprints" to "authenticated";

grant delete on table "public"."blueprints" to "service_role";

grant insert on table "public"."blueprints" to "service_role";

grant references on table "public"."blueprints" to "service_role";

grant select on table "public"."blueprints" to "service_role";

grant trigger on table "public"."blueprints" to "service_role";

grant truncate on table "public"."blueprints" to "service_role";

grant update on table "public"."blueprints" to "service_role";


