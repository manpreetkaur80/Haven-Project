import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import ProductCard from "./ProductCard";
import "../styles/product-strip.css";

/*
 * Pinned horizontal product strip: as the page scrolls down, the row of
 * products travels sideways. Falls back to a normal swipeable row when the
 * visitor prefers reduced motion.
 */
function ProductStrip({ products, status }) {
    const sectionRef = useRef(null);
    const stickyRef = useRef(null);
    const trackRef = useRef(null);
    const barRef = useRef(null);
    const distanceRef = useRef(0);

    const [distance, setDistance] = useState(0);
    const [native, setNative] = useState(() =>
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );

    useEffect(() => {
        const list = window.matchMedia("(prefers-reduced-motion: reduce)");
        const onChange = () => setNative(list.matches);
        list.addEventListener("change", onChange);
        return () => list.removeEventListener("change", onChange);
    }, []);

    const update = useCallback(() => {
        const section = sectionRef.current;
        const track = trackRef.current;
        if (!section || !track || native) return;

        const total = distanceRef.current;
        const scrollable = section.offsetHeight - window.innerHeight;
        const top = section.getBoundingClientRect().top;
        const progress =
            total > 0 && scrollable > 0
                ? Math.min(1, Math.max(0, -top / scrollable))
                : 0;

        track.style.transform = `translate3d(${-total * progress}px,0,0)`;
        if (barRef.current) {
            barRef.current.style.transform = `scaleX(${progress})`;
        }
    }, [native]);

    const measure = useCallback(() => {
        const track = trackRef.current;
        const sticky = stickyRef.current;
        if (!track || !sticky) return;

        const next = Math.max(0, Math.round(track.scrollWidth - sticky.clientWidth));
        distanceRef.current = next;
        setDistance(next);
        update();
    }, [update]);

    useLayoutEffect(() => {
        measure();
        const track = trackRef.current;
        if (!track) return undefined;

        const observer = new ResizeObserver(measure);
        observer.observe(track);
        window.addEventListener("resize", measure);
        return () => {
            observer.disconnect();
            window.removeEventListener("resize", measure);
        };
    }, [measure, products]);

    useEffect(() => {
        if (native) {
            if (trackRef.current) trackRef.current.style.transform = "";
            return undefined;
        }

        let frame = 0;
        const onScroll = () => {
            if (!frame) {
                frame = window.requestAnimationFrame(() => {
                    frame = 0;
                    update();
                });
            }
        };
        update();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => {
            window.removeEventListener("scroll", onScroll);
            if (frame) window.cancelAnimationFrame(frame);
        };
    }, [native, update, products]);

    /* Keyboard users tabbing to an off-screen card scroll the page to it. */
    function handleFocus(event) {
        if (native || distanceRef.current === 0) return;
        const card = event.target.closest(".haven-strip-item");
        const section = sectionRef.current;
        if (!card || !section) return;

        const gutter = parseFloat(getComputedStyle(trackRef.current).paddingLeft) || 0;
        const wanted = Math.min(
            distanceRef.current,
            Math.max(0, card.offsetLeft - gutter)
        );
        const sectionTop = section.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top: sectionTop + wanted, behavior: "auto" });
    }

    const pinned = !native && distance > 0;

    return (
        <section
            ref={sectionRef}
            className={`haven-strip ${native ? "is-native" : ""}`}
            style={pinned ? { height: `calc(100svh + ${distance}px)` } : undefined}
            aria-labelledby="strip-title"
        >
            <div ref={stickyRef} className={`haven-strip-sticky ${pinned ? "is-pinned" : ""}`}>
                <header className="haven-strip-head">
                    <div>
                        <p className="haven-strip-eyebrow">Featured</p>
                        <h2 id="strip-title">Everyday essentials</h2>
                    </div>
                    <Link to="/products" className="haven-strip-all">
                        View all
                    </Link>
                </header>

                {status === "loading" && (
                    <div className="haven-strip-track" aria-hidden="true">
                        {Array.from({ length: 5 }).map((_, index) => (
                            <div className="haven-strip-item is-skeleton" key={index}>
                                <div className="haven-skel-media" />
                                <div className="haven-skel-line" />
                                <div className="haven-skel-line is-short" />
                            </div>
                        ))}
                    </div>
                )}

                {status === "error" && (
                    <p className="haven-strip-note" role="status">
                        We couldn’t load products right now.{" "}
                        <button type="button" onClick={() => window.location.reload()}>
                            Try again
                        </button>
                    </p>
                )}

                {status === "ready" && products.length === 0 && (
                    <p className="haven-strip-note">New pieces are arriving soon.</p>
                )}

                {status === "ready" && products.length > 0 && (
                    <div
                        ref={trackRef}
                        className="haven-strip-track"
                        onFocus={handleFocus}
                    >
                        {products.map((product) => (
                            <div className="haven-strip-item" key={product._id}>
                                <ProductCard product={product} />
                            </div>
                        ))}

                        {/* Closing tile: keeps the strip travelling even with few products */}
                        <div className="haven-strip-item haven-strip-end">
                            <Link to="/products" className="haven-strip-end-link">
                                <span className="haven-strip-end-title">
                                    The full collection
                                </span>
                                <span className="haven-strip-end-cta">
                                    View all <span aria-hidden="true">↗</span>
                                </span>
                            </Link>
                        </div>
                    </div>
                )}

                {pinned && (
                    <div className="haven-strip-progress" aria-hidden="true">
                        <span ref={barRef} />
                    </div>
                )}
            </div>
        </section>
    );
}

export default ProductStrip;
