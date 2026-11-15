# Hero media (placeholders)

`haven-hero.mp4` and `haven-hero-mobile.mp4` are generated placeholders (a slow
drift over a warm plaster-wall gradient). Replace them with your campaign footage,
keeping the same file names, or edit the paths in `src/components/Hero.jsx`.

| File                           | Spec                                              |
| ------------------------------ | ------------------------------------------------- |
| haven-hero.mp4                 | 16:9, 1920x1080, H.264, no audio, ~8-15 MB, 10-20 s seamless loop |
| haven-hero-mobile.mp4          | 4:5 or 9:16, 1080 wide, H.264, no audio, ~5-8 MB  |
| haven-hero-poster.jpg          | First frame of the landscape video                |
| haven-hero-poster-mobile.jpg   | First frame of the portrait video                 |

Compress with: `ffmpeg -i in.mov -an -c:v libx264 -crf 24 -preset slow -pix_fmt yuv420p -movflags +faststart haven-hero.mp4`

## New arrivals banner (placeholders)

`haven-arrivals.mp4` and `haven-arrivals-poster.jpg` are placeholders for the full-screen
"The new arrivals." section. Replace them with your own video (any aspect ratio,
H.264, no audio, ~8-15 MB) and a still frame, keeping the same names.

## Brand story image (placeholder)

`haven-story.jpg` (4:5, ~1080x1350) sits beside the "Effortless, everyday style." text.
Replace it with an editorial photograph, keeping the name.

## Shop the look image (placeholder)

`haven-look.jpg` (4:5, ~1080x1350) is the lookbook photo beside the three listed products.
Replace it with a photograph of an outfit made from products you sell, keeping the name.


## Shop pages (Collection / Women / Men / New arrivals)

Each page has a full-screen hero. Replace these files (same names) with your own:

| Page | Video (optional) | Poster / still image |
|---|---|---|
| /products | haven-collection.mp4 | haven-collection-poster.jpg |
| /female | haven-women.mp4 | haven-women-poster.jpg |
| /male | haven-men.mp4 | haven-men-poster.jpg |
| /new-arrivals | haven-newarrivals.mp4 | haven-newarrivals-poster.jpg |

Landscape 1920x1080, H.264, muted, 6-15 MB. For a photo-only hero, replace the poster and delete the .mp4.

## Entry sequence (scroll intro on the home page)

Plays once per visit. Replace these photos (same names):

| File | Used for |
|---|---|
| haven-intro-1.jpg / haven-intro-2.jpg / haven-intro-3.jpg | The three full-height panels behind the giant HAVEN wordmark (portrait crops work best, ~1000x1800) |
| haven-intro-core.jpg | The full-screen photo that opens from the centre (landscape, 2400x1350) |

Visitors can skip it, it is skipped on return visits in the same session, and it is skipped for people who prefer reduced motion.
