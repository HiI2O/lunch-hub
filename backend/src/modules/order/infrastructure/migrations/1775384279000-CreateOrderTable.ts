import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateOrderTable1775384279000 implements MigrationInterface {
  name = 'CreateOrderTable1775384279000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "orders" (
        "id" uuid NOT NULL,
        "order_date" date NOT NULL,
        "reservation_ids" jsonb NOT NULL,
        "status" character varying(50) NOT NULL DEFAULT 'PENDING',
        "total_count" integer NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "placed_at" TIMESTAMP,
        "version" integer NOT NULL DEFAULT 1,
        CONSTRAINT "PK_orders" PRIMARY KEY ("id")
      )`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_orders_order_date" ON "orders" ("order_date")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_orders_order_date"`);
    await queryRunner.query(`DROP TABLE "orders"`);
  }
}
