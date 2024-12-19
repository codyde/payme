ALTER TABLE "transactions" ALTER COLUMN "date" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "transactions" ALTER COLUMN "date" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "transactions" ALTER COLUMN "description" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "transactions" ALTER COLUMN "amount" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "business" text;