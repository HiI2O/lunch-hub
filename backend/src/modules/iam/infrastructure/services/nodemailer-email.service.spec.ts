import { ConfigService } from '@nestjs/config';
import { NodemailerEmailService } from './nodemailer-email.service.js';

jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue(undefined),
  }),
}));

import { createTransport } from 'nodemailer';

describe('NodemailerEmailService', () => {
  function createService(
    overrides: Record<string, unknown> = {},
  ): NodemailerEmailService {
    const configMap: Record<string, unknown> = {
      'mail.host': 'localhost',
      'mail.port': 1025,
      'mail.secure': false,
      'mail.user': 'user',
      'mail.pass': 'pass',
      'mail.from': 'custom@lunch-hub.local',
      ...overrides,
    };
    const configService = {
      get: jest.fn((key: string, defaultValue?: unknown) => {
        const val = configMap[key];
        return val !== undefined ? val : defaultValue;
      }),
    } as unknown as ConfigService;
    return new NodemailerEmailService(configService);
  }

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('コンストラクタ', () => {
    it('ConfigServiceからメール設定を読み取りTransporterを生成する', () => {
      createService();

      expect(createTransport).toHaveBeenCalledWith({
        host: 'localhost',
        port: 1025,
        secure: false,
        auth: { user: 'user', pass: 'pass' },
      });
    });
  });

  describe('send', () => {
    it('SendEmailParamsを渡すとtransporter.sendMailが呼ばれる', async () => {
      const service = createService();
      const transporter = (createTransport as jest.Mock).mock.results[0].value;

      await service.send({
        to: 'dest@example.com',
        subject: 'テスト',
        html: '<p>本文</p>',
      });

      expect(transporter.sendMail).toHaveBeenCalledTimes(1);
    });

    it('fromにConfigServiceのmail.fromの値が設定される', async () => {
      const service = createService();
      const transporter = (createTransport as jest.Mock).mock.results[0].value;

      await service.send({
        to: 'dest@example.com',
        subject: 'テスト',
        html: '<p>本文</p>',
      });

      expect(transporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({ from: 'custom@lunch-hub.local' }),
      );
    });

    it('to, subject, htmlがSendEmailParamsの値と一致する', async () => {
      const service = createService();
      const transporter = (createTransport as jest.Mock).mock.results[0].value;

      await service.send({
        to: 'dest@example.com',
        subject: '件名',
        html: '<p>内容</p>',
      });

      expect(transporter.sendMail).toHaveBeenCalledWith({
        from: 'custom@lunch-hub.local',
        to: 'dest@example.com',
        subject: '件名',
        html: '<p>内容</p>',
      });
    });

    it('mail.from未設定時にデフォルトnoreply@lunch-hub.localが使用される', async () => {
      const service = createService({ 'mail.from': undefined });
      const transporter = (createTransport as jest.Mock).mock.results[0].value;

      await service.send({
        to: 'dest@example.com',
        subject: 'テスト',
        html: '<p>本文</p>',
      });

      expect(transporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({ from: 'noreply@lunch-hub.local' }),
      );
    });

    it('transporter.sendMailが例外をスローした場合、例外が伝播する', async () => {
      const service = createService();
      const transporter = (createTransport as jest.Mock).mock.results[0].value;
      transporter.sendMail.mockRejectedValueOnce(new Error('SMTP error'));

      await expect(
        service.send({
          to: 'dest@example.com',
          subject: 'テスト',
          html: '<p>本文</p>',
        }),
      ).rejects.toThrow('SMTP error');
    });
  });
});
