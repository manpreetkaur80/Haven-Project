import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/arrivals-banner.css";

/*
 * Full-screen background video for the New Arrivals banner.
 * Replace in /client/public/media/ (same names) or edit the paths here:
 *   haven-arrivals.mp4         16:9 (or any; it is cropped with object-fit: cover)
 *   haven-arrivals-poster.jpg  still frame / fallback
 * To use a still image instead of video, delete the <video> block below.
 */
const VIDEO = "/media/haven-arrivals.mp4";
const POSTER = "/media/haven-arrivals-poster.jpg";

function ArrivalsBanner() {
    const videoRef = useRef(null);
    const [ready, setReady] = useState(false);
    const [reduced] = useState(
        () => window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );

    useEffect(() => {
        const video = videoRef.current;
        if (!video || reduced) return;
        video.muted = true;
        const result = video.play();
        if (result && typeof result.catch === "function") result.catch(() => {});
    }, [reduced]);

    return (
        <section className="haven-banner" aria-label="New arrivals">
            <div
                className="haven-banner-poster"
                style={{ backgroundImage: `url(${POSTER})` }}
                aria-hidden="true"
            />

            {!reduced && (
                <video
                    ref={videoRef}
                    className={`haven-banner-video ${ready ? "is-ready" : ""}`}
                    poster={POSTER}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    disablePictureInPicture
                    aria-hidden="true"
                    tabIndex={-1}
                    onPlaying={() => setReady(true)}
                >
                    <source src={VIDEO} type="video/mp4" />
                </video>
            )}

            <div className="haven-banner-shade" aria-hidden="true" />

            <div className="haven-banner-copy">
                <p className="haven-banner-eyebrow">Just landed</p>
                <h2>The new arrivals.</h2>
                <p className="haven-banner-sub">
                    Fresh silhouettes for women and men, edited for the season ahead.
                </p>
                <Link to="/new-arrivals" className="haven-banner-cta">
                    <span>Shop new arrivals</span>
                    <span className="haven-banner-arrow" aria-hidden="true">
                        ↗
                    </span>
                </Link>
            </div>
        </section>
    );
}

export default ArrivalsBanner;
