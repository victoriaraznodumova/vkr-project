import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1748375158949 implements MigrationInterface {
    name = 'Migrations1748375158949'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "organizations" ("organization_id" SERIAL NOT NULL, "name" character varying NOT NULL, "city" character varying NOT NULL, "address" character varying NOT NULL, CONSTRAINT "PK_256856c7ab20081dd27937d43ed" PRIMARY KEY ("organization_id"))`);
        await queryRunner.query(`CREATE TABLE "password_reset_tokens" ("id" SERIAL NOT NULL, "token" character varying(6) NOT NULL, "expires_at" TIMESTAMP NOT NULL, "is_valid" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" integer NOT NULL, CONSTRAINT "UQ_ab673f0e63eac966762155508ee" UNIQUE ("token"), CONSTRAINT "PK_d16bebd73e844c48bca50ff8d3d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "users" ("user_id" SERIAL NOT NULL, "email" character varying NOT NULL, "password_hash" character varying NOT NULL, "registration_date" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_96aac72f1574b88752e9fb00089" PRIMARY KEY ("user_id"))`);
        await queryRunner.query(`CREATE TYPE "public"."journal_action_enum" AS ENUM('joined', 'left', 'removed', 'admin_removed', 'status_changed', 'started_serving', 'completed_service', 'user_canceled', 'admin_canceled', 'no_show', 'marked_late', 'admin_added')`);
        await queryRunner.query(`CREATE TYPE "public"."journal_prev_status_enum" AS ENUM('waiting', 'serving', 'completed', 'canceled', 'no_show', 'late', 'removed')`);
        await queryRunner.query(`CREATE TYPE "public"."journal_new_status_enum" AS ENUM('waiting', 'serving', 'completed', 'canceled', 'no_show', 'late', 'removed')`);
        await queryRunner.query(`CREATE TABLE "journal" ("log_id" SERIAL NOT NULL, "entry_id" integer NOT NULL, "action" "public"."journal_action_enum" NOT NULL, "prev_status" "public"."journal_prev_status_enum", "new_status" "public"."journal_new_status_enum", "log_time" TIMESTAMP WITH TIME ZONE NOT NULL, "initiated_by_user_id" integer NOT NULL, "comment" text, CONSTRAINT "PK_d1896c9f522fe4bb4f7e8046273" PRIMARY KEY ("log_id"))`);
        await queryRunner.query(`CREATE TYPE "public"."entries_status_enum" AS ENUM('waiting', 'serving', 'completed', 'canceled', 'no_show', 'late')`);
        await queryRunner.query(`CREATE TABLE "entries" ("entry_id" SERIAL NOT NULL, "queue_id" integer NOT NULL, "user_id" integer NOT NULL, "status" "public"."entries_status_enum" NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "entry_time_org" TIMESTAMP WITH TIME ZONE, "entry_position_self" integer, "sequential_number_self" integer, "status_updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "notification_minutes" integer, "notification_position" integer, "actual_start_time" TIMESTAMP WITH TIME ZONE, "actual_end_time" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_8ee36b5f6558cdc0fbd4af1434c" PRIMARY KEY ("entry_id"))`);
        await queryRunner.query(`CREATE TYPE "public"."queues_type_enum" AS ENUM('organizational', 'self_organized')`);
        await queryRunner.query(`CREATE TYPE "public"."queues_visibility_enum" AS ENUM('public', 'private')`);
        await queryRunner.query(`CREATE TABLE "queues" ("queue_id" SERIAL NOT NULL, "name" text NOT NULL, "organization_id" integer, "type" "public"."queues_type_enum" NOT NULL, "visibility" "public"."queues_visibility_enum" NOT NULL, "city" character varying NOT NULL, "address" text NOT NULL, "opening_hours" text NOT NULL, "service_name" text NOT NULL, "interval_minutes" integer NOT NULL, "concurrent_visitors" integer NOT NULL, "private_link_token" text, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "created_by_user_id" integer NOT NULL, CONSTRAINT "PK_9c86e57455f479c205741ecb942" PRIMARY KEY ("queue_id"))`);
        await queryRunner.query(`CREATE TABLE "administrators" ("user_id" integer NOT NULL, "queue_id" integer NOT NULL, CONSTRAINT "PK_f17efea4d9bc9e9720f057e4b31" PRIMARY KEY ("user_id", "queue_id"))`);
        await queryRunner.query(`ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "FK_52ac39dd8a28730c63aeb428c9c" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "journal" ADD CONSTRAINT "FK_69167f660c807d2aa178f0bd7e6" FOREIGN KEY ("entry_id") REFERENCES "entries"("entry_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "journal" ADD CONSTRAINT "FK_b9abbd1986df29baa00d5931ed2" FOREIGN KEY ("initiated_by_user_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "entries" ADD CONSTRAINT "FK_73b250bca5e5a24e1343da56168" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "entries" ADD CONSTRAINT "FK_3a592d009aab03dbc5d89f32e1c" FOREIGN KEY ("queue_id") REFERENCES "queues"("queue_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "queues" ADD CONSTRAINT "FK_5044c9ae637056bdb9db3e512d8" FOREIGN KEY ("organization_id") REFERENCES "organizations"("organization_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "queues" ADD CONSTRAINT "FK_09b6a33172f829515f478156120" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "administrators" ADD CONSTRAINT "FK_12ff2aff54e3fca4b036bfea20b" FOREIGN KEY ("queue_id") REFERENCES "queues"("queue_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "administrators" ADD CONSTRAINT "FK_fc23800cd060320637aa05f21f6" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "administrators" DROP CONSTRAINT "FK_fc23800cd060320637aa05f21f6"`);
        await queryRunner.query(`ALTER TABLE "administrators" DROP CONSTRAINT "FK_12ff2aff54e3fca4b036bfea20b"`);
        await queryRunner.query(`ALTER TABLE "queues" DROP CONSTRAINT "FK_09b6a33172f829515f478156120"`);
        await queryRunner.query(`ALTER TABLE "queues" DROP CONSTRAINT "FK_5044c9ae637056bdb9db3e512d8"`);
        await queryRunner.query(`ALTER TABLE "entries" DROP CONSTRAINT "FK_3a592d009aab03dbc5d89f32e1c"`);
        await queryRunner.query(`ALTER TABLE "entries" DROP CONSTRAINT "FK_73b250bca5e5a24e1343da56168"`);
        await queryRunner.query(`ALTER TABLE "journal" DROP CONSTRAINT "FK_b9abbd1986df29baa00d5931ed2"`);
        await queryRunner.query(`ALTER TABLE "journal" DROP CONSTRAINT "FK_69167f660c807d2aa178f0bd7e6"`);
        await queryRunner.query(`ALTER TABLE "password_reset_tokens" DROP CONSTRAINT "FK_52ac39dd8a28730c63aeb428c9c"`);
        await queryRunner.query(`DROP TABLE "administrators"`);
        await queryRunner.query(`DROP TABLE "queues"`);
        await queryRunner.query(`DROP TYPE "public"."queues_visibility_enum"`);
        await queryRunner.query(`DROP TYPE "public"."queues_type_enum"`);
        await queryRunner.query(`DROP TABLE "entries"`);
        await queryRunner.query(`DROP TYPE "public"."entries_status_enum"`);
        await queryRunner.query(`DROP TABLE "journal"`);
        await queryRunner.query(`DROP TYPE "public"."journal_new_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."journal_prev_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."journal_action_enum"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "password_reset_tokens"`);
        await queryRunner.query(`DROP TABLE "organizations"`);
    }

}
