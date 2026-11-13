import { useEffect, useState } from "react";
import Hero from "../components/Hero";
import ProductStrip from "../components/ProductStrip";
import ArrivalsBanner from "../components/ArrivalsBanner";
import CategoryCards from "../components/CategoryCards";
import CategoryRow from "../components/CategoryRow";
import BrandStory from "../components/BrandStory";
import ServiceStrip from "../components/ServiceStrip";
import ShopTheLook from "../components/ShopTheLook";
import ReviewsSection from "../components/ReviewsSection";
import Newsletter from "../components/Newsletter";
import Footer from "../components/Footer";
import { getProducts } from "../services/api";
import "../styles/home.css";

const STRIP_LIMIT = 10;

function Home() {
    const [products, setProducts] = useState([]);
    const [status, setStatus] = useState("loading"); // loading | ready | error

    /* Lets the stylesheet release the global #root width cap on this page. */
    useEffect(() => {
        document.documentElement.classList.add("is-home");
        return () => document.documentElement.classList.remove("is-home");
    }, []);

    /* One request feeds the strip and the category cards (existing API). */
    useEffect(() => {
        let active = true;

        getProducts()
            .then((data) => {
                if (!active) return;
                setProducts(Array.isArray(data) ? data : []);
                setStatus("ready");
            })
            .catch(() => {
                if (active) setStatus("error");
            });

        return () => {
            active = false;
        };
    }, []);

    /* Featured products first; otherwise the newest ones (API is newest-first). */
    const featured = products.filter((product) => product.isFeatured);
    const stripProducts = (featured.length >= 4 ? featured : products).slice(0, STRIP_LIMIT);

    return (
        <main className="haven-home">
            <Hero />
            <ProductStrip products={stripProducts} status={status} />
            <ArrivalsBanner />
            <CategoryCards products={products} />
            <CategoryRow products={products} />
            <ShopTheLook products={products} />
            <BrandStory />
            <ReviewsSection />
            <ServiceStrip />
            <Newsletter />
            <Footer />
        </main>
    );
}

export default Home;
