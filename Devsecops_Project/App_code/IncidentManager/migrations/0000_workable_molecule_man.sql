CREATE TABLE "incidents" (
	"id" serial PRIMARY KEY NOT NULL,
	"incident_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"priority" text DEFAULT 'low' NOT NULL,
	"category" text DEFAULT 'other' NOT NULL,
	"status" text DEFAULT 'open' NOT NULL,
	"assigned_to" integer,
	"created_by" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"due_date" timestamp,
	"resolved_at" timestamp,
	CONSTRAINT "incidents_incident_id_unique" UNIQUE("incident_id")
);
--> statement-breakpoint
CREATE TABLE "teams" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "teams_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"role" text DEFAULT 'user' NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
