# 101 Okey - Stratejik Taş Oyunu

Bu uygulama, popüler Türk masa oyunu **101 Okey**'in tam fonksiyonel bir web versiyonudur. Oyuncular yapay zekaya karşı yarışabilir, ellerini dizebilir ve stratejik hamleler yaparak en düşük ceza puanıyla oyunu bitirmeye çalışabilirler. 

## 🚀 Özellikler

- **İki Oyun Modu:**
    - **Standart (Katlamasız):** Sabit 101 puan barajı.
    - **Katlamalı:** Her oyuncu elini açtığında, bir sonraki oyuncu için gereken minimum açma puanı yükselir.
- **Akıllı Puan Takibi:**
    - Elinizi açmadan önce **PER TOPLAMI**'nı görerek barajı geçip geçmediğinizi takip edin.
    - Elinizi açtıktan sonra **KALAN PUAN**'ınızı görerek elinizdeki fazlalık taşların değerini takip edin.
- **Doğru Kurallar ve Gerçekçi Puanlama:**
    - **Sahte Okey (Joker):** Gerçek okeyin yerine geçer. Elde kaldığında, yerine geçtiği taşın (Okey'in) sayısal değeri kadar ceza puanı yazılır (101 değil).
    - **Katı 101 Kuralları:** Klasik Okey'in aksine 12-13-1 şeklinde bir seri yapılamaz.
    - **Okey İşleme:** Okey taşı bir pere eklendiğinde değeri sabitlenir ve sonradan değerinin kaymasına izin verilmez.
    - Oyunu bitiren oyuncu **-101** puan alır. Elden bitirme **-202**, Okey atarak bitirme **-202** (Elden Okey ise **-404**) puan kazandırır.
    - Elini açmayan oyuncular **202** ceza puanı alır.
- **Gelişmiş Oyun Mekanikleri:**
    - **Sürükle ve Bırak (Drag & Drop):** Taşları ıstakada serbestçe dizebilir, ortadan desteden veya atılan taşlardan sürükleyerek taş çekebilir ve aynı şekilde taş atabilirsiniz.
    - **Otomatik Dizme:** "SERİ DİZ" ve "ÇİFT DİZ" butonları ile elinizi anında optimize edin. Akıllı sıralama algoritması, per olmayan taşları otomatik olarak ıstakanın sağ alt köşesinde toplar.
    - **Taş İşleme & Okey Değiştirme:** Diğer oyuncuların perlerine uygun taşlarınızı işleyin. Yerdeki perlerde bulunan Okey taşını uygun taşla değiştirip elinize alın.
    - **Aydınlık / Karanlık Mod:** Göz yormayan tema seçenekleriyle (Dark/Light Mode) istediğiniz ambiyansta oynayın.
    - **Atılan Taşlar Geçmişi:** Diğer oyuncuların hangi taşları attığını renklerine göre gruplanmış şekilde görün.

## 🛠️ Teknolojiler

- **React 18**
- **TypeScript**
- **Vite**
- **Tailwind CSS** (Styling)
- **Framer Motion** (Animasyonlar)
- **@dnd-kit** (Sürükle-Bırak Mekaniği)
- **Lucide React** (İkonlar)

## 📖 Nasıl Oynanır?

1.  **Taş Çekme:** Sıranız geldiğinde desteden veya bir önceki oyuncunun attığı taştan sürükleyerek (veya tıklayarak) çekin. Yerden taş alırsanız elinizi açmak zorundasınız.
2.  **El Açma:** Elinizdeki perlerin toplamı 101 puanı geçiyorsa "SERİ AÇ" butonuna basarak elinizi açabilirsiniz. Alternatif olarak 5 çift ile "ÇİFT AÇ" yapabilirsiniz.
3.  **Taş İşleme:** Elinizi açtıktan sonra, masadaki perlere uygun taşlarınızı seçip ardından yerdeki ilgili pere tıklayarak (veya sürükleyerek) işleyebilirsiniz.
4.  **Sıra Bekleme:** Sıra rakiplerinizdeyken ıstakanızdaki taşları düzenleyerek bir sonraki hamlenize hazırlanabilirsiniz.
5.  **Bitirme:** Elinizdeki tüm taşları per yaparak veya işleyerek bitirdiğinizde, son kalan fazlalık taşınızı "TAŞ AT" bölgesine sürükleyerek oyunu kazanın.

## 📦 Kurulum ve Çalıştırma

Projeyi yerel ortamınızda çalıştırmak veya kendi sunucunuza yüklemek (deploy) için aşağıdaki komutları kullanabilirsiniz:

```bash
# Projeyi klonlayın ve klasöre girin
# Gerekli paketleri (bağımlılıkları) yükleyin
npm install

# Geliştirme (development) sunucusunu başlatın
npm run dev

# Canlı ortam (production) için derleyin
npm run build
```

*(Projeyi canlıya almak için `npm run build` komutuyla oluşan `dist` klasörünü web sunucunuza (Nginx, Apache vb.) yüklemeniz yeterlidir.)*
