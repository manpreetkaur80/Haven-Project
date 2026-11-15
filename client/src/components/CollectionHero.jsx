import { useEffect, useRef, useState } from "react";
import "../styles/collection.css";

/*
 * Hero media for the shop pages. Replace these files in /client/public/media/
 * (same names) with your own campaign footage / photography:
 *
 *   haven-collection.mp4  + haven-collection-poster.jpg   (/products)
 *   haven-women.mp4       + haven-women-poster.jpg        (/female)
 *   haven-men.mp4         + haven-men-poster.jpg          (/male)
 *   haven-newarrivals.mp4 + haven-newarrivals-poster.jpg  (/new-arrivals)
 *
 * Landscape 16:9, 1920x1080, H.264, muted, 6–15 MB. A photo works too — just
 * use only the -poster.jpg (delete the .mp4) and it shows as a still image.
 */
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

function CollectionHero({ media, eyebrow, title, text, count, scrollTo = "shop" }) {
    const reducedMotion = useMediaQuery(REDUCED_MOTION_QUERY);
    const videoRef = useRef(null);
    const [ready, setReady] = useState(false);

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
    }, [media.video, reducedMotion]);

    function handleScroll(event) {
        event.preventDefault();
        const target = document.getElementById(scrollTo);
        if (target) {
            target.scrollIntoView({
                behavior: reducedMotion ? "auto" : "smooth",
                block: "start",
            });
        }
    }

    return (
        <section className="col-hero" aria-label={title}>
            <div
                className="col-hero-poster"
                style={{ backgroundImage: `url(${media.poster})` }}
                aria-hidden="true"
            />

            {!reducedMotion && media.video && (
                <video
                    key={media.video}
                    ref={videoRef}
                    className={`col-hero-video ${ready ? "is-ready" : ""}`}
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
                    onError={() => setReady(false)}
                >
                    <source src={media.video} type="video/mp4" />
                </video>
            )}

            <div className="col-hero-shade" aria-hidden="true" />

            <div className="col-hero-copy">
                {eyebrow && <p className="col-hero-eyebrow">{eyebrow}</p>}
                <h1>{title}</h1>
                {text && <p className="col-hero-text">{text}</p>}
                <div className="col-hero-actions">
                    <a href={`#${scrollTo}`} className="col-hero-cta" onClick={handleScroll}>
                        <span>Shop the edit</span>
                        <span aria-hidden="true">↓</span>
                    </a>
                    <span className="col-hero-count">{count}</span>
                </div>
            </div>
        </section>
    );
}

export default CollectionHero;
