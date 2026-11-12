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
