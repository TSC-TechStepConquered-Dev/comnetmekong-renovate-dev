export class LoginUseCase {
  constructor(authRepository) {
    this.authRepository = authRepository;
  }

  async execute(username, password) {
    if (!username || !password) {
      throw new Error('กรุณากรอกชื่อผู้ใช้และรหัสผ่าน');
    }
    return await this.authRepository.login(username, password);
  }
}
