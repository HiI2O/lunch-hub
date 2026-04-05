const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PASSWORD_LETTER = /[a-zA-Z]/;
const PASSWORD_DIGIT = /\d/;
const PASSWORD_SYMBOL = /[!@#$%^&*]/;

export const validators = {
  email(value: string): string | undefined {
    if (!value) return 'メールアドレスを入力してください';
    if (!EMAIL_REGEX.test(value)) return '有効なメールアドレスを入力してください';
    return undefined;
  },

  password(value: string): string | undefined {
    if (!value) return 'パスワードを入力してください';
    if (value.length < 8) return 'パスワードは8文字以上で入力してください';
    if (!PASSWORD_LETTER.test(value)) return 'パスワードに英字を含めてください';
    if (!PASSWORD_DIGIT.test(value)) return 'パスワードに数字を含めてください';
    if (!PASSWORD_SYMBOL.test(value)) return 'パスワードに記号（!@#$%^&*）を含めてください';
    return undefined;
  },

  passwordConfirm(value: string, password: string): string | undefined {
    if (value !== password) return 'パスワードが一致しません';
    return undefined;
  },

  pin(value: string): string | undefined {
    if (!value) return 'PINを入力してください';
    if (value.length < 6) return 'PINは6文字以上で入力してください';
    if (value.length > 12) return 'PINは12文字以下で入力してください';
    return undefined;
  },

  displayName(value: string): string | undefined {
    if (!value) return '表示名を入力してください';
    if (value.length > 50) return '表示名は50文字以下で入力してください';
    return undefined;
  },

  required(value: string): string | undefined {
    if (!value) return '入力してください';
    return undefined;
  },
};
