import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";

export default function useProximityToast(secretPlace, message) {
  const [isInSecretPlace, setIsInSecretPlace] = useState(false);
  const [seasonTheme, setSeasonTheme] = useState("default");
  const audioRef = useRef(null);
  const unlockedRef = useRef(false);

  const getSeasonalAudio = () => {
    const month = new Date().getMonth(); // 0 = Jan ... 11 = Dec
    if (month === 9 || month === 10) {
      setSeasonTheme("halloween");
      return "/Halloween.mp3";
    } else if (month === 11 || month === 0 || month === 1) {
      setSeasonTheme("christmas");
      return "/Christmas.mp3";
    } else {
      setSeasonTheme("default");
      return "/SecretSound.mp3";
    }
  };

  useEffect(() => {
    if (!audioRef.current) {
      const audioPath = getSeasonalAudio();
      audioRef.current = new Audio(audioPath);
      audioRef.current.preload = "auto";
    }

    const unlockAudio = () => {
      if (audioRef.current && !unlockedRef.current) {
        audioRef.current.play().then(() => {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
          unlockedRef.current = true;
          console.log("Audio unlocked for season:", seasonTheme);
        }).catch(err => console.warn("Unlock failed:", err));
      }
      document.removeEventListener("click", unlockAudio);
    };

    document.addEventListener("click", unlockAudio);
    return () => document.removeEventListener("click", unlockAudio);
  }, []);

  useEffect(() => {
    if (!secretPlace) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const distance =
          Math.sqrt(
            Math.pow(latitude - secretPlace.lat, 2) +
              Math.pow(longitude - secretPlace.lng, 2)
          ) * 111139;

        if (distance <= secretPlace.radius) {
          if (!isInSecretPlace) {
            setIsInSecretPlace(true);
            toast.success(message);

            const audio = audioRef.current;
            if (audio && unlockedRef.current) {
              audio.currentTime = 0;
              audio.play().catch(err =>
                console.warn("Audio play blocked:", err)
              );
            }
          }
        } else if (isInSecretPlace) {
          setIsInSecretPlace(false);
        }
      },
      (err) => console.error("Geolocation error:", err),
      { enableHighAccuracy: true, maximumAge: 1000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [secretPlace, message, isInSecretPlace, seasonTheme]);
}