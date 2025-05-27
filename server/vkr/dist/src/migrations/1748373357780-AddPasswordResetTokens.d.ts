import { MigrationInterface, QueryRunner } from "typeorm";
export declare class AddPasswordResetTokens1748373357780 implements MigrationInterface {
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
