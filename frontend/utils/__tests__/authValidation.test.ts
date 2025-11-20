import { validateUsername, validatePassword } from '../authValidation';

describe('authValidation', () => {
  describe('validateUsername', () => {
    it('빈 문자열 입력 시 에러 반환', () => {
      expect(validateUsername('')).toBe('ID를 입력해주세요.');
    });

    it('6자 미만 입력 시 에러 반환', () => {
      expect(validateUsername('abc')).toBe('ID는 6자 이상이어야 합니다.');
      expect(validateUsername('abcde')).toBe('ID는 6자 이상이어야 합니다.');
    });

    it('16자 초과 입력 시 에러 반환', () => {
      expect(validateUsername('a'.repeat(17))).toBe(
        'ID는 16자 이하여야 합니다.',
      );
      expect(validateUsername('a'.repeat(20))).toBe(
        'ID는 16자 이하여야 합니다.',
      );
    });

    it('허용되지 않는 문자 포함 시 에러 반환', () => {
      expect(validateUsername('user@name')).toBe(
        'ID는 영문 대/소문자, 숫자, 언더스코어만 사용할 수 있습니다.',
      );
      expect(validateUsername('user name')).toBe(
        'ID는 영문 대/소문자, 숫자, 언더스코어만 사용할 수 있습니다.',
      );
      expect(validateUsername('user-name')).toBe(
        'ID는 영문 대/소문자, 숫자, 언더스코어만 사용할 수 있습니다.',
      );
      expect(validateUsername('user!name')).toBe(
        'ID는 영문 대/소문자, 숫자, 언더스코어만 사용할 수 있습니다.',
      );
    });

    it('유효한 username 입력 시 null 반환', () => {
      expect(validateUsername('user123')).toBeNull();
      expect(validateUsername('User_123')).toBeNull();
      expect(validateUsername('username')).toBeNull();
      expect(validateUsername('USER123')).toBeNull();
      expect(validateUsername('a'.repeat(6))).toBeNull();
      expect(validateUsername('a'.repeat(16))).toBeNull();
    });

    it('숫자만 포함된 username도 허용', () => {
      expect(validateUsername('123456')).toBeNull();
      expect(validateUsername('1234567890')).toBeNull();
    });

    it('언더스코어 포함 username 허용', () => {
      expect(validateUsername('user_name')).toBeNull();
      expect(validateUsername('_user123')).toBeNull();
      expect(validateUsername('user123_')).toBeNull();
    });

    it('대소문자 혼합 username 허용', () => {
      expect(validateUsername('UserName')).toBeNull();
      expect(validateUsername('userName123')).toBeNull();
    });
  });

  describe('validatePassword', () => {
    it('빈 문자열 입력 시 에러 반환', () => {
      expect(validatePassword('')).toBe('비밀번호를 입력해주세요.');
    });

    it('8자 미만 입력 시 에러 반환', () => {
      expect(validatePassword('pass1')).toBe(
        '비밀번호는 8자 이상이어야 합니다.',
      );
      expect(validatePassword('pass12')).toBe(
        '비밀번호는 8자 이상이어야 합니다.',
      );
    });

    it('32자 초과 입력 시 에러 반환', () => {
      const longPassword = 'a'.repeat(20) + '1'.repeat(13);
      expect(validatePassword(longPassword)).toBe(
        '비밀번호는 32자 이하여야 합니다.',
      );
    });

    it('숫자 없이 영문자만 있을 때 에러 반환', () => {
      expect(validatePassword('password')).toBe(
        '비밀번호는 숫자와 영문자를 최소 1개 이상 포함해야 합니다.',
      );
      expect(validatePassword('abcdefgh')).toBe(
        '비밀번호는 숫자와 영문자를 최소 1개 이상 포함해야 합니다.',
      );
    });

    it('영문자 없이 숫자만 있을 때 에러 반환', () => {
      expect(validatePassword('12345678')).toBe(
        '비밀번호는 숫자와 영문자를 최소 1개 이상 포함해야 합니다.',
      );
      expect(validatePassword('123456789')).toBe(
        '비밀번호는 숫자와 영문자를 최소 1개 이상 포함해야 합니다.',
      );
    });

    it('유효한 password 입력 시 null 반환', () => {
      expect(validatePassword('password1')).toBeNull();
      expect(validatePassword('Pass1234')).toBeNull();
      expect(validatePassword('myPassword123')).toBeNull();
      expect(validatePassword('a'.repeat(7) + '1')).toBeNull();
      expect(validatePassword('a'.repeat(31) + '1')).toBeNull();
    });

    it('특수문자 포함 password 허용', () => {
      expect(validatePassword('pass!@#$1')).toBeNull();
      expect(validatePassword('P@ssw0rd')).toBeNull();
      expect(validatePassword('my_Pass123')).toBeNull();
    });

    it('대소문자 혼합 password 허용', () => {
      expect(validatePassword('MyPassword1')).toBeNull();
      expect(validatePassword('PassWord123')).toBeNull();
    });

    it('최소 길이(8자)와 최대 길이(32자) 경계값 테스트', () => {
      expect(validatePassword('passwor1')).toBeNull();
      expect(validatePassword('a'.repeat(31) + '1')).toBeNull();
      expect(validatePassword('passwor')).toBe(
        '비밀번호는 8자 이상이어야 합니다.',
      );
      expect(validatePassword('a'.repeat(32) + '1')).toBe(
        '비밀번호는 32자 이하여야 합니다.',
      );
    });
  });
});
