export class RegisterUseCase {
  constructor(authRepository) {
    this.authRepository = authRepository;
  }

  async execute(username, password, displayName) {
    if (!username || !password || !displayName) {
      throw new Error('กรุณากรอกข้อมูลให้ครบถ้วน');
    }
    if (password.length < 6) {
      throw new Error('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
    }
    return await this.authRepository.register(username, password, displayName);
  }
}
