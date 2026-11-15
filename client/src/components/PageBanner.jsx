import "../styles/page-banner.css";

/* Full-bleed editorial banner used at the top of inner pages. */
function PageBanner({ eyebrow, title, text, meta, image = "/media/haven-hero-poster.jpg" }) {
    return (
        <section
            className="page-banner"
            style={{ "--banner-image": `url(${image})` }}
        >
            <div className="page-banner-inner">
                <div className="page-banner-copy">
                    {eyebrow && <p className="page-banner-eyebrow">{eyebrow}</p>}
                    <h1>{title}</h1>
                    {text && <p className="page-banner-text">{text}</p>}
                </div>
                {meta && <p className="page-banner-meta">{meta}</p>}
            </div>
        </section>
    );
}

export default PageBanner;
