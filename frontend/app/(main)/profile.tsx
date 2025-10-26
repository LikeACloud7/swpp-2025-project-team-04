import Button from '@/components/home/Button';
import { useLogout } from '@/hooks/mutations/useAuthMutations';
import { useUser } from '@/hooks/queries/useUserQueries';
import { useRouter } from 'expo-router';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';

export default function ProfileScreen() {
  const router = useRouter();
  const { data: user, isLoading: isAuthLoading } = useUser();

  const logout = useLogout();

  return (
    <View className="flex-1 bg-[#EBF4FB]">
      <ScrollView
        className="flex-1 px-5 pt-6"
        contentContainerStyle={{ paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <View className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
          <View className="items-center">
            <View className="mb-4 h-20 w-20 items-center justify-center rounded-full bg-primary">
              <Text className="text-3xl font-bold text-white">
                {isAuthLoading ? '?' : user?.nickname?.[0]?.toUpperCase() || 'U'}
              </Text>
            </View>
            {isAuthLoading ? (
              <ActivityIndicator color="#0ea5e9" size="small" />
            ) : (
              <>
                <Text className="mb-1 text-2xl font-bold text-neutral-900">
                  {user?.nickname || 'Unknown User'}
                </Text>
                <Text className="text-base text-neutral-500">
                  @{user?.username || 'username'}
                </Text>
              </>
            )}
          </View>
        </View>

        {/* Logout Button */}
        <View className="px-2">
          <Button
            title="로그아웃"
            onPress={logout}
            disabled={isAuthLoading || !user}
            style={{ width: '100%' }}
          />
        </View>
      </ScrollView>
    </View>
  );
}
