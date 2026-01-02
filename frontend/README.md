# 🚀 ChatUZO - Premium Real-Time Chat Experience

ChatUZO, modern web teknolojileriyle geliştirilmiş, hız ve estetik odaklı bir mesajlaşma platformudur. **React 19** ve **Tailwind CSS v4**'ün gücünü kullanarak, kullanıcılara akıcı, güvenli ve premium bir deneyim sunar.

---

## ✨ Temel Özellikler

- 🌓 **Dinamik Tema Sistemi**: Tek tıkla geçiş yapılabilen, göz yormayan Dark/Light mod desteği.
- � **Çoklu Oda Yönetimi**: Farklı topluluklar için özel odalar oluşturma, düzenleme ve arama.
- 🎨 **Kişiselleştirilmiş Tasarım**: Her oda için özel renk paleti tanımlama imkanı.
- 📱 **Tam Duyarlı (Responsive)**: Mobilden masaüstüne her cihazda kusursuz görünüm.
- 🔒 **Güvenli Kimlik Doğrulama**: Kullanıcı kayıt ve giriş sistemleri.
- 🎭 **Dinamik Avatarlar**: Boring-Avatars entegrasyonu ile her kullanıcıya özel görsel kimlik.

---

## 🛠️ Teknik Altyapı (Frontend Stack)

- **Framework**: [React 19](https://react.dev/) (Modern Component Mimarisi)
- **Bundler**: [Vite](https://vitejs.dev/) (Ultra hızlı geliştirme deneyimi)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) (Modern ve esnek tasarım sistemi)
- **İkonlar**: [Lucide React](https://lucide.dev/) (Kapsamlı ve performanslı ikon seti)
- **Yönlendirme**: [React Router 7](https://reactrouter.com/) (Gelişmiş navigasyon yönetimi)
- **Veri Saklama**: [Local Storage Mock Engine](src/services/mockData.js) (Gerçek bir veritabanı gibi davranan yerel depolama sistemi)

---

## 📁 Proje Klasör Yapısı

```text
src/
├── components/      # Atomik ve yeniden kullanılabilir bileşenler (Chat, Room, Common)
├── context/         # Global state (Tema, Kullanıcı durumu)
├── pages/           # Ana sayfa yapıları (Auth, ChatRoom, RoomList, Profile)
├── services/        # Veri akışı (Mock API servisleri)
├── assets/          # (Opsiyonel) Yerel varlıklar
└── index.css        # Tailwind v4 konfigürasyonları ve global stiller
```

---

## 🏢 SaaS ve Gelecek Vizyonu

ChatUZO sadece bir chat platformu değil, aynı zamanda bir **SaaS (Software as a Service)** ürünü olarak planlanmaktadır:

1.  **Iframe Widget Entegrasyonu**: İşletmelerin kendi web sitelerine sadece bir `<script>` etiketi ekleyerek ChatUZO'yu dahil edebilmesi.
2.  **Real-Time Backend**: Express, TypeScript ve Socket.io kullanılarak anlık veri iletişimi.
3.  **Persistance**: PostgreSQL (Neon.tech / Supabase) entegrasyonu ile kalıcı veri depolama.
4.  **Admin Paneli**: Oda istatistikleri ve kullanıcı moderasyonu için gelişmiş yönetim ekranı.

---

## � Başlangıç

Projeyi yerel makinenizde çalıştırmak için:

```bash
# 1. Repoyu klonlayın
git clone [repo-linki]

# 2. Bağımlılıkları yükleyin
npm install

# 3. Geliştirme sunucusunu başlatın
npm run dev
```

---

## 👤 Geliştirici
Bu proje modern web standartları ve temiz kod (Clean Code) prensipleri takip edilerek geliştirilmiştir. Gereksiz importlar (`React` vb.) temizlenmiş, performans optimizasyonları yapılmıştır.
