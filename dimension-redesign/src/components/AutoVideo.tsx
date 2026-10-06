"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { useInView, useReducedMotion } from "motion/react";

type Props = {
  src: string;
  poster: string;
  className?: string;
  label?: string;
  /** "view" : lecture quand visible ; "hover" : lecture au survol du parent. */
  trigger?: "view" | "hover";
  muted?: boolean;
};

// Vidéo muette en boucle qui ne se charge et ne joue que lorsqu'elle est utile
// (visible à l'écran, ou survolée). Rien d'automatique si l'utilisateur
// préfère réduire les animations.
const AutoVideo = forwardRef<HTMLVideoElement, Props>(function AutoVideo(
  { src, poster, className, label, trigger = "view", muted = true }, ref,
) {
  const video = useRef<HTMLVideoElement>(null);
  useImperativeHandle(ref, () => video.current!);
  const reduce = useReducedMotion();
  const inView = useInView(video, { amount: 0.55 });

  useEffect(() => {
    const v = video.current;
    if (!v || trigger !== "view" || reduce) return;
    if (inView) v.play().catch(() => {});
    else v.pause();
  }, [inView, trigger, reduce]);

  useEffect(() => {
    const v = video.current;
    const host = v?.parentElement?.closest("a, .hover-host") as HTMLElement | null;
    if (!v || !host || trigger !== "hover" || reduce) return;
    const play = () => { v.play().catch(() => {}); };
    const stop = () => { v.pause(); };
    host.addEventListener("pointerenter", play);
    host.addEventListener("pointerleave", stop);
    host.addEventListener("focusin", play);
    host.addEventListener("focusout", stop);
    return () => {
      host.removeEventListener("pointerenter", play);
      host.removeEventListener("pointerleave", stop);
      host.removeEventListener("focusin", play);
      host.removeEventListener("focusout", stop);
    };
  }, [trigger, reduce]);

  useEffect(() => { if (video.current) video.current.muted = muted; }, [muted]);

  return (
    <video
      ref={video}
      className={className}
      src={src}
      poster={poster}
      muted={muted}
      loop
      playsInline
      preload="none"
      aria-label={label}
      aria-hidden={label ? undefined : true}
    />
  );
});

export default AutoVideo;
