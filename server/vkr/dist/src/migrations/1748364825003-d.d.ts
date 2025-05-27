import { MigrationInterface, QueryRunner } from "typeorm";
export declare class D1748364825003 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
