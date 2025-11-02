import TrackPlayer, { Event } from 'react-native-track-player';

// RNTP가 불러가는 백그라운드 서비스 함수 (반환값 없음)
export const PlaybackService = async function () {
  // ▶︎ / ❚❚ (알림·제어센터 버튼)
  TrackPlayer.addEventListener(Event.RemotePlay, () => TrackPlayer.play());
  TrackPlayer.addEventListener(Event.RemotePause, () => TrackPlayer.pause());
  TrackPlayer.addEventListener(Event.RemoteStop, () => TrackPlayer.stop());

  // ◀︎◀︎ / ▶︎▶︎ (필요하면 capabilities에도 추가해야 동작)
  TrackPlayer.addEventListener(Event.RemoteNext, () =>
    TrackPlayer.skipToNext().catch(() => {}),
  );
  TrackPlayer.addEventListener(Event.RemotePrevious, () =>
    TrackPlayer.skipToPrevious().catch(() => {}),
  );

  // 시크 바 조작
  TrackPlayer.addEventListener(Event.RemoteSeek, ({ position }) =>
    TrackPlayer.seekTo(position),
  );

  // 특별히 리턴할 것은 없음 (리스너만 등록)
};
