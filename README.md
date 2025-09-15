# CyberHedge - Kuantum Sinyal Platformu

CyberHedge, modern web teknolojileriyle geliştirilmiş, trader'lar için gelişmiş bir kripto para sinyal, portföy yönetimi ve analiz platformudur. Uygulama, gerçek zamanlı piyasa verilerini kullanarak, çok katmanlı teknik analiz stratejilerine dayalı al-sat sinyalleri üretir.

## ✨ Temel Özellikler

- **Gerçek Zamanlı Sinyaller:** Pine Script'ten adapte edilmiş, Pivot Noktaları, RSI, MACD, ATR, OBV ve EMA gibi çoklu göstergelere dayalı profesyonel bir strateji ile al-sat sinyalleri üretir.
- **Token'a Dayalı Erişim (Token-Gated):** Sinyallere erişim, BSC Testnet ağındaki `modX` token sahipliği ile kontrol edilir.
- **Dinamik Portföy Yönetimi:** Kullanıcılar, sahip oldukları varlıkları ekleyebilir, anlık fiyatlar ve kar/zarar durumu ile portföylerini canlı olarak takip edebilirler.
- **Gelişmiş Analitik Sayfası:**
  - **Piyasa Duyarlılığı:** Popüler kripto paraların hacim ve fiyat hareketlerine dayalı, gerçek zamanlı bir "Korku ve Açgözlülük" endeksi.
  - **Fırsat Tarayıcı:** Kullanıcının aradığı token'lar için anlık teknik analiz yaparak potansiyel al-sat fırsatlarını gösterir.
  - **Canlı Haber Akışı:** CryptoPanic üzerinden entegre edilmiş, anlık bir haber akışı sunar.
- **Web3 Entegrasyonu:** MetaMask ile kolayca cüzdan bağlama, `modX` token bakiyesi kontrolü ve BSC Testnet ağ araçları.
- **Tamamen Responsive Tasarım:** Mobil ve masaüstü cihazlarda sorunsuz bir kullanıcı deneyimi için modern ve duyarlı arayüz.
- **Çoklu Dil Desteği:** İngilizce, Türkçe, Çince, Almanca ve İtalyanca dillerinde kullanılabilir.

## 🛠️ Kullanılan Teknolojiler

- **Frontend:** React, Vite, TypeScript, Tailwind CSS
- **Web3:** ethers.js (v5)
- **Veri Kaynakları:** Binance API (REST & WebSocket), CryptoPanic
- **Uluslararasılaştırma:** `i18next` ve `react-i18next`
- **Teknik Analiz:** `technicalindicators` kütüphanesi
- **İkonlar:** Lucide React

## 🚀 Kurulum ve Kullanım

Projeyi yerel makinenizde çalıştırmak için aşağıdaki adımları izleyin:

1.  **Depoyu klonlayın ve bağımlılıkları yükleyin:**
    ```bash
    git clone https://github.com/kullanici/repo-adi.git
    cd repo-adi
    npm install
    ```

2.  **Geliştirme sunucusunu başlatın:**
    ```bash
    npm run dev
    ```
    Uygulama, `http://localhost:5173` (veya Vite'in belirlediği başka bir port) adresinde çalışmaya başlayacaktır.

## ⚙️ Cüzdan ve Ağ Ayarları

- **MetaMask:** Uygulamayı kullanmak için [MetaMask](https://metamask.io/) tarayıcı eklentisinin yüklü olması gerekmektedir.
- **BSC Testnet:** Uygulama, Binance Smart Chain (BSC) Testnet ağı üzerinde çalışır. Cüzdanınızda bu ağ tanımlı değilse, sağ üstteki "Ayarlar" menüsünden "Add BSC Testnet" seçeneğini kullanarak kolayca ekleyebilirsiniz.
- **Test Token'ları:**
  - **tBNB:** Ağ işlem ücretleri için gereklidir. "Ayarlar" menüsündeki "Get Test BNB" linkini kullanarak musluk (faucet) sitesinden temin edebilirsiniz.
  - **modX Token:** Sinyallere erişim için gereklidir. Kontrat adresi: `0xb6322ed8561604ca2a1b9c17e4d02b957eb242fe`

## 📖 Sayfalar ve İşlevleri

### Signals
- Kullanıcı tarafından takip edilen token'lar için, seçilen zaman diliminde (5dk - 1ay) al-sat sinyalleri veya bilgilendirme kartları üretir.
- Kullanıcılar, "Add Token" bölümünden istedikleri token'ı (örn: "DOGE") listeye ekleyebilir veya listeden çıkarabilir.
- "SCAN FOR SIGNALS" butonu, mevcut liste için yeniden tarama yapar.

### Portfolio
- Kullanıcıların sahip oldukları kripto varlıklarını (token, miktar, ortalama alış fiyatı) ekleyerek bir portföy oluşturmalarını sağlar.
- Eklenen varlıkların anlık fiyatını, toplam değerini ve kar/zarar durumunu gerçek zamanlı olarak gösterir.
- Veriler, tarayıcının `localStorage`'ında saklanır.

### Analytics
- **Market Sentiment:** Piyasanın genel duyarlılığını gösteren bir "Korku ve Açgözlülük" endeksi sunar.
- **Opportunity Scanner:** Kullanıcının aradığı token için anlık bir teknik analiz yaparak potansiyel fırsatları değerlendirir.
- **Latest News:** CryptoPanic üzerinden canlı bir haber akışı sunar.
