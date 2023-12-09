import { Link, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ScrollView,
  Text,
  TextInput,
  View,
  Switch,
  TouchableOpacity,
} from 'react-native';
import { Video, ResizeMode, AVPlaybackStatusSuccess } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import Icon from '@expo/vector-icons/Feather';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as SecureStore from 'expo-secure-store';

import NLWLogo from '../src/assets/nlw-spacetime-logo.svg';
import { Image } from 'react-native';
import { api } from '../src/lib/api';

export default function NewMemory() {
  const { bottom, top } = useSafeAreaInsets();
  const router = useRouter();

  const [isPublic, setIsPublic] = useState(false);
  const [content, setContent] = useState('');
  const [preview, setPreview] = useState<string | null>(null);

  const [isVideo, setIsVideo] = useState(false);
  const video = useRef<Video | null>(null);
  const [status, setStatus] = useState({} as AVPlaybackStatusSuccess);

  async function openImagePicker() {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        quality: 1,
      });

      if (result.assets[0]) {
        result.assets[0].type === 'video'
          ? setIsVideo(true)
          : setIsVideo(false);

        setPreview(result.assets[0].uri);
      }
    } catch (error) {
      console.log(error);
    }
  }

  async function handleCreateMemory() {
    const token = await SecureStore.getItemAsync('token');

    let coverUrl = '';

    if (preview) {
      const uploadFormData = new FormData();

      if (isVideo) {
        uploadFormData.append('file', {
          uri: preview,
          name: 'video.mp4',
          type: 'video/mp4',
        } as any);
      } else {
        uploadFormData.append('file', {
          uri: preview,
          name: 'image.jpg',
          type: 'image/jpeg',
        } as any);
      }

      const uploadResponse = await api.post('/upload', uploadFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      coverUrl = uploadResponse.data.fileUrl;

      await api.post(
        '/memories',
        {
          content,
          isPublic,
          coverUrl,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      router.push('/memories');
    }
  }

  return (
    <ScrollView
      className="flex-1 px-8"
      contentContainerStyle={{
        paddingBottom: bottom + 10,
        paddingTop: top,
      }}
    >
      <View className="mt-4 flex-row items-center justify-between">
        <NLWLogo />

        <Link href="/memories" asChild>
          <TouchableOpacity className="h-10 w-10 items-center justify-center rounded-full bg-purple-500">
            <Icon name="arrow-left" size={16} color={'#fff'} />
          </TouchableOpacity>
        </Link>
      </View>

      <View className="mt-6 space-y-6">
        <View className="flex-row items-center gap-2">
          <Switch
            value={isPublic}
            onValueChange={setIsPublic}
            trackColor={{
              false: '#767577',
              true: '#372560',
            }}
            thumbColor={isPublic ? '#9b79ea' : '#9e9ea0'}
          />

          <Text className="font-body text-base text-gray-200">
            Tornar memória pública
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={openImagePicker}
          className="h-56 items-center justify-center rounded-lg border border-dashed border-gray-700 bg-black/20"
        >
          {preview ? (
            isVideo ? (
              <Video
                source={{ uri: preview }}
                useNativeControls={false}
                resizeMode={ResizeMode.COVER}
                className="h-full w-full rounded-lg object-cover"
                ref={video}
                isLooping
                shouldPlay={false}
                onPlaybackStatusUpdate={(status) => {
                  if (!status.isLoaded) return;
                  setStatus(() => status as AVPlaybackStatusSuccess);
                }}
              />
            ) : (
              <Image
                source={{ uri: preview }}
                className="h-full w-full rounded-lg object-cover"
              />
            )
          ) : (
            <View className="flex-row items-center gap-2">
              <Icon name="image" color={'#fff'} />

              <Text className="font-body text-sm text-gray-200">
                Adicionar foto ou vídeo de capa
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {preview && isVideo && (
          <View className="flex-row items-center justify-center space-x-8">
            <TouchableOpacity
              className="items-center rounded-full bg-green-500 p-3"
              activeOpacity={0.7}
              onPress={() =>
                video.current.setPositionAsync(status.positionMillis - 5000)
              }
            >
              <Ionicons name="play-back" size={24} />
            </TouchableOpacity>

            <TouchableOpacity
              className="items-center rounded-full bg-green-500 p-3"
              activeOpacity={0.7}
              onPress={() =>
                status.isPlaying
                  ? video.current.pauseAsync()
                  : video.current.playAsync()
              }
            >
              <Ionicons name={status.isPlaying ? 'pause' : 'play'} size={24} />
            </TouchableOpacity>

            <TouchableOpacity
              className="items-center rounded-full bg-green-500 p-3"
              activeOpacity={0.7}
              onPress={() =>
                video.current.setPositionAsync(status.positionMillis + 5000)
              }
            >
              <Ionicons name="play-forward" size={24} />
            </TouchableOpacity>
          </View>
        )}

        <TextInput
          multiline
          value={content}
          onChangeText={setContent}
          textAlignVertical="top"
          className="p-0 font-body text-lg text-gray-50"
          placeholderTextColor={'#56565a'}
          placeholder="Fique livre para adicionar fotos, vídeos e relatos sobre essa experiência que você quer lembrar para sempre"
        />

        <TouchableOpacity
          className="items-center self-end rounded-full bg-green-500 px-5 py-3"
          activeOpacity={0.7}
          onPress={handleCreateMemory}
        >
          <Text className="font-alt text-sm uppercase text-black">Salvar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
