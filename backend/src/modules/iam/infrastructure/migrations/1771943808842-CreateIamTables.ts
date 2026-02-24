import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateIamTables1771943808842 implements MigrationInterface {
  name = 'CreateIamTables1771943808842';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL, "email" character varying(255) NOT NULL, "display_name" character varying(50), "password_hash" character varying(255), "role" character varying(50) NOT NULL DEFAULT 'GENERAL_USER', "status" character varying(50) NOT NULL DEFAULT 'INVITED', "invitation_token" character varying(255), "invitation_token_expires_at" TIMESTAMP, "invited_by" uuid, "invited_at" TIMESTAMP, "activated_at" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "last_login_at" TIMESTAMP, "version" integer NOT NULL, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "UQ_b8d85a3305a4ae02ddf4a4eec57" UNIQUE ("invitation_token"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b8d85a3305a4ae02ddf4a4eec5" ON "users" ("invitation_token") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3676155292d72c67cd4e090514" ON "users" ("status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_97672ac88f789774dd47f7c8be" ON "users" ("email") `,
    );
    await queryRunner.query(
      `CREATE TABLE "audit_logs" ("id" uuid NOT NULL, "action_type" character varying(100) NOT NULL, "category" character varying(50) NOT NULL, "actor_id" uuid, "target_type" character varying(100), "target_id" uuid, "details" jsonb, "ip_address" character varying(45), "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_1bb179d048bbc581caa3b013439" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "password_reset_tokens" ("id" uuid NOT NULL, "user_id" uuid NOT NULL, "token" character varying(255) NOT NULL, "expires_at" TIMESTAMP NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_ab673f0e63eac966762155508ee" UNIQUE ("token"), CONSTRAINT "PK_d16bebd73e844c48bca50ff8d3d" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "password_reset_tokens"`);
    await queryRunner.query(`DROP TABLE "audit_logs"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_97672ac88f789774dd47f7c8be"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_3676155292d72c67cd4e090514"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b8d85a3305a4ae02ddf4a4eec5"`,
    );
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
