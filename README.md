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
## 📖 101 Okey Kuralları

### 1. Ekipman ve Başlangıç (Equipment & Setup)
- **Taşlar:** Toplam 106 taş (1-13 arası 4 farklı renk, her taştan 2 adet) ve 2 adet sahte okey bulunur.
- **Oyuncular:** 4 oyuncu ile saat yönünün tersine oynanır.
- **Dağıtım:** Dağıtanın sağındaki oyuncuya 22 taş, diğer 3 oyuncuya 21'er taş verilir. 22 taş alan oyuncu oyuna ilk başlar.
- **Okey (Joker):** Yere açılan gösterge taşının aynı renginin bir üst değeridir (örn. Mavi 13 açılırsa Okey Mavi 1'dir). Sahte Okey (Joker taşı), gerçek Okey'in (gösterge + 1) yerini tutar.

### 2. Amaç
Elinizdeki taşları per/seri veya çift yaparak dizmek ve elindeki tüm taşları ilk bitiren oyuncu olmaktır. Oyun birden fazla elden oluşur ve oyun sonunda en düşük ceza puanına sahip oyuncu kazanır.

### 3. Perler (Melds)
- **Grup (Set / Per):** Aynı sayı, farklı renklerden oluşan 3'lü veya 4'lü gruplar (örn: Kırmızı 5, Mavi 5, Sarı 5).
- **Seri (Run / El):** Aynı renk, ardışık sayılardan oluşan en az 3'lü diziler (örn: Kırmızı 5-6-7). '1' taşı sadece serinin en düşük değeri olarak kullanılabilir (1-2-3 geçerliyken, 12-13-1 geçerli değildir).
- **Çift (Pair):** Tamamen aynı iki taştan oluşan (aynı sayı ve aynı renk) gruptur. Çiftler daha sonra üçlü yapılarak uzatılamaz.
- **Okey:** Okey taşı serilerde her taşın yerine geçebilir (joker). Yere açılan okey sabit kalır; ancak yerdeki okeyi temsil eden taşı elinde bulunduran oyuncu okey ile taşı değiştirebilir (swap).
- **Açma Yöntemleri:** Bir elde sadece bir yolu seçebilirsiniz (ikisi aynı anda yapılamaz):
  - Seri ve Grup (Per) yolu.
  - Çift yolu (açmak için en az 5 çift gerekir).

### 4. El Açma Kuralları (Opening Requirement)
- **Seri/Grup Yoluyla:** İlk açılışta perlerinizin sayı değerleri toplamı en az **101 puan** olmalıdır (joker taşı, yerine geçtiği taşın değerini alır). Kendi elinizi açtıktan sonra masadaki diğer açık perlere taş işleyebilirsiniz.
- **Çift Yoluyla:** En az **5 çift** açarak elinizi açabilirsiniz.
- Kendi elinizi açmadan, başkasının açtığı perlere taş **işleyemezsiniz**.

### 5. Oynanış (Gameplay)
- **Sıra Sizdeyken:** Desteden taş çekebilir VEYA bir önceki oyuncunun attığı taşı alabilirsiniz.
- **Yerden Taş Alma:** Bir önceki oyuncunun attığı taşı sadece o tur elinizi açabiliyorsanız ve o taşı **hemen** bir perinizde kullanacaksanız alabilirsiniz.
- **Tur Sonu:** Sıranızı her zaman ıstakanızdan bir taşı yere (sağınıza) atarak bitirmek zorundasınız (oyunu bitiriyor olsanız bile).

### 6. İşlek Taş Cezası (Usable Tile Penalty / 101 Penalty)
- Yerdeki açılmış perlere **eklenebilecek (işleyen)** bir taşı bilerek veya bilmeyerek atarsanız **+101 ceza** yersiniz.
- Bu kural elinizi hiç açmamış olsanız dahi geçerlidir.
- **İstisnalar:** Oyunu bitirirken atılan son taş işlek olsa bile ceza yazılmaz. Ayrıca, yerdeki taşı çekip el açan kişinin işlemi, o taşı atan oyuncuya ceza yedirmez.

### 7. Diğer Cezalar (+101 puan)
- Yere bilerek veya yanlışlıkla Okey atmak (+101).
- Yanlış el açma girişimi yapıp taşları geri toplamak (+101).

### 8. Bitiş ve Puanlama (Ending & Scoring)
- **Kazanan (Oyunu Bitiren):** Oyunu bitiren kişi negatif (eksi) puan alır:
  - Normal bitiş: **-101**
  - Okey atarak bitirme: **-202**
  - Elden bitirme (Tüm tur bekleyip elini ilk açtığı sırada bitirme): **-202**
  - Elden + Okey atarak bitirme: **-404**
- **Diğer Oyuncular:** İstakalarında kalan taşların sayısal değerleri toplanarak hanelerine ceza puanı olarak yazılır. Elde kalan bir okey taşı 101 puan değerindedir.
- **Açmamış Oyuncular:** Oyunu hiç açmadan bitiren oyuncular net **202** ceza puanı alır.
- Kazanan kişi Okey ile veya Elden bitmişse diğer oyuncuların yediği cezalar sırasıyla 2 veya 4 ile çarpılır.

## 📦 Kurulum ve Çalıştırma

```bash
# Projeyi klonlayın ve klasöre girin
# Gerekli paketleri (bağımlılıkları) yükleyin
npm install

# Geliştirme (development) sunucusunu başlatın
npm run dev

# Canlı ortam (production) için derleyin
npm run build
```
