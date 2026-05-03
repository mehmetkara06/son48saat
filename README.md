# 🚀 Çalışan Prototip Linki: [https://son48saat.vercel.app/](https://son48saat.vercel.app/)
# 📊 Proje Sunum Dosyaları (Drive): [Buraya Tıklayın](https://drive.google.com/drive/folders/1bs5osDWNeltX5CRgkt2Tf3ZHuCqsYqLO?usp=sharing)

---

# React + Vite

Bu proje, React'in Vite ile hızlı bir şekilde çalışması için yapılandırılmıştır. Geliştirme aşamasında HMR (Hot Module Replacement) ve ESLint kurallarını içeren minimal bir kuruluma sahiptir.

## Kullanılan Teknolojiler ve Eklentiler

Şu anki yapıda iki resmi eklenti mevcuttur:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) - [Oxc](https://oxc.rs) kullanır.
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) - [SWC](https://swc.rs/) kullanır.

## Önemli Notlar

### React Compiler
React Compiler, geliştirme ve derleme (build) performansı üzerindeki etkileri nedeniyle bu şablonda varsayılan olarak etkinleştirilmemiştir. Eklemek isterseniz [kurulum dokümantasyonuna](https://react.dev/learn/react-compiler/installation) göz atabilirsiniz.

### ESLint Yapılandırması
Eğer bu projeyi üretim (production) aşamasına taşımayı planlıyorsanız, tip güvenliği için TypeScript ve `typescript-eslint` entegrasyonu önerilir. Detaylı bilgi için [Vite TS Şablonuna](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) bakabilirsiniz.
