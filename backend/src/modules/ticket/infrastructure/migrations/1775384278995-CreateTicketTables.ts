import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTicketTables1775384278995 implements MigrationInterface {
  name = 'CreateTicketTables1775384278995';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "tickets" (
        "id" uuid NOT NULL,
        "owner_id" uuid NOT NULL,
        "remaining_count" integer NOT NULL,
        "status" character varying(50) NOT NULL DEFAULT 'PENDING',
        "purchase_date" date NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "version" integer NOT NULL DEFAULT 1,
        CONSTRAINT "PK_tickets" PRIMARY KEY ("id")
      )`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_tickets_owner_id" ON "tickets" ("owner_id")`,
    );

    await queryRunner.query(
      `CREATE TABLE "ticket_purchase_reservations" (
        "id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        "purchase_date" date NOT NULL,
        "quantity" integer NOT NULL,
        "status" character varying(50) NOT NULL DEFAULT 'PENDING',
        "ticket_id" uuid,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "version" integer NOT NULL DEFAULT 1,
        CONSTRAINT "PK_ticket_purchase_reservations" PRIMARY KEY ("id")
      )`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_tpr_user_id" ON "ticket_purchase_reservations" ("user_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_tpr_purchase_date" ON "ticket_purchase_reservations" ("purchase_date")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_tpr_purchase_date"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_tpr_user_id"`);
    await queryRunner.query(`DROP TABLE "ticket_purchase_reservations"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_tickets_owner_id"`);
    await queryRunner.query(`DROP TABLE "tickets"`);
  }
}
