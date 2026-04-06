import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const ADMIN_USER_ID = '864c660b-5e97-4884-a70f-f21209124e6b';
const MAILHOG_API = 'http://localhost:8025/api/v1/messages';

/**
 * テスト環境をリセットする。
 * - 管理者以外のユーザーと関連データを全削除
 * - MailHog のメールを全削除
 */
export async function resetTestEnvironment(): Promise<void> {
  await deleteNonAdminUsers();
  await clearMailHog();
}

async function deleteNonAdminUsers(): Promise<void> {
  const sql = [
    `DELETE FROM password_reset_tokens WHERE user_id != '${ADMIN_USER_ID}'`,
    `DELETE FROM reservations WHERE user_id != '${ADMIN_USER_ID}'`,
    `DELETE FROM ticket_purchase_reservations WHERE user_id != '${ADMIN_USER_ID}'`,
    `DELETE FROM tickets WHERE owner_id != '${ADMIN_USER_ID}'`,
    `DELETE FROM users WHERE id != '${ADMIN_USER_ID}'`,
  ].join('; ');

  await execAsync(
    `docker exec lunch-hub-postgres psql -U postgres -d lunch_hub -c "${sql}"`,
  );
}

async function clearMailHog(): Promise<void> {
  await fetch(MAILHOG_API, { method: 'DELETE' });
}
