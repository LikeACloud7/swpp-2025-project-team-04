import TrackPlayer from 'react-native-track-player';
import { PlaybackService } from './app/PlaybackService';

console.log('[TP] register');
TrackPlayer.registerPlaybackService(() => {
  console.log('[TP] service passed');
  return PlaybackService;
});

require('expo-router/entry-classic');
