alter table "public"."poems" drop constraint "public_poems_style_fkey";
alter table "public"."poems" drop constraint "public_poems_topic_fkey";
alter table "public"."styles" drop constraint "styles_pkey";
alter table "public"."topics" drop constraint "topics_pkey";
drop index if exists "public"."styles_pkey";
drop index if exists "public"."topics_pkey";
alter table "public"."poems" alter column "style" set data type bigint using "style"::bigint;
alter table "public"."poems" alter column "topic" set data type bigint using "topic"::bigint;
CREATE UNIQUE INDEX styles_name_key ON public.styles USING btree (name);
CREATE UNIQUE INDEX topics_topic_key ON public.topics USING btree (topic);
CREATE UNIQUE INDEX styles_pkey ON public.styles USING btree (id);
CREATE UNIQUE INDEX topics_pkey ON public.topics USING btree (id);
alter table "public"."styles" add constraint "styles_pkey" PRIMARY KEY using index "styles_pkey";
alter table "public"."topics" add constraint "topics_pkey" PRIMARY KEY using index "topics_pkey";
alter table "public"."poems" add constraint "poems_style_fkey" FOREIGN KEY (style) REFERENCES styles(id) not valid;
alter table "public"."poems" validate constraint "poems_style_fkey";
alter table "public"."poems" add constraint "poems_topic_fkey" FOREIGN KEY (topic) REFERENCES topics(id) not valid;
alter table "public"."poems" validate constraint "poems_topic_fkey";
alter table "public"."styles" add constraint "styles_name_key" UNIQUE using index "styles_name_key";
alter table "public"."topics" add constraint "topics_topic_key" UNIQUE using index "topics_topic_key";
