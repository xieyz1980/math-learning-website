'use client';

import { useState, useRef, useEffect } from 'react';

interface VideoPlayerProps {
  videoUrl: string;
  videoType?: 'bilibili' | 'youtube' | 'iframe' | 'direct';
  title?: string;
}

export function VideoPlayer({ videoUrl, videoType = 'bilibili', title }: VideoPlayerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 解析B站视频ID
  const getBilibiliEmbedUrl = (url: string) => {
    const bvMatch = url.match(/BV([a-zA-Z0-9]+)/);
    if (bvMatch) {
      return `https://player.bilibili.com/player.html?bvid=BV${bvMatch[1]}&high_quality=1&autoplay=0`;
    }
    return null;
  };

  // 解析YouTube视频ID
  const getYoutubeEmbedUrl = (url: string) => {
    const youtubeRegex =
      /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(youtubeRegex);
    if (match) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }
    return null;
  };

  // 获取最终的视频URL
  const getFinalVideoUrl = () => {
    if (videoType === 'bilibili') {
      const embedUrl = getBilibiliEmbedUrl(videoUrl);
      if (embedUrl) return embedUrl;
    }

    if (videoType === 'youtube') {
      const embedUrl = getYoutubeEmbedUrl(videoUrl);
      if (embedUrl) return embedUrl;
    }

    // iframe 或 direct 类型直接使用原URL
    return videoUrl;
  };

  const handleLoad = () => {
    setIsLoading(false);
    setError(null);
  };

  const handleError = () => {
    setIsLoading(false);
    setError('视频加载失败，请检查视频链接是否有效');
  };

  const finalVideoUrl = getFinalVideoUrl();

  return (
    <div className="w-full bg-gray-900 rounded-lg overflow-hidden relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2" />
            <p className="text-sm">加载中...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
          <div className="text-center p-4">
            <div className="text-red-500 mb-2">
              <svg
                className="w-12 h-12 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p className="text-white mb-2">{error}</p>
            <p className="text-gray-400 text-sm">提示：如果是B站视频，请使用BV号链接</p>
          </div>
        </div>
      )}

      <iframe
        src={finalVideoUrl}
        className="w-full aspect-video"
        allowFullScreen
        title={title || '视频播放'}
        onLoad={handleLoad}
        onError={handleError}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        sandbox="allow-same-origin allow-scripts allow-presentation allow-forms"
      />
    </div>
  );
}
