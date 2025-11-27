import { useLogin } from '@/hooks/mutations/useAuthMutations';
import { validatePassword, validateUsername } from '@/utils/authValidation';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import AuthInput from '@/components/auth/AuthInput';
import AuthButton from '@/components/auth/AuthButton';

export default function LoginScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loginMutation = useLogin();

  // 화면 벗어날 때 에러 초기화
  useFocusEffect(
    useCallback(() => {
      return () => setErrorMessage(null);
    }, []),
  );

  const handleSubmit = () => {
    const usernameError = validateUsername(username);
    const passwordError = validatePassword(password);

    if (usernameError || passwordError) {
      setErrorMessage(usernameError || passwordError);
      return;
    }
    setErrorMessage(null);

    loginMutation.mutate(
      { username, password },
      {
        onSuccess: () => router.replace('/'),
        onError: (error) => {
          setErrorMessage(error.message ?? '로그인에 실패했습니다.');
        },
      },
    );
  };

  const disabled = !username || !password || loginMutation.isPending;

  return (
    <LinearGradient
      colors={['#0C4A6E', '#0284C7', '#7DD3FC']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      className="flex-1"
    >
      <KeyboardAwareScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        enableOnAndroid
        enableAutomaticScroll
        keyboardShouldPersistTaps="handled"
        extraScrollHeight={60}
        extraHeight={0}
      >
        <View className="flex-1 justify-center px-6 py-12">
          <View className="w-full max-w-md self-center">
            {/* 헤더 */}
            <View className="mb-10">
              <Text className="mb-2 text-center text-[46px] font-extrabold text-white tracking-tight">
                LingoFit
              </Text>
              <Text className="text-center text-[15px] text-white/90">
                듣는 만큼 영어가 된다
              </Text>
            </View>

            {/* 카드 */}
            <View className="rounded-3xl bg-white p-6 shadow-[0px_6px_20px_rgba(2,132,199,0.18)]">
              <AuthInput
                label="아이디"
                leftIcon="person-outline"
                value={username}
                onChangeText={(t) => {
                  setUsername(t);
                  if (errorMessage) setErrorMessage(null);
                }}
                autoCapitalize="none"
                textContentType="username"
                placeholder="아이디를 입력하세요"
                editable={!loginMutation.isPending}
                returnKeyType="next"
                containerClassName="mb-5"
              />

              <AuthInput
                label="비밀번호"
                leftIcon="lock-closed-outline"
                value={password}
                onChangeText={(t) => {
                  setPassword(t);
                  if (errorMessage) setErrorMessage(null);
                }}
                secureTextEntry
                textContentType="password"
                placeholder="비밀번호를 입력하세요"
                editable={!loginMutation.isPending}
                onSubmitEditing={handleSubmit}
                returnKeyType="done"
              />

              {errorMessage ? (
                <View className="mt-3 rounded-lg bg-red-50 px-3 py-2.5">
                  <Text className="text-[13px] font-medium text-red-600">
                    {errorMessage}
                  </Text>
                </View>
              ) : null}

              <AuthButton
                title="로그인"
                onPress={handleSubmit}
                disabled={disabled}
                loading={loginMutation.isPending}
                className="mt-6"
              />
            </View>

            {/* 하단 링크 (유지) */}
            <View className="mt-8">
              <Pressable
                onPress={() => router.push('/signup')}
                disabled={loginMutation.isPending}
                android_ripple={{
                  color: 'rgba(255,255,255,0.25)',
                  borderless: true,
                }}
              >
                <Text className="text-center text-base text-white/95">
                  계정이 없으신가요?{' '}
                  <Text className="font-bold text-white">회원가입</Text>
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </LinearGradient>
  );
}
