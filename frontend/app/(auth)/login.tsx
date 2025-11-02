import { useLogin } from '@/hooks/mutations/useAuthMutations';
import { validatePassword, validateUsername } from '@/utils/authValidation';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';

export default function LoginScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isFocusedUsername, setIsFocusedUsername] = useState(false);
  const [isFocusedPassword, setIsFocusedPassword] = useState(false);

  const loginMutation = useLogin();

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
        onSuccess: () => {
          router.replace('/');
        },
        onError: (error) => {
          setErrorMessage(error.message ?? 'Login failed. Please try again.');
        },
      },
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: 'padding', android: undefined })}
      style={{ flex: 1 }}
    >
      <View className="flex-1 bg-primary">
        <View className="flex-1 justify-center px-6 py-12">
          <View className="w-full max-w-md self-center">
            <View className="mb-10">
              <Text className="mb-3 text-center text-5xl font-bold text-white">
                LingoFit
              </Text>
              <Text className="text-center text-base text-white/90">
                듣는 만큼 영어가 된다
              </Text>
            </View>

            <View className="rounded-2xl bg-white p-6 shadow-lg">
              <View className="mb-5">
                <Text className="mb-2 text-sm font-semibold text-neutral-700">
                  아이디
                </Text>
                <View
                  className={`overflow-hidden rounded-xl border-2 bg-neutral-50 ${
                    isFocusedUsername
                      ? 'border-primary'
                      : errorMessage
                        ? 'border-red-400'
                        : 'border-neutral-200'
                  }`}
                >
                  <TextInput
                    value={username}
                    onChangeText={(text) => {
                      setUsername(text);
                      setErrorMessage(null);
                    }}
                    onFocus={() => setIsFocusedUsername(true)}
                    onBlur={() => setIsFocusedUsername(false)}
                    autoCapitalize="none"
                    textContentType="username"
                    placeholder="아이디를 입력하세요"
                    placeholderTextColor="#9ca3af"
                    className="px-4 py-3.5 text-base text-neutral-900"
                    editable={!loginMutation.isPending}
                  />
                </View>
              </View>

              <View className="mb-2">
                <Text className="mb-2 text-sm font-semibold text-neutral-700">
                  비밀번호
                </Text>
                <View
                  className={`overflow-hidden rounded-xl border-2 bg-neutral-50 ${
                    isFocusedPassword
                      ? 'border-primary'
                      : errorMessage
                        ? 'border-red-400'
                        : 'border-neutral-200'
                  }`}
                >
                  <TextInput
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      setErrorMessage(null);
                    }}
                    onFocus={() => setIsFocusedPassword(true)}
                    onBlur={() => setIsFocusedPassword(false)}
                    secureTextEntry
                    textContentType="password"
                    placeholder="비밀번호를 입력하세요"
                    placeholderTextColor="#9ca3af"
                    className="px-4 py-3.5 text-base text-neutral-900"
                    editable={!loginMutation.isPending}
                    onSubmitEditing={handleSubmit}
                  />
                </View>
              </View>

              {errorMessage ? (
                <View className="mb-4 rounded-lg bg-red-50 p-3">
                  <Text className="text-sm font-medium text-red-600">
                    {errorMessage}
                  </Text>
                </View>
              ) : null}

              <Pressable
                className={`mt-4 rounded-xl py-4 ${
                  loginMutation.isPending
                    ? 'bg-primary/60'
                    : 'bg-primary active:bg-primary/90'
                }`}
                onPress={handleSubmit}
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? (
                  <View className="flex-row items-center justify-center">
                    <ActivityIndicator color="white" size="small" />
                    <Text className="ml-2 text-center text-base font-semibold text-white">
                      로그인 중...
                    </Text>
                  </View>
                ) : (
                  <Text className="text-center text-base font-semibold text-white">
                    로그인
                  </Text>
                )}
              </Pressable>
            </View>

            <View className="mt-8">
              <Pressable
                onPress={() => {
                  router.push('/signup');
                }}
                disabled={loginMutation.isPending}
              >
                <Text className="text-center text-base text-white/90">
                  계정이 없으신가요?{' '}
                  <Text className="font-bold text-white">회원가입</Text>
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
