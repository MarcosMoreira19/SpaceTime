import { useEffect, useState } from 'react';
import { TouchableOpacity, ScrollView, View, Text, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Link, useRouter } from 'expo-router';
import { ResizeMode, Video } from 'expo-av';
import * as SecureStore from 'expo-secure-store';
import Icon from '@expo/vector-icons/Feather';
import dayjs from 'dayjs';
import ptBr from 'dayjs/locale/pt-br';

import NLWLogo from '../src/assets/nlw-spacetime-logo.svg';
import { api } from '../src/lib/api';

dayjs.locale(ptBr);

interface Memory {
  coverUrl: string;
  excerpt: string;
  createdAt: string;
  id: string;
}

export default function Memories() {
  const { bottom, top } = useSafeAreaInsets();
  const router = useRouter();
  const [memories, setMemories] = useState<Memory[]>([]);

  async function signOut() {
    await SecureStore.deleteItemAsync('token');

    router.push('/');
  }

  async function loadMemories() {
    const token = await SecureStore.getItemAsync('token');

    const response = await api.get('/memories', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setMemories(response.data);
  }

  useEffect(() => {
    loadMemories();
  }, []);

  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{
        paddingBottom: bottom + 10,
        paddingTop: top,
      }}
    >
      <View className="mt-4 flex-row items-center justify-between px-8">
        <NLWLogo />

        <View className="flex-row gap-2">
          <TouchableOpacity
            className="h-10 w-10 items-center justify-center rounded-full bg-red-500"
            onPress={signOut}
          >
            <Icon name="log-out" size={16} color={'#000'} />
          </TouchableOpacity>

          <Link href="/new" asChild>
            <TouchableOpacity className="h-10 w-10 items-center justify-center rounded-full bg-green-500">
              <Icon name="plus" size={16} color={'#000'} />
            </TouchableOpacity>
          </Link>
        </View>
      </View>

      <View className="mt-6 space-y-10">
        {memories.map((memory) => {
          const coverType = memory.coverUrl.slice(-3);

          return (
            <View key={memory.id} className="space-y-4">
              <View className="flex-row items-center gap-2">
                <View className="h-px w-5 bg-gray-50" />
                <Text className="font-body text-xs text-gray-100">
                  {dayjs(memory.createdAt).format('D[ de ]MMMM[, ]YYYY')}
                </Text>
              </View>

              <View className="space-y-4 px-8">
                {coverType === 'jpg' || coverType === 'png' ? (
                  <Image
                    source={{
                      uri: memory.coverUrl,
                    }}
                    className="aspect-video w-full rounded-lg"
                    alt=""
                  />
                ) : (
                  <Video
                    source={{ uri: memory.coverUrl }}
                    useNativeControls={false}
                    resizeMode={ResizeMode.COVER}
                    className="aspect-video w-full rounded-lg"
                  />
                )}

                <Text className="font-body text-base leading-relaxed text-gray-200">
                  {memory.excerpt}
                </Text>

                <Link href="/memories/id" asChild>
                  <TouchableOpacity className="flex-row items-center gap-2">
                    <Text className="font-body text-sm text-gray-200">
                      Ler mais
                    </Text>
                    <Icon name="arrow-right" size={16} color={'#9e9ea0'}></Icon>
                  </TouchableOpacity>
                </Link>
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}
