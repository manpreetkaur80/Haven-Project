import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/hero.css";

/*
 * Hero media — drop your campaign files into /client/public/media/ using
 * these names (or change the paths here):
 *
 *   haven-hero.mp4          landscape 16:9, 1920x1080, H.264, muted, ~8–15 MB
 *   haven-hero-mobile.mp4   portrait 4:5 or 9:16, 1080 wide, H.264, ~5–8 MB
 *   haven-hero-poster.jpg   first frame of the landscape video
 *   haven-hero-poster-mobile.jpg
 *
 * Optional: add .webm versions and list them first in `sources`.
 */
const MEDIA = {
    desktop: {
        poster: "/media/haven-hero-poster.jpg",
        sources: [{ src: "/media/haven-hero.mp4", type: "video/mp4" }],
    },
    mobile: {
        poster: "/media/haven-hero-poster-mobile.jpg",
        sources: [{ src: "/media/haven-hero-mobile.mp4", type: "video/mp4" }],
    },
};

const MOBILE_QUERY = "(max-width: 768px)";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function useMediaQuery(query) {
    const [matches, setMatches] = useState(() =>
        typeof window === "undefined" ? false : window.matchMedia(query).matches
    );

    useEffect(() => {
        const list = window.matchMedia(query);
        const onChange = () => setMatches(list.matches);
        onChange();
        list.addEventListener("change", onChange);
        return () => list.removeEventListener("change", onChange);
    }, [query]);

    return matches;
}

function Hero() {
    const isMobile = useMediaQuery(MOBILE_QUERY);
    const reducedMotion = useMediaQuery(REDUCED_MOTION_QUERY);
    const media = isMobile ? MEDIA.mobile : MEDIA.desktop;

    const videoRef = useRef(null);
    const [ready, setReady] = useState(false);

    /* New source (viewport crossed the mobile breakpoint) → fade in again. */
    useEffect(() => {
        setReady(false);
    }, [media]);

    /* Autoplay can be blocked or paused by the browser; retry quietly. */
    useEffect(() => {
        const video = videoRef.current;
        if (!video || reducedMotion) {
            return undefined;
        }

        video.muted = true;
        const attempt = () => {
            const result = video.play();
            if (result && typeof result.catch === "function") {
                result.catch(() => {});
            }
        };
        attempt();

        const onVisibility = () => {
            if (!document.hidden) {
                attempt();
            }
        };
        document.addEventListener("visibilitychange", onVisibility);
        return () => document.removeEventListener("visibilitychange", onVisibility);
    }, [media, reducedMotion]);

    return (
        <section className="haven-hero" aria-label="HAVEN — new season">
            {/* Static poster: instant first paint + fallback if video can't play */}
            <div
                className="haven-hero-poster"
                style={{ backgroundImage: `url(${media.poster})` }}
                aria-hidden="true"
            />

            {!reducedMotion && (
                <video
                    key={isMobile ? "mobile" : "desktop"}
                    ref={videoRef}
                    className={`haven-hero-video ${ready ? "is-ready" : ""}`}
                    poster={media.poster}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="auto"
                    disablePictureInPicture
                    aria-hidden="true"
                    tabIndex={-1}
                    onPlaying={() => setReady(true)}
                >
                    {media.sources.map((source) => (
                        <source
                            key={source.src}
                            src={source.src}
                            type={source.type}
                        />
                    ))}
                </video>
            )}

            {/* Soft gradients: top for the header, bottom-left for the copy */}
            <div className="haven-hero-shade" aria-hidden="true" />

            <div className="haven-hero-copy">
                <h1 className="haven-hero-title">
                    <span className="haven-hero-line">Everyday,</span>{" "}
                    <span className="haven-hero-line">in your element.</span>
                </h1>
                <p className="haven-hero-sub">Discover pieces that feel like you.</p>
                <Link to="/products" className="haven-hero-cta">
                    <span>Shop now</span>
                    <span className="haven-hero-arrow" aria-hidden="true">
                        ↗
                    </span>
                </Link>
            </div>
        </section>
    );
}

export default Hero;
