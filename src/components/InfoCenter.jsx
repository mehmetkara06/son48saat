import React, { useState } from 'react';
import { Zap, Layers, Wrench, TrendingUp, Coins, Leaf, HelpCircle, ChevronDown, CheckCircle2, AlertTriangle, Lightbulb, Sun } from 'lucide-react';

const InfoCenter = () => {
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const faqs = [
    {
      q: "Güneş panelleri bulutlu havada çalışır mı?",
      a: "Evet, çalışır. Bulutlu havalarda paneller doğrudan güneş ışığı yerine yayılmış (difüz) ışığı kullanarak üretim yapar. Ancak verim güneşli güne göre %10-30 arasında düşer. Yağmurlu ve çok kapalı günlerde bu oran %80'e kadar çıkabilir. Yıllık ortalama hesaplamalarında bu durum zaten hesaba katılır."
    },
    {
      q: "Panellerin ömrü ne kadar? Garanti süresi nedir?",
      a: "Kaliteli güneş panellerinin fiziksel ömrü 30-35 yıldır. Üreticiler genellikle 25 yıl boyunca başlangıç kapasitesinin en az %80'ini garanti eder (lineer performans garantisi). Ürün garantisi ise marka ve modele göre 10-15 yıl arasında değişir. İnvertörlerin ömrü ise 10-15 yıl olup panellerden önce değişim gerektirebilir."
    },
    {
      q: "Dolu veya fırtına panellere zarar verir mi?",
      a: "Modern paneller IEC 61215 standardına göre 25 mm çapında, saatte 80 km hızla gelen doluya dayanacak şekilde test edilir. Temperli cam yüzeyleri oldukça dayanıklıdır. Ancak çok büyük dolularda hasar oluşabilir — bu durumda sigorta kapsamına aldırmak önemlidir. Fırtına riskine karşı montaj sisteminin rüzgar yüküne uygun tasarlanması gerekir."
    },
    {
      q: "Gece elektrik kullanabilir miyim?",
      a: "Güneş panelleri gece üretim yapmaz. Şebekeye bağlı (on-grid) sistemlerde gece enerjinizi şebekeden kullanırsınız. Gündüz fazla ürettiğiniz enerji sayacınızdan düşülür. Bağımsız (off-grid) çalışmak istiyorsanız akü/batarya sistemi eklemeniz gerekir, ancak bu maliyeti önemli ölçüde artırır."
    },
    {
      q: "Çatıma panel taktırmak için izin gerekir mi?",
      a: "Evet, Türkiye'de çatı üzeri güneş paneli kurulumu için dağıtım şirketine başvuru ve belediyeden yapı ruhsatı alınması gerekir. 10 kW altı konut sistemleri için süreç nispeten basittir. Ayrıca binanın statik yükünü taşıyabilecek durumda olması gerekir — eski binalarda mühendislik raporu istenebilir."
    },
    {
      q: "Paneller geri dönüştürülebilir mi?",
      a: "Evet, güneş panellerinin yaklaşık %95'i geri dönüştürülebilir malzemeden oluşur. Cam, alüminyum ve bakır kablolar kolayca ayrıştırılır. Silikon hücrelerin geri dönüşümü daha karmaşık olsa da teknoloji hızla gelişmektedir. Avrupa'da WEEE direktifi kapsamında üreticiler ömrü dolan panellerin geri dönüşümünden sorumludur."
    }
  ];

  return (
    <div className="w-full max-w-6xl mx-auto py-8 md:py-16 px-2 md:px-6 font-sans relative z-10">
      
      {/* Hero Section */}
      <div className="text-center mb-10 md:mb-16 relative">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-sun-green/10 border border-sun-green/20 rounded-full text-sun-green text-sm font-medium mb-6">
          <Leaf className="w-4 h-4" /> Eğitim & Teknik Rehber
        </div>
        <h1 className="text-2xl md:text-5xl font-extrabold text-white mb-4 md:mb-6 tracking-tight">
          Güneş Enerjisi <span className="text-transparent bg-clip-text bg-gradient-to-r from-sun-green to-emerald-400">Bilgi Merkezi</span>
        </h1>
        <p className="text-sm md:text-lg text-gray-400 max-w-2xl mx-auto font-light">
          Güneş panelleri hakkında bilmeniz gereken her şey: teknik detaylar, bakım rehberi, verimlilik ipuçları ve yatırım bilgileri.
        </p>
      </div>

      {/* Navigation Pills */}
      <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-12 md:mb-20 bg-black/40 backdrop-blur-md p-3 md:p-4 rounded-2xl border border-white/5 shadow-xl">
        {[
          { icon: Zap, label: "Nasıl Çalışır?", href: "#nasil-calisir" },
          { icon: Layers, label: "Panel Türleri", href: "#panel-turleri" },
          { icon: Wrench, label: "Bakım", href: "#bakim" },
          { icon: TrendingUp, label: "Verimlilik", href: "#verimlilik" },
          { icon: Coins, label: "Maliyet", href: "#maliyet" },
          { icon: Leaf, label: "Çevresel Etki", href: "#cevre" },
          { icon: HelpCircle, label: "SSS", href: "#sss" },
        ].map((item, index) => (
          <a key={index} href={item.href} className="flex items-center gap-1.5 md:gap-2 px-3 md:px-5 py-2 md:py-2.5 rounded-xl text-xs md:text-sm font-medium text-gray-400 hover:text-sun-green hover:bg-white/5 border border-transparent hover:border-white/10 transition-all">
            <item.icon className="w-3.5 h-3.5 md:w-4 md:h-4" /> {item.label}
          </a>
        ))}
      </div>

      {/* 1. Nasıl Çalışır */}
      <div id="nasil-calisir" className="mb-24 scroll-mt-24">
        <div className="flex items-center gap-4 mb-8 pb-4 border-b border-white/10">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
            <Zap className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Güneş Panelleri Nasıl Çalışır?</h2>
            <p className="text-sm text-gray-500 mt-1">Fotovoltaik teknolojinin temelleri</p>
          </div>
        </div>

        <div className="glass-panel p-5 md:p-8 rounded-2xl mb-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Sun className="w-5 h-5 text-sun-green" /> Fotovoltaik Etki
          </h3>
          <p className="text-gray-400 leading-relaxed mb-8">
            Güneş panelleri, güneş ışığındaki fotonları doğrudan elektrik enerjisine dönüştürür. Panel yüzeyindeki silikon hücreler ışığı absorbe ettiğinde, elektronlar serbest kalır ve bir elektrik akımı oluşur. Bu süreç tamamen sessiz, emisyonsuz ve hareketli parça içermeyen bir teknolojidir.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { num: "25+", label: "Yıl Ömür" },
              { num: "%80", label: "25. Yıl Verimlilik" },
              { num: "4-6", label: "Saat Pik Üretim/Gün" },
              { num: "%18-22", label: "Ortalama Verimlilik" },
            ].map((stat, i) => (
              <div key={i} className="bg-black/30 border border-white/5 rounded-xl p-3 md:p-4 text-center">
                <div className="text-xl md:text-3xl font-bold text-sun-green mb-1">{stat.num}</div>
                <div className="text-xs text-gray-500 uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-panel p-5 md:p-8 rounded-2xl hover:border-sun-green/30 transition-all duration-300">
            <h3 className="text-lg font-bold text-sun-green mb-3">🔋 DC → AC Dönüşümü</h3>
            <p className="text-gray-400 leading-relaxed text-sm">
              Paneller doğru akım (DC) üretir. İnvertör (evirici) cihazı bu akımı evlerde ve işletmelerde kullanılan alternatif akıma (AC) dönüştürür. Modern inverterler %96-98 dönüşüm verimliliği sağlar.
            </p>
          </div>
          <div className="glass-panel p-5 md:p-8 rounded-2xl hover:border-brand-blue/30 transition-all duration-300">
            <h3 className="text-lg font-bold text-brand-blue mb-3">📡 Şebeke Bağlantısı</h3>
            <p className="text-gray-400 leading-relaxed text-sm">
              Üretilen fazla enerji elektrik şebekesine satılabilir. Türkiye'de "net metering" (mahsuplaşma) sistemi ile tükettiğinizden fazla ürettiğiniz enerji faturanızdan düşülür veya size ödenir.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Panel Türleri */}
      <div id="panel-turleri" className="mb-24 scroll-mt-24">
        <div className="flex items-center gap-4 mb-8 pb-4 border-b border-white/10">
          <div className="w-12 h-12 rounded-xl bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center flex-shrink-0">
            <Layers className="w-6 h-6 text-brand-blue" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Güneş Paneli Türleri</h2>
            <p className="text-sm text-gray-500 mt-1">Monokristalin, polikristalin ve ince film teknolojileri</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="glass-panel p-8 rounded-2xl hover:bg-black/60 transition-all group">
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2 group-hover:text-sun-green transition-colors">◆ Monokristalin (Mono-Si)</h3>
            <p className="text-gray-400 leading-relaxed text-sm">
              Tek kristal silikon yapısı sayesinde en yüksek verimliliği (%20-22) sunar. Koyu siyah renkleri ile estetik görünür. Daha az alan kaplayarak daha çok enerji üretir. Maliyeti daha yüksektir ancak uzun vadede en iyi yatırım getirisi sağlar.
            </p>
          </div>
          <div className="glass-panel p-8 rounded-2xl hover:bg-black/60 transition-all group">
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2 group-hover:text-brand-blue transition-colors">◇ Polikristalin (Poli-Si)</h3>
            <p className="text-gray-400 leading-relaxed text-sm">
              Birden fazla silikon kristalinden üretilir. Verimliliği %15-17 arasındadır. Mavimsi renkte olup mono panellere göre daha ekonomiktir. Geniş arsa alanı olan projeler için maliyet-performans dengesi açısından tercih edilir.
            </p>
          </div>
          <div className="glass-panel p-5 md:p-8 rounded-2xl hover:bg-black/60 transition-all group">
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2 group-hover:text-amber-400 transition-colors">▭ İnce Film (Thin-Film)</h3>
            <p className="text-gray-400 leading-relaxed text-sm">
              Esnek ve hafif yapısı ile eğimli veya düzensiz yüzeylere uygulanabilir. Verimliliği %10-13 ile daha düşüktür ancak bulutlu havalarda performansı stabildir. Büyük endüstriyel ve BIPV uygulamalarında kullanılır.
            </p>
          </div>
          <div className="glass-panel p-5 md:p-8 rounded-2xl hover:bg-black/60 transition-all group">
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2 group-hover:text-purple-400 transition-colors">⊞ Bifacial (Çift Yüzlü)</h3>
            <p className="text-gray-400 leading-relaxed text-sm">
              Hem ön hem arka yüzeyinden ışık alan yeni nesil panellerdir. Arka taraftan yansıyan ışığı da toplayarak toplam verimi %10-30 artırabilir. Açık renkli zeminler üzerinde kurulduğunda yüksek performans gösterir.
            </p>
          </div>
        </div>

        <div className="bg-sun-green/5 border border-sun-green/20 rounded-2xl p-6 flex gap-4 items-start">
          <Lightbulb className="w-6 h-6 text-sun-green flex-shrink-0 mt-1" />
          <p className="text-gray-300 text-sm leading-relaxed">
            <strong className="text-white">SunShare Tavsiyesi:</strong> Çatı projeleri için monokristalin, arsa projeleri için polikristalin paneller genellikle en optimum seçimdir. Fizibilite raporumuz projenize en uygun panel türünü otomatik olarak önerir.
          </p>
        </div>
      </div>

      {/* 3. Bakım Rehberi */}
      <div id="bakim" className="mb-24 scroll-mt-24">
        <div className="flex items-center gap-4 mb-8 pb-4 border-b border-white/10">
          <div className="w-12 h-12 rounded-xl bg-sun-green/10 border border-sun-green/20 flex items-center justify-center flex-shrink-0">
            <Wrench className="w-6 h-6 text-sun-green" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Bakım & Temizlik Rehberi</h2>
            <p className="text-sm text-gray-500 mt-1">Panellerinizi en verimli şekilde çalıştırmanın yolları</p>
          </div>
        </div>

        <div className="glass-panel p-4 md:p-8 rounded-2xl mb-6 overflow-x-auto">
          <h3 className="text-lg font-bold text-white mb-6">📅 Periyodik Bakım Takvimi</h3>
          <table className="w-full text-left text-sm text-gray-400">
            <thead className="text-xs text-gray-500 uppercase bg-black/40">
              <tr>
                <th className="px-3 md:px-6 py-3 md:py-4 rounded-tl-xl border-b border-white/5 whitespace-nowrap">İşlem</th>
                <th className="px-3 md:px-6 py-3 md:py-4 border-b border-white/5 whitespace-nowrap">Sıklık</th>
                <th className="px-3 md:px-6 py-3 md:py-4 rounded-tr-xl border-b border-white/5">Detay</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <tr className="hover:bg-white/5 transition-colors">
                <td className="px-3 md:px-6 py-3 md:py-4 font-medium text-white whitespace-nowrap">Görsel Kontrol</td>
                <td className="px-3 md:px-6 py-3 md:py-4"><span className="px-3 py-1 bg-sun-green/10 text-sun-green rounded-full text-xs font-semibold">Aylık</span></td>
                <td className="px-3 md:px-6 py-3 md:py-4">Panel yüzeyinde çatlak, kir birikimi, kablo gevşeme kontrolü.</td>
              </tr>
              <tr className="hover:bg-white/5 transition-colors">
                <td className="px-3 md:px-6 py-3 md:py-4 font-medium text-white whitespace-nowrap">Genel Temizlik</td>
                <td className="px-3 md:px-6 py-3 md:py-4"><span className="px-3 py-1 bg-brand-blue/10 text-brand-blue rounded-full text-xs font-semibold">3 Ayda Bir</span></td>
                <td className="px-3 md:px-6 py-3 md:py-4">Yumuşak fırça ve su ile silme. Kimyasal deterjan kullanılmamalıdır.</td>
              </tr>
              <tr className="hover:bg-white/5 transition-colors">
                <td className="px-3 md:px-6 py-3 md:py-4 font-medium text-white whitespace-nowrap">Elektrik Bağlantı</td>
                <td className="px-3 md:px-6 py-3 md:py-4"><span className="px-3 py-1 bg-amber-500/10 text-amber-500 rounded-full text-xs font-semibold">6 Ayda Bir</span></td>
                <td className="px-3 md:px-6 py-3 md:py-4">Kablo, topraklama, sigorta kontrolü. Yetkili personelce yapılmalı.</td>
              </tr>
              <tr className="hover:bg-white/5 transition-colors">
                <td className="px-3 md:px-6 py-3 md:py-4 font-medium text-white whitespace-nowrap">Profesyonel Bakım</td>
                <td className="px-3 md:px-6 py-3 md:py-4"><span className="px-3 py-1 bg-red-500/10 text-red-400 rounded-full text-xs font-semibold">Yıllık</span></td>
                <td className="px-3 md:px-6 py-3 md:py-4">Termal kamera ile tarama, IV eğrisi ölçümü, izolasyon testi.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="glass-panel p-8 rounded-2xl">
            <h3 className="text-lg font-bold text-white mb-3">🧹 Doğru Temizlik Nasıl Yapılır?</h3>
            <p className="text-gray-400 leading-relaxed text-sm">
              Panelleri sabahın erken saatlerinde temizleyin — sıcak panele soğuk su sıkmak termal şoka neden olabilir. Yumuşak sünger kullanın, aşındırıcı malzeme kullanmayın. Kireçli su leke bırakacağı için saf su tercih edin. Basınçlı yıkama contalara zarar verebilir.
            </p>
          </div>
          <div className="glass-panel p-8 rounded-2xl">
            <h3 className="text-lg font-bold text-white mb-3">🍂 Mevsimsel Dikkat Noktaları</h3>
            <p className="text-gray-400 leading-relaxed text-sm">
              <strong>İlkbahar:</strong> Polen birikimi temizliği. <strong>Yaz:</strong> Sıcaklık kaynaklı verim düşüşü takibi. <strong>Sonbahar:</strong> Yaprak birikimi temizliği. <strong>Kış:</strong> Kar yükü kontrolü ve buz oluşumu takibi.
            </p>
          </div>
        </div>

        <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6 flex gap-4 items-start">
          <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
          <p className="text-gray-300 text-sm leading-relaxed">
            <strong className="text-white">Önemli Uyarı:</strong> Panel üzerine kesinlikle basmayın veya ağır cisim koymayın. Mikro çatlaklar gözle görülmez ancak verimi kalıcı olarak %10-20 düşürür. Elektrik bağlantılarına müdahale etmeden önce sistemi mutlaka kapatın.
          </p>
        </div>
      </div>

      {/* 4. Verimlilik */}
      <div id="verimlilik" className="mb-24 scroll-mt-24">
        <div className="flex items-center gap-4 mb-8 pb-4 border-b border-white/10">
          <div className="w-12 h-12 rounded-xl bg-sun-green/10 border border-sun-green/20 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-6 h-6 text-sun-green" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Verimlilik ve Performans</h2>
            <p className="text-sm text-gray-500 mt-1">Üretimi etkileyen faktörler ve optimizasyon yolları</p>
          </div>
        </div>

        <div className="glass-panel p-8 rounded-2xl mb-6">
          <h3 className="text-lg font-bold text-white mb-6">🎯 Verimi Etkileyen Temel Faktörler</h3>
          <div className="space-y-4">
            {[
              { title: "Panel Yönü ve Eğimi", desc: "Türkiye'de paneller güneye bakacak şekilde 25°-35° eğimle kurulmalıdır. Yanlış açı üretimi %25 düşürebilir." },
              { title: "Gölgelenme", desc: "Tek bir hücrenin gölgelenmesi tüm string'in verimini düşürür. Baca, ağaç ve komşu bina gölgeleri analiz edilmelidir." },
              { title: "Sıcaklık", desc: "Paneller 25°C'de en verimli çalışır. Her 1°C artış verimi yaklaşık %0.3-0.5 düşürür." },
              { title: "İnvertör Kalitesi", desc: "Düşük kaliteli invertörler %5-10 dönüşüm kaybı yaratır. Optimizör kullanımı gölgeli ortamlarda verimi artırır." }
            ].map((item, i) => (
              <div key={i} className="flex gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
                <CheckCircle2 className="w-5 h-5 text-sun-green flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-white font-medium text-sm mb-1">{item.title}</h4>
                  <p className="text-gray-400 text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Maliyet */}
      <div id="maliyet" className="mb-24 scroll-mt-24">
        <div className="flex items-center gap-4 mb-8 pb-4 border-b border-white/10">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
            <Coins className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Maliyet ve Teşvikler</h2>
            <p className="text-sm text-gray-500 mt-1">Yatırım maliyetleri ve geri ödeme süreleri</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="glass-panel p-6 rounded-2xl border-l-4 border-l-sun-green">
            <h3 className="text-white font-bold mb-2">💵 Kurulum Maliyeti</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Türkiye'de 1 kWp kurulum ortalama 800-1.200 USD arasındadır. 10 kWp'lik çatı sistemi ~8.000-12.000 USD'ye mal olur. Büyük projelerde birim maliyet düşer.
            </p>
          </div>
          <div className="glass-panel p-6 rounded-2xl border-l-4 border-l-brand-blue">
            <h3 className="text-white font-bold mb-2">⏱️ Geri Ödeme Süresi</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Konuma ve tüketime bağlı olarak yatırım 3-6 yıl içinde kendini amorti eder. Kalan 20+ yıl boyunca üretilen enerji net kârdır.
            </p>
          </div>
          <div className="glass-panel p-6 rounded-2xl border-l-4 border-l-purple-500">
            <h3 className="text-white font-bold mb-2">🏛️ YEKDEM Teşvikleri</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Yenilenebilir Enerji Kaynakları Destekleme Mekanizması kapsamında üretimler için alım garantisi sağlanır. Yerli ekipmanda ek teşvik vardır.
            </p>
          </div>
          <div className="glass-panel p-6 rounded-2xl border-l-4 border-l-amber-500">
            <h3 className="text-white font-bold mb-2">📋 Lisanssız Üretim</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Türkiye'de 5 MW'a kadar santraller lisanssız kurulabilir. Bireysel yatırımcılar için bürokratik süreçler büyük ölçüde kolaylaştırılmıştır.
            </p>
          </div>
        </div>
      </div>

      {/* 6. Çevresel Etki */}
      <div id="cevre" className="mb-24 scroll-mt-24">
        <div className="flex items-center gap-4 mb-8 pb-4 border-b border-white/10">
          <div className="w-12 h-12 rounded-xl bg-sun-green/10 border border-sun-green/20 flex items-center justify-center flex-shrink-0">
            <Leaf className="w-6 h-6 text-sun-green" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Çevresel Etki</h2>
            <p className="text-sm text-gray-500 mt-1">Karbon ayak izinizi azaltın, geleceğe yatırım yapın</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="glass-panel p-8 rounded-2xl text-center">
            <div className="text-3xl md:text-5xl font-extrabold text-sun-green mb-2">900<span className="text-xl md:text-2xl font-medium text-gray-400">kg</span></div>
            <p className="text-sm text-gray-400 uppercase tracking-widest font-semibold">CO₂ / kWp / Yıl Tasarruf</p>
          </div>
          <div className="glass-panel p-8 rounded-2xl text-center">
            <div className="text-3xl md:text-5xl font-extrabold text-sun-green mb-2">%95</div>
            <p className="text-sm text-gray-400 uppercase tracking-widest font-semibold">Geri Dönüştürülebilir Oran</p>
          </div>
        </div>

        <div className="glass-panel p-8 rounded-2xl">
          <p className="text-gray-300 leading-relaxed text-center">
            1 kWp'lik güneş paneli yılda yaklaşık 900 kg CO₂ emisyonunu önler. Bu, bir ağacın yılda absorbe ettiği miktarın yaklaşık 40 katıdır. 10 kWp'lik bir çatı sistemi, yılda yaklaşık 9 ton karbon tasarrufu sağlar — bu da bir otomobilin yılda ürettiği emisyonun yaklaşık 2 katıdır. Modern güneş panellerinin %95'i (cam, alüminyum, silikon) geri dönüştürülebilmektedir.
          </p>
        </div>
      </div>

      {/* 7. SSS */}
      <div id="sss" className="mb-10 scroll-mt-24">
        <div className="flex items-center gap-4 mb-8 pb-4 border-b border-white/10">
          <div className="w-12 h-12 rounded-xl bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center flex-shrink-0">
            <HelpCircle className="w-6 h-6 text-brand-blue" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Sıkça Sorulan Sorular</h2>
            <p className="text-sm text-gray-500 mt-1">Merak edilen konulara hızlı cevaplar</p>
          </div>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div 
                key={index} 
                className={`glass-panel border rounded-2xl overflow-hidden transition-all duration-300 ${isOpen ? 'border-sun-green/50 shadow-[0_0_20px_rgba(16,185,129,0.1)]' : 'border-white/5 hover:border-white/20'}`}
              >
                <button 
                  onClick={() => toggleFaq(index)}
                  className="w-full text-left px-6 py-5 flex items-center justify-between focus:outline-none"
                >
                  <span className={`font-semibold text-sm md:text-base pr-4 transition-colors ${isOpen ? 'text-sun-green' : 'text-white'}`}>
                    {faq.q}
                  </span>
                  <ChevronDown className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 text-sun-green' : 'text-gray-500'}`} />
                </button>
                
                <div 
                  className={`px-6 overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-96 pb-6 opacity-100' : 'max-h-0 opacity-0'}`}
                >
                  <p className="text-gray-400 text-sm leading-relaxed border-t border-white/5 pt-4">
                    {faq.a}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Note */}
      <div className="text-center pt-10 border-t border-white/10 mt-20">
        <p className="text-xs text-gray-500">
          Bu içerik <span className="text-sun-green font-semibold">SunShare</span> platformu tarafından bilgilendirme amacıyla hazırlanmıştır.<br/>Yatırım kararlarınızda profesyonel danışmanlık almanız önerilir.
        </p>
      </div>

    </div>
  );
};

export default InfoCenter;
