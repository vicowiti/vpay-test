CREATE TYPE "public"."transaction_status" AS ENUM('pending', 'completed', 'failed', 'reversed');--> statement-breakpoint
CREATE TYPE "public"."transaction_type" AS ENUM('deposit', 'transfer', 'reversal');--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"from_account_id" integer,
	"to_account_id" integer NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"type" "transaction_type" NOT NULL,
	"status" "transaction_status" DEFAULT 'pending' NOT NULL,
	"note" text,
	"reversal_of_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_from_account_id_accounts_id_fk" FOREIGN KEY ("from_account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_to_account_id_accounts_id_fk" FOREIGN KEY ("to_account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;