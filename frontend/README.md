# ChatZUO - Real-Time Chat Application

ChatZUO, modern bir kullanıcı deneyimi sunan, React ve Tailwind CSS v4 ile geliştirilmiş bir gerçek zamanlı sohbet uygulamasıdır. Bu dokümantasyon, projenin mimarisini ve kod parçalarını detaylı olarak açıklamaktadır.

## 📁 Proje Yapısı ve Kod Bölümleri

### 1. Giriş ve Yönlendirme Kontrolü (`App.jsx`)
Uygulamanın ana giriş noktasıdır. **React Router** kullanarak sayfalar arasındaki navigasyonu yönetir.
- **`ProtectedRoute`**: Kullanıcının giriş yapıp yapmadığını `localStorage` üzerinden kontrol eder. Giriş yapmamış kullanıcıları otomatik olarak `/login` sayfasına yönlendirir.
- **Rotalar**: Uygulama içeriği `/app` altında toplanmıştır, böylece giriş ekranı ve ana uygulama net bir şekilde ayrılmıştır.

### 2. Tema Yönetimi (`src/context/ThemeContext.jsx`)
Uygulamanın karanlık (Dark) ve aydınlık (Light) mod desteğini sağlayan merkezi sistemdir.
- Kullanıcı tercihlerini tarayıcı belleğinde (`localStorage`) saklar.
- Değişim anında `html` ve `body` etiketlerine `.dark` sınıfını ekleyerek tüm bileşenlerin rengini dinamik olarak günceller.

### 3. Kullanıcı Bilgileri ve Veri Katmanı (`src/services/mockData.js`)
Henüz bir backend sunucusu olmadığı için, bu dosya tüm backend operasyonlarını simüle eder.
- **Veri Saklama**: Odalar, mesajlar ve kullanıcı verileri JSON formatında tarayıcı belleğinde saklanır.
- **Fonksiyonlar**: `login`, `register`, `getRooms`, `createRoom`, `sendMessage` gibi asenkron fonksiyonlar gerçek bir API gibi davranır.

### 4. Bileşen Detayları (`src/components/`)
- **`Layout.jsx`**: Uygulamanın tepesindeki çubuğu (Header) ve genel sayfa yapısını kurar. Logoyu ve profil navigasyonunu barındırır.
- **`MessageList.jsx` & `Message.jsx`**: Mesajlaşma ekranının can damarıdır. Her yeni mesaj geldiğinde listeyi otomatik olarak en aşağı kaydırır (`scrollIntoView`).
- **`CreateRoomModal.jsx`**: Yeni oda açarken veya düzenlerken kullanılan kapsamlı bir form dur. Odanın "About Channel" bilgisinden renk özelleştirmesine kadar her şeyi yönetir.
- **`UserAvatar.jsx`**: Kullanıcılara dinamik ve renkli avatarlar atar.

### 5. Sayfa Detayları (`src/pages/`)
- **`Auth.jsx`**: Karşılama, giriş ve kayıt süreçlerini yönetir. Şifre gizleme/gösterme gibi kullanıcı dostu özelliklere sahiptir.
- **`RoomList.jsx`**: Tüm odaların sergilendiği ana lobidir. Arama filtresi ile odaları ismine veya açıklamasına göre süzebilirsiniz.
- **`ChatRoom.jsx`**: Mesajlaşmanın döndüğü sayfadır. Oda verilerini ve mesajları yükleyerek kullanıcıya sunar.
- **`Profile.jsx`**: Kullanıcı ayarları sayfasıdır. Kullanıcının görünümünü ve kişisel detaylarını yönetmesini sağlar.

### 6. Stil ve Tasarım (`src/index.css`)
Tailwind CSS v4'ün en yeni özelliklerini kullanır.
- Koyu mod geçişleri için özel CSS "fallback" kuralları içerir.
- Uygulamanın özel renk paleti (`chat-dark`, `chat-light` vb.) burada tanımlıdır.

## 🛠️ Temizlik ve Optimizasyon
Projenin son halinden şu gereksiz parçalar temizlenmiştir:
- Kullanılmayan default Vite assetleri (`react.svg`, `App.css`).
- Proje akışında kullanılmayan yedek/taslak Hook dosyaları (`useAuth`, `useRooms` vb.).
- Bileşen içi uygulamalarla yer değiştirmiş genel modal ve yükleme butonları.

**ChatZUO**, hem temiz kod yapısı hem de premium tasarımıyla kullanıcılarına üst düzey bir deneyim sunmayı amaçlar. 🚀
