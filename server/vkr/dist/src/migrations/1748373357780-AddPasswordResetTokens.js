"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddPasswordResetTokens1748373357780 = void 0;
class AddPasswordResetTokens1748373357780 {
    async up(queryRunner) {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS public.password_reset_tokens
            (
                id integer NOT NULL DEFAULT nextval('password_reset_tokens_id_seq'::regclass),
                user_id bigint NOT NULL,
                token character varying(6) NOT NULL,
                expires_at timestamp with time zone NOT NULL,
                is_valid boolean NOT NULL DEFAULT true,
                created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (id),
                CONSTRAINT password_reset_tokens_user_id_fkey FOREIGN KEY (user_id)
                    REFERENCES public.users (user_id) MATCH SIMPLE
                    ON UPDATE NO ACTION
                    ON DELETE CASCADE
            )
        `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
            DROP TABLE IF EXISTS public.password_reset_tokens;
        `);
    }
}
exports.AddPasswordResetTokens1748373357780 = AddPasswordResetTokens1748373357780;
//# sourceMappingURL=1748373357780-AddPasswordResetTokens.js.map