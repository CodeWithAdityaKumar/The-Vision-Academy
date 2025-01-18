'use client';

import { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';

const Plyr = dynamic(() => import('plyr'), {
    ssr: false
});

export default function VideoPlayer({ video }) {
    const videoRef = useRef(null);
    const playerRef = useRef(null);

    useEffect(() => {
        if (!videoRef.current) return;

        playerRef.current = new Plyr(videoRef.current, {
            controls: ['play', 'progress', 'current-time', 'mute', 'volume', 'fullscreen'],
        });

        return () => {
            if (playerRef.current) {
                playerRef.current.destroy();
            }
        };
    }, [video]);

    if (!video) return null;

    return video.type === 'youtube' ? (
        <div ref={videoRef} className="plyr__video-embed">
            <iframe
                src={`https://www.youtube.com/embed/${video.url}?origin=${typeof window !== 'undefined' ? window.location.origin : ''}&iv_load_policy=3&modestbranding=1&playsinline=1&showinfo=0&rel=0&enablejsapi=1`}
                allowFullScreen
                allow="autoplay"
            />
        </div>
    ) : (
        <video
            ref={videoRef}
            className="plyr-react plyr"
            poster={video.thumbnail}
        >
            <source src={video.url} type="video/mp4" />
        </video>
    );
}