# ChatUZO Widget Integration Guide

## 🚀 Quick Start

ChatUZO widget'ı kullanarak chat room'unuzu herhangi bir web sitesine kolayca embed edebilirsiniz.

### Adım 1: API Key Alın

1. ChatUZO'da bir room oluşturun
2. Room oluşturulduğunda size verilen `apiKey`'i kopyalayın
3. Bu key'i widget entegrasyonunda kullanacaksınız

### Adım 2: Widget Script'ini Ekleyin

Web sitenizin HTML dosyasına, `</body>` etiketinden hemen önce şu kodu ekleyin:

```html
<script 
    src="https://your-chatuzo-domain.com/widget-uzo.js" 
    data-api-key="YOUR_API_KEY_HERE"
></script>
```

## ⚙️ Konfigürasyon Seçenekleri

Widget davranışını özelleştirmek için şu parametreleri kullanabilirsiniz:

### `data-api-key` (Zorunlu)
Room'unuzun benzersiz API key'i. Bu key ile widget hangi chat room'una bağlanacağını bilir.

```html
data-api-key="abc123xyz456"
```

> **Not:** Widget otomatik olarak script'in yüklendiği domain'i tespit eder. Manuel olarak farklı bir domain belirtmek için `data-base-url` parametresini kullanabilirsiniz (genellikle gerekli değildir).

### `data-position` (Opsiyonel)
Widget'ın ekranda görüneceği pozisyon. Varsayılan: `bottom-right`

**Seçenekler:**
- `bottom-right` - Sağ alt köşe
- `bottom-left` - Sol alt köşe
- `top-right` - Sağ üst köşe
- `top-left` - Sol üst köşe

```html
data-position="bottom-left"
```

### `data-theme` (Opsiyonel)
Widget tema ayarı. Varsayılan: `auto`

**Seçenekler:**
- `auto` - Kullanıcının sistem tercihine göre
- `light` - Açık tema
- `dark` - Koyu tema

```html
data-theme="dark"
```

## 🎮 JavaScript API

Widget'ı JavaScript ile programatik olarak kontrol edebilirsiniz:

### Metodlar

#### `open()`
Widget'ı açar.

```javascript
window.ChatUZO.open();
```

#### `close()`
Widget'ı kapatır.

```javascript
window.ChatUZO.close();
```

#### `toggle()`
Widget'ı açar veya kapatır (toggle).

```javascript
window.ChatUZO.toggle();
```

#### `isOpen()`
Widget'ın açık olup olmadığını kontrol eder.

```javascript
if (window.ChatUZO.isOpen()) {
    console.log('Widget açık');
}
```

### Örnekler

#### Butona Tıklayınca Widget Aç
```html
<button onclick="window.ChatUZO.open()">
    Destek Talebi Oluştur
</button>
```

#### Sayfa Yüklendikten 5 Saniye Sonra Otomatik Aç
```javascript
window.addEventListener('load', () => {
    setTimeout(() => {
        window.ChatUZO.open();
    }, 5000);
});
```

#### Kullanıcı Scroll Edince Widget'ı Göster
```javascript
let scrolled = false;
window.addEventListener('scroll', () => {
    if (!scrolled && window.scrollY > 300) {
        scrolled = true;
        window.ChatUZO.open();
    }
});
```

## 📱 Mobil Uyumluluk

Widget otomatik olarak mobil cihazlarda optimize edilir:
- 480px'den küçük ekranlarda tam ekran moda geçer
- Mobil dokunmatik hareketleri destekler
- Responsive tasarım sayesinde tüm cihazlarda düzgün görünür

## 🔔 Bildirimler

Widget kapalıyken yeni mesajlar geldiğinde:
- Chat butonunda kırmızı bildirim rozeti görünür
- Rozet animasyonlu olarak dikkat çeker
- Widget açıldığında bildirim otomatik sıfırlanır

## 🔒 Güvenlik

### CORS (Cross-Origin Resource Sharing)
Backend'de `allowedDomains` ayarı ile hangi web sitelerinin widget'ı kullanabileceğini kontrol edebilirsiniz:

```javascript
// Room oluştururken
{
    "name": "Destek Chat",
    "allowedDomains": [
        "https://mywebsite.com",
        "https://www.mywebsite.com"
    ]
}
```

### Guest Access
Room'da misafir erişimi açık olmalıdır:

```javascript
{
    "logicConfig": {
        "guestAccess": true
    }
}
```

## 🎨 Customization

Widget içindeki chat room'un görünümünü room ayarlarından özelleştirebilirsiniz:

- **Tema** (açık/koyu)
- **Font** (font ailesi, boyut, ağırlık)
- **Renkler** (mesaj balonu renkleri)
- **Arka plan** (renk, gradient, resim)

Bu ayarlar room create/edit sırasında `uiSettings` ile yapılır.

## 📦 Backend Gereksinimleri

Widget'ın çalışması için backend'de şu endpoint'ler gereklidir:

### GET `/api/rooms/api-key/:apiKey`
API key ile room bilgilerini döner.

**Response:**
```json
{
    "room": {
        "id": "r1",
        "name": "Destek Chat",
        "slug": "support",
        "apiKey": "abc123",
        "logicConfig": {
            "guestAccess": true
        },
        ...
    }
}
```

### GET `/api/rooms/:roomId/participants`
Room katılımcılarını döner.

### Socket.io Events
- `join_room` - Room'a katılma
- `send_message` - Mesaj gönderme
- `typing` - Yazma bildirimi
- `user_joined` / `user_left` - Kullanıcı olayları

## 🧪 Test

`demo.html` dosyasını bir web server'da açarak widget'ı test edebilirsiniz:

```bash
# Python 3
python -m http.server 8000

# Node.js
npx serve .

# VS Code Live Server extension kullanarak
```

Ardından `http://localhost:8000/demo.html` adresini ziyaret edin.

## 🐛 Troubleshooting

### Widget Görünmüyor
- Browser console'da hata var mı kontrol edin
- API key doğru mu kontrol edin
- Backend çalışıyor mu kontrol edin (`/api/rooms/api-key/:key`)

### CORS Hatası
- Backend'de `allowedDomains` ayarını kontrol edin
- Test için `allowedDomains: []` yapabilirsiniz (herkese açık)

### Guest Access Hatası
- Room'un `logicConfig.guestAccess` değeri `true` olmalı

### Widget Açılmıyor
- `window.ChatUZO` objesinin yüklendiğini kontrol edin
- Console'da `window.ChatUZO` yazarak API'nin varlığını test edin

## 📞 Destek

Sorunlarınız için:
- GitHub Issues: [github.com/yourusername/chatuzo/issues]
- Email: support@chatuzo.com
- Dokümantasyon: [docs.chatuzo.com]

---

**ChatUZO Widget v1.0** - Powered by ChatUZO
