CREATE TABLE IF NOT EXISTS "payment_request_transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"payment_request_id" integer,
	"transaction_id" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "payment_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text,
	"recipient_email" text NOT NULL,
	"total_amount" integer NOT NULL,
	"status" text DEFAULT 'pending',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "recipients" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text,
	"email" text NOT NULL,
	"name" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text,
	"description" text NOT NULL,
	"amount" integer NOT NULL,
	"date" timestamp NOT NULL,
	"status" text DEFAULT 'pending',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "payment_request_transactions" ADD CONSTRAINT "payment_request_transactions_payment_request_id_payment_requests_id_fk" FOREIGN KEY ("payment_request_id") REFERENCES "public"."payment_requests"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "payment_request_transactions" ADD CONSTRAINT "payment_request_transactions_transaction_id_transactions_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."transactions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "payment_requests" ADD CONSTRAINT "payment_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "recipients" ADD CONSTRAINT "recipients_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
