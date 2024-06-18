alter table "public"."topics" drop constraint "topics_topic_key";

drop index if exists "public"."topics_topic_key";

alter table "public"."topics" drop column "topic";

alter table "public"."topics" add column "name" text;

CREATE UNIQUE INDEX topics_topic_key ON public.topics USING btree (name);

alter table "public"."topics" add constraint "topics_topic_key" UNIQUE using index "topics_topic_key";


