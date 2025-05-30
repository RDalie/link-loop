# 🔗 LinkLoop – Visualize Your Web Browsing as a Graph

LinkLoop is a Chrome extension that transforms your browser history into an interactive force-directed graph. It helps you **understand your browsing behavior**, track page visits over time, and explore how you move through the web.

![LinkLoop Graph Screenshot](screenshot.png)

---

## ✨ Features

- 🧠 **Automatic History Tracking** – Logs visited pages and timestamps while browsing.
- 📊 **Force-Directed Graph** – Pages appear as nodes, and links show your navigation flow.
- 🎨 **Color-Coded by Frequency** – More visited pages appear darker.
- 🗓️ **Date Filters** – View today’s activity, last 3/7 days, or set a custom range.
- 🖱️ **Interactive** – Hover for tooltips, drag nodes, zoom and pan freely.
- 💾 **Privacy-Friendly** – All data stays local in your browser storage.

---

## 🛠 How It Works

- **Background Script** tracks active tab changes and page visits.
- **Popup** offers quick access to the “View My Web Graph” button.
- **Graph Page (`graph.html`)** renders the visualization using [D3.js](https://d3js.org/).

---

## 🚀 Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/yourusername/linkloop-extension.git
cd linkloop-extension
```

### 2. Load the extension in Chrome
1. Go to `chrome://extensions`
2. Enable **Developer Mode**
3. Click **“Load unpacked”**
4. Select the folder where this repo is located

---

## 📂 Folder Structure

```
📁 linkloop-extension/
├── manifest.json
├── background.js
├── popup.html
├── popup.js
├── graph.html
├── graph.js
├── d3.v7.min.js
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── style.css
└── README.md
```

---

## 📸 Screenshots

_Store-required size: 1280×800_

You can find example screenshots in the `/screenshots` folder or generate your own by opening the graph view and capturing your browser window.

---

## 🛡️ Privacy & Permissions

LinkLoop uses the following permissions:
- `tabs`, `history`, `storage`, `activeTab`
- No external APIs or trackers — all processing is done **locally**

---

## 📦 Build for Web Store

To publish:

1. Create a `.zip` of the extension files (exclude `.git`, `node_modules`, etc.)
2. Go to the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
3. Upload your `.zip`, write your listing, and submit for review

---

## 🙌 Contributing

Pull requests are welcome! If you have ideas for better visualizations, analytics, or UI improvements — open an issue or fork and PR.

---

## 📃 License

MIT License © 2025 [Your Name]
