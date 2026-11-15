import { useEffect, useRef } from "react";
import "../styles/intro.css";

/*
 * HAVEN entry sequence — plays once per visit, driven by scroll.
 *
 *   1. Full-screen photo panels with a giant HAVEN wordmark.
 *   2. Scrolling flies the camera "through" the wordmark: the panels part and
 *      a full-bleed photo opens from the centre.
 *   3. A quiet ivory statement page (like a fashion lookbook title page).
 *   4. The pinned stage releases and the real home page begins.
 *
 * Replace these images in /client/public/media/ (same names) with your own
 * campaign photography — portrait-ish crops work best for the panels:
 *   haven-intro-1.jpg, haven-intro-2.jpg, haven-intro-3.jpg  (3 panels)
 *   haven-intro-core.jpg                                      (the big reveal, landscape)
 */
export const INTRO_SEEN_KEY = "haven-intro-seen";

const clamp = (value) => Math.min(1, Math.max(0, value));
const seg = (p, a, b) => clamp((p - a) / (b - a));
const ease = (t) => t * t * (3 - 2 * t);

function Intro({ onDone }) {
    const rootRef = useRef(null);
    const stageRef = useRef(null);
    const doneRef = useRef(false);

    useEffect(() => {
        const root = rootRef.current;
        const stage = stageRef.current;
        if (!root || !stage) {
            return undefined;
        }

        const html = document.documentElement;
        let frame = 0;

        const markDone = () => {
            if (doneRef.current) return;
            doneRef.current = true;
            try {
                sessionStorage.setItem(INTRO_SEEN_KEY, "1");
            } catch {
                /* storage unavailable — fine */
            }
            if (onDone) onDone();
        };

        const update = () => {
            frame = 0;
            const rect = root.getBoundingClientRect();
            const distance = Math.max(rect.height - window.innerHeight, 1);
            const p = clamp(-rect.top / distance);

            const word = seg(p, 0.1, 0.58);
            const open = ease(seg(p, 0.16, 0.62));
            const core = ease(seg(p, 0.26, 0.7));
            const statement = ease(seg(p, 0.74, 0.86));

            const set = (name, value) => stage.style.setProperty(name, value);
            set("--word-scale", (1 + 26 * Math.pow(word, 2.3)).toFixed(3));
            set("--word-opacity", (1 - ease(seg(p, 0.42, 0.58))).toFixed(3));
            set("--panel-open", open.toFixed(3));
            set("--core-inset", `${(50 * (1 - core)).toFixed(2)}%`);
            set("--core-zoom", (1.18 - 0.18 * core).toFixed(3));
            set("--statement", statement.toFixed(3));
            set("--statement-text", ease(seg(p, 0.82, 0.92)).toFixed(3));
            set("--line", seg(p, 0.84, 1).toFixed(3));
            set("--hint", (1 - seg(p, 0, 0.06)).toFixed(3));

            /* header stays hidden until the intro has scrolled away */
            const active = rect.bottom > 90;
            html.classList.toggle("intro-on", active);

            if (p > 0.97) {
                markDone();
            }
        };

        const onScroll = () => {
            if (!frame) {
                frame = window.requestAnimationFrame(update);
            }
        };

        update();
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll);

        return () => {
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", onScroll);
            if (frame) window.cancelAnimationFrame(frame);
            html.classList.remove("intro-on");
        };
    }, [onDone]);

    function skip() {
        const root = rootRef.current;
        if (!root) return;
        try {
            sessionStorage.setItem(INTRO_SEEN_KEY, "1");
        } catch {
            /* ignore */
        }
        window.scrollTo({
            top: root.offsetTop + root.offsetHeight,
            behavior: "auto",
        });
    }

    return (
        <section className="intro" ref={rootRef} aria-label="Welcome to HAVEN">
            <div className="intro-stage" ref={stageRef}>
                <div className="intro-panels" aria-hidden="true">
                    <div className="intro-panel is-1" style={{ backgroundImage: "url(/media/haven-intro-1.jpg)" }} />
                    <div className="intro-panel is-2" style={{ backgroundImage: "url(/media/haven-intro-2.jpg)" }} />
                    <div className="intro-panel is-3" style={{ backgroundImage: "url(/media/haven-intro-3.jpg)" }} />
                </div>

                <div className="intro-core" aria-hidden="true">
                    <div
                        className="intro-core-image"
                        style={{ backgroundImage: "url(/media/haven-intro-core.jpg)" }}
                    />
                </div>

                <p className="intro-word" aria-hidden="true">
                    HAVEN
                </p>

                <div className="intro-statement">
                    <div className="intro-statement-copy">
                        <p className="intro-statement-eyebrow">HAVEN</p>
                        <h1>Everyday, in your element.</h1>
                        <span className="intro-line" aria-hidden="true" />
                    </div>
                </div>

                <p className="intro-hint" aria-hidden="true">
                    Scroll
                </p>

                <button type="button" className="intro-skip" onClick={skip}>
                    Skip intro
                </button>
            </div>
        </section>
    );
}

export default Intro;
