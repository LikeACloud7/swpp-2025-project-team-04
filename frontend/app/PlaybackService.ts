import TrackPlayer, { Event } from 'react-native-track-player';

export const PlaybackService = async () => {
  console.log('[TP] service started');
  TrackPlayer.addEventListener(Event.RemotePlay, () => {
    console.log('[TP] RemotePlay');
    TrackPlayer.play();
  });
  TrackPlayer.addEventListener(Event.RemotePause, () => {
    console.log('[TP] RemotePause');
    TrackPlayer.pause();
  });
  TrackPlayer.addEventListener(Event.RemoteNext, () => {
    console.log('[TP] RemoteNext');
    TrackPlayer.skipToNext().catch(() => {});
  });
  TrackPlayer.addEventListener(Event.RemotePrevious, () => {
    console.log('[TP] RemotePrevious');
    TrackPlayer.skipToPrevious().catch(() => {});
  });
  TrackPlayer.addEventListener(Event.RemoteSeek, (e) => {
    console.log('[TP] RemoteSeek', e.position);
    TrackPlayer.seekTo(e.position);
  });
};
