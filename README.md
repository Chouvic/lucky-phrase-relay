# lucky-phrase-relay

🐴 **Lucky Phrase Relay** – A Lunar New Year party game celebrating the Year of the Horse!

Built for **JPMC Glasgow Lunar New Year Celebration 2026**.

## 🎮 How to Play

1. Enter your name and join the celebration
2. Each round, pick a tile (adjective, blessing, or emoji) to build your lucky greeting
3. Beware of **taboo tiles** – they reduce your luck score!
4. After all rounds, see your completed greeting and luck score
5. Save or share your meme card!

## 🌐 Play Online

**[Play Now →](https://chouvic.github.io/lucky-phrase-relay/)**

## 🏗️ Tech Stack

- Pure HTML, CSS, and JavaScript – **no server required!**
- Deployed as a static site on **GitHub Pages**
- Web Audio API for sound effects
- Canvas particles for visual effects
- html2canvas for meme card screenshots

## 📁 Project Structure

```
index.html          ← Main HTML page
css/styles.css      ← All styles
js/game-data.js     ← Tile data, templates, avatars
js/game-engine.js   ← Game logic (tiles, scoring, turns)
js/app.js           ← UI logic and rendering
js/particles.js     ← Canvas particle effects
js/sounds.js        ← Web Audio sound effects
```

## 🚀 Local Development

Just open `index.html` in a browser – no build step or server needed!

Or use any static file server:

```bash
# Python
python3 -m http.server 3888

# Node.js (npx, no install)
npx serve .
```

## 📜 License

MIT
