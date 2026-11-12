import { useEffect } from "react";
import { Link } from "react-router-dom";
import Hero from "../components/Hero";
import "../styles/home.css";

function Home() {
    /* Lets the stylesheet release the global #root width cap on this page. */
    useEffect(() => {
        document.documentElement.classList.add("is-home");
        return () => document.documentElement.classList.remove("is-home");
    }, []);

    return (
        <main className="haven-home">
            <Hero />

            {/* Minimal continuation so the sticky header transition has
                somewhere to scroll to. Replace with real homepage sections. */}
            <section className="haven-home-next" aria-label="Shop by category">
                <p className="haven-home-eyebrow">The new season</p>
                <h2>Essentials, edited.</h2>
                <div className="haven-home-links">
                    <Link to="/female">Women</Link>
                    <Link to="/male">Men</Link>
                    <Link to="/products">All collections</Link>
                </div>
            </section>
        </main>
    );
}

export default Home;
