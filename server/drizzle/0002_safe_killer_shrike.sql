ALTER TABLE "accounts" ADD COLUMN "balance" numeric(12, 2) DEFAULT '0.00' NOT NULL;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "accounts" DROP COLUMN "provider";--> statement-breakpoint
ALTER TABLE "accounts" DROP COLUMN "provider_account_id";