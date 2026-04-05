import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateReservationTables1775381692648 implements MigrationInterface {
  name = 'CreateReservationTables1775381692648';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // guests テーブル（reservations が guest_id で参照するため先に作成）
    await queryRunner.query(
      `CREATE TABLE "guests" (
        "id" uuid NOT NULL,
        "guest_name" character varying(255) NOT NULL,
        "created_by_staff_id" uuid NOT NULL,
        "visit_date" date,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_guests" PRIMARY KEY ("id")
      )`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_guests_visit_date" ON "guests" ("visit_date")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_guests_created_by_staff_id" ON "guests" ("created_by_staff_id")`,
    );

    // reservations テーブル
    await queryRunner.query(
      `CREATE TABLE "reservations" (
        "id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        "guest_id" uuid,
        "reservation_date" date NOT NULL,
        "payment_method" character varying(50) NOT NULL,
        "status" character varying(50) NOT NULL DEFAULT 'CONFIRMED',
        "ticket_id" uuid,
        "order_id" uuid,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "version" integer NOT NULL DEFAULT 1,
        CONSTRAINT "PK_reservations" PRIMARY KEY ("id")
      )`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_reservations_user_id" ON "reservations" ("user_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_reservations_reservation_date" ON "reservations" ("reservation_date")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_reservations_status" ON "reservations" ("status")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_reservations_order_id" ON "reservations" ("order_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_reservations_order_id"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_reservations_status"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_reservations_reservation_date"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_reservations_user_id"`);
    await queryRunner.query(`DROP TABLE "reservations"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_guests_created_by_staff_id"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_guests_visit_date"`);
    await queryRunner.query(`DROP TABLE "guests"`);
  }
}
