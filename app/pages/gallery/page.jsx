"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";

// Dynamically import Plyr with no SSR
const Plyr = dynamic(() => import("plyr"), {
  ssr: false, // This will only load Plyr on the client side
});

// Add new VideoWrapper component
const VideoWrapper = ({ video, onClose }) => {
  const playerRef = useRef(null);
  const [localPlayer, setLocalPlayer] = useState(null);
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    let timer;
    
    const initPlayer = async () => {
      if (!playerRef.current || !isMounted.current) return;

      try {
        const PlyrModule = await import('plyr');
        if (!isMounted.current) return;

        const newPlayer = new PlyrModule.default(playerRef.current, {
          loadSprite: false,
          controls: [
            'play-large',
            'play',
            'progress',
            'current-time',
            'duration',
            'mute',
            'fullscreen',
          ],
        });

        if (!isMounted.current) {
          newPlayer.destroy();
          return;
        }

        setLocalPlayer(newPlayer);
      } catch (error) {
        console.error('Player initialization error:', error);
      }
    };

    timer = setTimeout(initPlayer, 100);

    return () => {
      clearTimeout(timer);
      if (localPlayer) {
        try {
          localPlayer.pause();
          localPlayer.destroy();
        } catch (err) {
          console.error('Cleanup error:', err);
        }
      }
    };
  }, [video]);

  if (!video) return null;

  return (
    <div className="relative w-full h-full">
      {video.type === "youtube" ? (
        <div ref={playerRef} className="plyr__video-embed w-full h-full">
          <iframe
            key={video.url}
            src={`https://www.youtube.com/embed/${video.url}?origin=${typeof window !== 'undefined' ? window.location.origin : ''}&iv_load_policy=3&modestbranding=1&playsinline=1&showinfo=0&rel=0&enablejsapi=1`}
            allowFullScreen
            allow="autoplay"
          />
        </div>
      ) : (
        <video
          ref={playerRef}
          key={video.url}
          className="plyr-react plyr"
          poster={video.thumbnail}
        >
          <source src={video.url} type="video/mp4" />
        </video>
      )}
    </div>
  );
};

const Page = () => {
  const [activeTab, setActiveTab] = useState("photos");
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedVideo, setSelectedVideo] = useState(null);
  const videoPlayerRef = useRef(null);
  const [player, setPlayer] = useState(null);
  const [isVideoLoading, setIsVideoLoading] = useState(true);
  const [gridKey, setGridKey] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  const photos = [
    {
      src: "/images/logos/3.jpg",
      title: "Academy Logo 3",
      category: "logos",
      uploadDate: "2024-01-15T10:30:00Z",
    },
    {
      src: "/images/logos/2.jpg",
      title: "Academy Logo 2",
      category: "logos",
      uploadDate: "2024-01-14T15:45:00Z",
    },
    {
      src: "/images/logos/1.jpg",
      title: "Academy Logo 1",
      category: "logos",
    },
    // Add more photos with categories
  ];

  const videos = [
    {
      type: "youtube",
      url: "dQw4w9WgXcQ", // Just the video ID for YouTube
      thumbnail: "/images/default-video-thumbnail.jpg",
      title: "Academy Overview",
      category: "overview",
      uploadDate: "2024-01-13T09:20:00Z",
    },
    {
      type: "video",
      url: "https://firebasestorage.googleapis.com/v0/b/image-upload-51e97.appspot.com/o/videos%2FRaushan.mp4?alt=media&token=5b266048-5c14-4ae1-b8a7-91a60283e775", // Direct video file URL
      thumbnail: "/images/default-video-thumbnail.jpg",
      title: "Student Success Stories",
      category: "students",
    },
    {
      type: "youtube",
      url: "M7lc1UVf-VE",
      thumbnail: "/images/default-video-thumbnail.jpg",
      title: "Student Success Stories",
      category: "students",
    },
    {
      type: "youtube",
      url: "M7lc1UVf-VE",
      thumbnail: "/images/default-video-thumbnail.jpg",
      title: "Student Success Stories",
      category: "students",
    },
    {
      type: "youtube",
      url: "M7lc1UVf-VE",
      thumbnail: "/images/default-video-thumbnail.jpg",
      title: "Student Success Stories",
      category: "students",
    },
    {
      type: "youtube",
      url: "M7lc1UVf-VE",
      thumbnail: "/images/default-video-thumbnail.jpg",
      title: "Student Success Stories",
      category: "students",
    },
    {
      type: "youtube",
      url: "M7lc1UVf-VE",
      thumbnail: "/images/default-video-thumbnail.jpg",
      title: "Student Success Stories",
      category: "students",
    },
  ];

  const categories = ["all", "logos", "events", "students", "overview"];

  // Enhanced search debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      // Update filtered results
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Filter function
  const filterItems = (items) => {
    const filtered = items.filter((item) => {
      const matchesSearch = item.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
    return filtered;
  };

  // Add sorting function
  const sortItems = (items) => {
    return items.sort((a, b) => a.title.localeCompare(b.title));
  };

  // New sorting function by date
  const sortByDate = (items) => {
    return items.sort(
      (a, b) => new Date(b.uploadDate) - new Date(a.uploadDate)
    );
  };

  // Updated date formatting function
  const formatDate = (dateString) => {
    if (!dateString) return "";

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "";

      const now = new Date();
      const diffTime = date.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Handle different time ranges
      if (Math.abs(diffDays) > 30) {
        return date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
      }

      const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
      if (Math.abs(diffDays) < 1) {
        const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
        return rtf.format(diffHours, "hour");
      }

      return rtf.format(diffDays, "day");
    } catch (error) {
      console.error("Date formatting error:", error);
      return dateString; // Fallback to original string
    }
  };

  // Simplified getCurrentItems function
  const getCurrentItems = () => {
    const items =
      activeTab === "photos"
        ? filterItems(photos).map((item) => ({
            ...item,
            type: "photo",
            uniqueId: `photo-${item.src}`, // Add stable unique ID
          }))
        : filterItems(videos).map((item) => ({
            ...item,
            uniqueId: `video-${item.url}`, // Add stable unique ID
          }));
    return sortByDate(items);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  // Add custom Plyr options
  const plyrOptions = {
    controls: [
      "play-large",
      "play",
      "progress",
      "current-time",
      "duration",
      "mute",
      // 'volume',
      // 'settings',
      // 'pip',
      "fullscreen",
    ],
    // settings: ['quality', 'speed'],
    // speed: { selected: 1, options: [0.5, 0.75, 1, 1.25, 1.5, 2] },
    youtube: {
      noCookie: true,
      rel: 0,
      showinfo: 0,
      iv_load_policy: 3,
      modestbranding: 1,
      customControls: true,
      playsinline: true,
    },
    tooltips: { controls: true, seek: true },
    keyboard: { focused: true, global: true },
  };

  // Initialize player with dynamic import
  useEffect(() => {
    let newPlayer = null;
    let timer = null;

    if (selectedVideo && videoPlayerRef.current && typeof window !== "undefined") {
      setIsVideoLoading(true);

      // Small delay to ensure DOM is ready
      timer = setTimeout(() => {
        try {
          import("plyr").then((PlyrModule) => {
            if (videoPlayerRef.current) { // Check if ref is still valid
              newPlayer = new PlyrModule.default(videoPlayerRef.current, {
                ...plyrOptions,
                loadSprite: false,
              });

              newPlayer.on("ready", () => {
                setIsVideoLoading(false);
                setPlayer(newPlayer);
              });

              newPlayer.on("error", (error) => {
                console.error("Plyr error:", error);
                setIsVideoLoading(false);
              });
            }
          });
        } catch (error) {
          console.error("Player initialization error:", error);
          setIsVideoLoading(false);
        }
      }, 100);
    }

    return () => {
      clearTimeout(timer);
      if (newPlayer) {
        try {
          newPlayer.destroy();
        } catch (error) {
          console.error("Player cleanup error:", error);
        }
      }
    };
  }, [selectedVideo]);

  // Update tabs array
  const tabs = ["photos", "videos"];

  // Add video icon components
  const PlayIcon = () => (
    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
      <path d="M8 5v14l11-7z" />
    </svg>
  );

  const YoutubeIcon = () => (
    <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );

  // Updated Gallery Grid section
  const renderGalleryItem = (item) => (
    <motion.div
      key={item.uniqueId}
      variants={itemVariants}
      layout
      className={`relative ${
        item.type === "photo" ? "aspect-[4/3]" : "aspect-video"
      } group cursor-pointer rounded-xl overflow-hidden shadow-lg h-full`} // Added h-full
      onClick={() =>
        item.type === "photo" ? setSelectedPhoto(item) : setSelectedVideo(item)
      }
    >
      <Image
        src={item.type === "photo" ? item.src : item.thumbnail}
        alt={item.title}
        fill
        className="object-cover transition-transform duration-500 group-hover:scale-110"
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        onLoadingComplete={() => setIsLoading(false)}
      />
      {item.type === "video" && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className={`w-16 h-16 ${
              item.type === "youtube" ? "bg-red-600/90" : "bg-blue-600/90"
            } rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300`}
          >
            {item.type === "youtube" ? <YoutubeIcon /> : <PlayIcon />}
          </div>
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <p className="text-white text-sm font-medium">{item.title}</p>
          {item.uploadDate && (
            <p className="text-gray-300 text-xs mt-1">
              {formatDate(item.uploadDate)}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );

  const handleTabChange = (tab) => {
    setIsExiting(true);
    setTimeout(() => {
      setActiveTab(tab);
      setGridKey((prev) => prev + 1);
      setIsExiting(false);
    }, 300); // Match this with your animation duration
  };

  // Replace VideoPlayer component with VideoWrapper
  const handleCloseVideo = useCallback(() => {
    if (player) {
      try {
        player.pause();
      } catch (err) {
        console.error('Error pausing player:', err);
      }
    }
    setSelectedVideo(null);
  }, [player]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4 sm:py-12 sm:px-6 lg:px-8">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-7xl mx-auto"
      >
        <motion.div className="text-center mb-12" variants={itemVariants}>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-white mb-4">
            Our Gallery
          </h1>
          <p className="text-xl text-red-600 dark:text-red-400">
            Capturing Our Journey
          </p>
        </motion.div>

        {/* Enhanced Search and Filter Section */}
        <motion.div
          variants={itemVariants}
          className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg py-4 px-4 rounded-xl mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative w-full md:w-64">
              <input
                type="text"
                placeholder="Search gallery..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300"
              />
              <svg
                className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <motion.div
              className="flex flex-wrap justify-center gap-2"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { staggerChildren: 0.05 },
                },
              }}
            >
              {categories.map((category) => (
                <motion.button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-1 rounded-full text-sm capitalize transform transition-all duration-300
                                        ${
                                          selectedCategory === category
                                            ? "bg-red-600 text-white scale-105 shadow-lg"
                                            : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                                        }`}
                >
                  {category}
                </motion.button>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* Enhanced Tab Navigation */}
        <motion.div
          className="flex justify-center space-x-4 mb-8"
          variants={itemVariants}
        >
          {tabs.map((tab) => (
            <motion.button
              key={tab}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-6 py-2 rounded-full text-sm sm:text-base font-medium capitalize
                                ${
                                  activeTab === tab
                                    ? "bg-red-600 text-white shadow-lg"
                                    : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600"
                                } transition duration-300`}
              onClick={() => handleTabChange(tab)}
            >
              {tab}
            </motion.button>
          ))}
        </motion.div>

        {/* Updated Gallery Grid */}
        <div className="relative min-h-[200px]">
          {" "}
          {/* Add minimum height to prevent layout shift */}
          <motion.div
            key={gridKey}
            layout
            variants={containerVariants}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr"
            style={{
              display: isExiting ? "none" : "grid",
            }}
          >
            <AnimatePresence mode="wait" initial={false}>
              {getCurrentItems().map(renderGalleryItem)}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Enhanced Lightbox */}
        <AnimatePresence>
          {selectedPhoto && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedPhoto(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative w-full max-w-7xl h-[80vh] rounded-xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <Image
                  src={selectedPhoto.src}
                  alt={selectedPhoto.title}
                  fill
                  quality={100}
                  priority
                  className="object-contain"
                />
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 to-transparent">
                  <h3 className="text-xl font-medium text-white">
                    {selectedPhoto.title}
                  </h3>
                  <p className="text-gray-300 mt-1 capitalize">
                    {selectedPhoto.category}
                  </p>
                </div>
                <button
                  className="absolute top-4 right-4 text-white bg-red-600/80 hover:bg-red-600 rounded-full p-2 backdrop-blur-sm transition-all duration-300"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPhoto(null);
                  }}
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Video Lightbox */}
        <AnimatePresence mode="wait">
          {selectedVideo && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6 md:p-8"
              onClick={handleCloseVideo}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative w-full max-w-4xl mx-auto rounded-xl overflow-hidden bg-black shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="relative pt-[56.25%]">
                  {isVideoLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                      <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                  <div className="absolute top-0 left-0 w-full h-full">
                    <VideoWrapper video={selectedVideo} onClose={handleCloseVideo} />
                  </div>
                </div>

                {/* Enhanced Close Button */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute top-4 right-4 text-white bg-red-600/80 hover:bg-red-600 rounded-full p-2 backdrop-blur-sm transition-all duration-300 z-10 group"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (player) {
                      player.pause();
                    }
                    setSelectedVideo(null);
                  }}
                >
                  <svg
                    className="w-6 h-6 transform group-hover:rotate-90 transition-transform duration-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Page;
