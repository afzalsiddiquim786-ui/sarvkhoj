# SarvKhoj (सर्वखोज) — Windows, macOS, Linux और Android ऐप

यह फ़ोल्डर SarvKhoj का पूरा ऐप प्रोजेक्ट है। इसे GitHub पर डालते ही GitHub अपने सर्वर पर **चारों प्लेटफ़ॉर्म की इंस्टॉल फ़ाइलें मुफ़्त में अपने-आप बना देता है**। आपके कंप्यूटर पर कुछ इंस्टॉल करने की ज़रूरत नहीं।

| प्लेटफ़ॉर्म | मिलने वाली फ़ाइल |
|---|---|
| Windows 10/11 | `SarvKhoj-Setup-1.0.0.exe` (इंस्टॉलर) और `SarvKhoj-Portable-1.0.0.exe` (बिना इंस्टॉल) |
| macOS (Intel + Apple M1/M2/M3) | `SarvKhoj-1.0.0-mac-arm64.dmg`, `SarvKhoj-1.0.0-mac-x64.dmg` |
| Linux | `SarvKhoj-1.0.0-linux-x86_64.AppImage`, `SarvKhoj-1.0.0-linux-amd64.deb` |
| Android 7+ | `SarvKhoj-1.0.0-android.apk` |
| iPhone / कोई भी ब्राउज़र | `SarvKhoj-Web` (वेब ऐप — "Add to Home Screen") |

ऐप में **Lens** भी है (Google Lens जैसा): फ़ोटो या कैमरे से टेक्स्ट ढूँढना — घूमा हुआ, रंगीन या छोटा टेक्स्ट भी — टैप या ड्रैग करके चुनना, कॉपी करना, अपनी फ़ाइलों में खोजना, Google पर खोजना, अनुवाद करना, बोलकर सुनना, और बारकोड/QR पढ़ना।

पढ़ने के लिए ऐप में दो ऑफ़लाइन इंजन हैं: **PaddleOCR** (deep-learning, Google Lens जैसी तकनीक) और **Tesseract**। दोनों आपके डिवाइस पर ही चलते हैं — किसी सर्वर पर नहीं।

सभी ऐप **पूरी तरह ऑफ़लाइन** चलते हैं। OCR (हिंदी + अंग्रेज़ी), PDF, Excel, Word, PowerPoint और TIFF पढ़ने वाली सारी फ़ाइलें ऐप के अंदर ही रखी जाती हैं। आपकी फ़ाइलें कहीं नहीं भेजी जातीं।

---

## ऐप कैसे बनवाएँ (एक बार, लगभग 15 मिनट)

1. **GitHub अकाउंट** बनाएँ: https://github.com/signup (मुफ़्त)।
2. ऊपर दाएँ **+ → New repository** दबाएँ। नाम `sarvkhoj` रखें, **Private** चुनें, **Create repository** दबाएँ।
3. नए पेज पर **"uploading an existing file"** लिंक दबाएँ। इस ZIP को खोलकर `sarvkhoj-app` फ़ोल्डर के **अंदर की सारी फ़ाइलें और फ़ोल्डर** खींचकर (drag & drop) डाल दें। फिर **Commit changes** दबाएँ।
   - ध्यान दें: `.github` फ़ोल्डर भी अपलोड होना चाहिए। अगर आपके कंप्यूटर पर ये छिपा (hidden) है, तो नीचे "अगर Actions नहीं चला" देखें।
4. रिपॉज़िटरी में **Actions** टैब खोलें। "Build SarvKhoj apps" अपने-आप चलने लगेगा (पीला गोला = चल रहा है, हरा ✓ = पूरा)। इसमें 10–20 मिनट लगते हैं।
5. पूरा होने पर उस रन को खोलें, नीचे **Artifacts** में ये मिलेंगे:
   `SarvKhoj-Windows`, `SarvKhoj-macOS`, `SarvKhoj-Linux`, `SarvKhoj-Android`, `SarvKhoj-Web`। इन्हें डाउनलोड करके unzip करें।

### सबके लिए एक "Download" पेज (Release) बनाना
रिपॉज़िटरी में **Releases → Create a new release** दबाएँ। **Choose a tag** में `v1.0.0` लिखें और **Create new tag** चुनें, फिर **Publish release** दबाएँ। कुछ मिनट बाद उसी Release पेज पर सभी `.exe / .dmg / .AppImage / .deb / .apk` फ़ाइलें अपने-आप जुड़ जाएँगी। ये लिंक आप किसी को भी भेज सकते हैं (रिपॉज़िटरी Public हो तो)।

नया वर्ज़न: `package.json` में `"version"` बढ़ाएँ (जैसे `1.0.1`) और `v1.0.1` टैग से नया Release बनाएँ।

### अगर Actions नहीं चला
`.github/workflows/build.yml` अपलोड नहीं हुआ होगा। रिपॉज़िटरी में **Add file → Create new file** दबाएँ, नाम में `.github/workflows/build.yml` लिखें, इस ZIP वाली उसी फ़ाइल का पूरा text चिपकाएँ, और **Commit** करें।

---

## इंस्टॉल करना

- **Windows:** `SarvKhoj-Setup-….exe` चलाएँ। अगर "Windows protected your PC" दिखे, तो **More info → Run anyway** दबाएँ। ऐसा इसलिए आता है क्योंकि ऐप पर पैसे वाला कोड-साइनिंग सर्टिफ़िकेट नहीं है।
- **macOS:** अपने Mac के हिसाब से `.dmg` खोलें (M1/M2/M3 के लिए `arm64`, पुराने Intel Mac के लिए `x64`)। SarvKhoj को Applications में खींचें। पहली बार ऐप पर **Right-click → Open → Open** करें।
  - अगर "is damaged" लिखा आए, तो Terminal में ये चलाएँ: `xattr -cr /Applications/SarvKhoj.app`
- **Linux:** AppImage के लिए `chmod +x SarvKhoj-*.AppImage` करें, फिर उसे चलाएँ। Ubuntu/Debian पर `.deb` के लिए `sudo apt install ./SarvKhoj-*.deb` चलाएँ।
- **Android:** `.apk` फ़ोन पर भेजकर खोलें। पूछे जाने पर "Install unknown apps" की अनुमति दें।
- **iPhone/iPad:** `SarvKhoj-Web` फ़ोल्डर को किसी HTTPS वेबसाइट पर डालें (जैसे GitHub Pages या Netlify Drop)। फिर Safari में खोलकर **Share → Add to Home Screen** करें।

## अपने कंप्यूटर पर खुद बनाना (डेवलपर के लिए)
Node.js 20 चाहिए। पहले `npm install` चलाएँ, फिर:
- आज़माने के लिए: `npm start`
- Windows: `npm run dist:win`
- macOS: `npm run dist:mac` (Mac पर ही बनेगा)
- Linux: `npm run dist:linux`
- Android: `npm run android:apk` (इसके लिए Java 17 और Android SDK चाहिए)

तैयार फ़ाइलें `dist/` में मिलेंगी।

## Play Store / Microsoft Store के लिए
ऊपर बनी फ़ाइलें सीधे बाँटने (sideload) के लिए हैं। स्टोर पर डालने के लिए ये चाहिए:
- **Android:** एक release signing key से साइन किया हुआ AAB, और Google Play Console अकाउंट ($25 एक बार)।
- **Windows:** कोड-साइनिंग सर्टिफ़िकेट।
- **Mac:** Apple Developer अकाउंट ($99/साल)।

## फ़ोल्डर में क्या है
- `src/SarvKhoj.html` — पूरा ऐप। इसे अकेले ब्राउज़र में भी खोल सकते हैं।
- `electron/main.js` — Windows/Mac/Linux वाला डेस्कटॉप शेल।
- `scripts/prepare-web.mjs` — सारी लाइब्रेरी और OCR भाषा फ़ाइलें ऐप में डालता है, ताकि ऐप ऑफ़लाइन चले।
- `scripts/android.mjs` — Android APK बनाता है।
- `build/`, `assets/android-res/` — सभी प्लेटफ़ॉर्म के आइकन।
- `.github/workflows/build.yml` — GitHub पर अपने-आप बिल्ड करने वाली सेटिंग।
