# 🚀 Telegram Web Clone (React + Strict TypeScript)

Zamonaviy, yuqori tezlikda ishlovchi, xavfsiz va to'liq Telegram Web (Web K / Web A) kloni. Hech qanday og'ir tashqi UI kutubxonalarisiz (zero third-party UI libs), sof React 19, Strict TypeScript, React Context + useReducer va maxsus IndexedDB wrapper yordamida yaratilgan.

---

## 📑 Mundarija
- [Imkoniyatlar va UI komponentlar](#-imkoniyatlar-va-ui-komponentlar)
- [Loyiha fayllar tuzilmasi](#-loyiha-fayllar-tuzilmasi)
- [Texnik arxitektura](#-texnik-arxitektura)
- [Mahalliy ishga tushirish (Local Run)](#-mahalliy-ishga-tushirish-local-run)
- [Vercel va Netlify deploy yo'riqnomasi](#-vercel-va-netlify-deploy-yoriqnomasi)
- [Keyingi qadam: WebSocket yoki Firebase bilan integratsiya](#-keyingi-qadam-websocket-yoki-firebase-bilan-integratsiya)

---

## 🌟 Imkoniyatlar va UI Komponentlar

1. **Papkalar qatori (FolderTabs)**:
   - Chatlar ro'yxati tepasida joylashgan: *Barchasi*, *Shaxsiy*, *Guruhlar*, *Kanallar*, *O'qilmagan*, *Botlar*.
   - Faol papka tagida silliq animatsiyali chiziq (active indicator).
   - Har bir papkada real vaqtda hisoblanuvchi o'qilmagan xabarlar soni (badge).
   - Klaviatura bilan (← / →) papkalar orasida o'tish imkoniyati.

2. **Suhbat sarlavhasi (ChatHeader)**:
   - Katta avatar va pastki o'ng burchakda yashil onlayn nuqtasi (`size="lg"`).
   - Suhbatdoshingiz ismi va tasdiqlanganlik ko'k belgisi (verified badge).
   - Dinamik holat matni: `"onlayn"`, `"yozmoqda..."` (3 ta animatsiyali nuqta bilan), `"oxirgi marta 12:40"`, yoki guruhlar uchun `"5 a'zo, 2 ta onlayn"`.
   - Interaktiv harakatlar: Audio qo'ng'iroq (Call), Qidiruv (Search), Ko'proq amallar menyusi (Ovozsiz qilish, Chatni o'chirish).

3. **Guruh xabarlari (MessageBubble)**:
   - Kiruvchi xabar pufakchasi tepasida yuboruvchining ismi alohida Telegram ranglarida (har bir a'zoga uning ID/ismiga mos 8 xil rangdan biri).
   - Xabar yonida yuboruvchining kichik avatar surati.
   - Javob berilgan xabar (Reply preview) kartochkasi.

4. **Pastki panel (MessageInput & EmojiPicker)**:
   - **Biriktirish (Attachment)**: Suratlar, PDF va fayllarni yuklash hamda yuborishdan oldin ko'rish.
   - **Matn maydoni**: Avtomatik kengayuvchi (auto-growing) textarea, `Enter` orqali yuborish, `Shift+Enter` orqali yangi qator.
   - **Emoji paneli**: Toifalarga bo'lingan (Smileys, Reactions, Objects), tezkor qidiruv bilan ta'minlangan popover.
   - **Yuborish tugmasi**: Matn borligiga qarab samolyot (yuborish) yoki ovozli xabar (mikrofon) belgisiga avtomatik almashadi.

5. **Yuqori tezlikdagi Virtual Scroll (1000+ Xabarlar)**:
   - `useVirtualList` custom hook'i DOM yuklamasini minimumda ushlab turadi: faqat ekranda ko'rinayotgan xabarlar render qilinadi.
   - **1200+ xabar** yuklangan *🚀 1000+ Xabarlar Test Guruhi (Performance)* chatida 60fps tezlikda silliq aylanish.
   - Yangi xabar kelganda pastga avtomatik scroll bo'lishi va yuqoriga chiqilganda suzuvchi "Pastga o'tish" tugmasi.

6. **Optimistik yangilanish (Optimistic Updates)**:
   - Foydalanuvchi xabar yuborgan zahoti xabar darhol ekranda paydo bo'ladi (status: `'sending'`, soat belgisi `🕒`).
   - ~350ms dan so'ng serverga yuborildi (`'sent'`, bitta belgi `✓`).
   - ~1150ms dan so'ng suhbatdosh tomonidan o'qildi (`'read'`, ikkita belgi `✓✓`).
   - Suhbatdoshning avtomatik javob qaytarishi (simulated real-time interaction).

7. **Multi-tab Real-time sinxronizatsiya (`useBroadcast`)**:
   - `BroadcastChannel` API orqali ilovani 2 ta alohida tabda ochsangiz ham, birida yozilgan xabarlar, reaktsiyalar va "yozmoqda..." holati ikkinchisida darhol ko'rinadi!

8. **A11y (Accessibility) & Klaviatura boshqaruvi**:
   - `aria-label`, `aria-live="polite"` (yangi xabarlarni ekran o'quvchilarga bildirish), `role="listbox"`, `role="tablist"`.
   - Chatlar ro'yxatida `↑` va `↓` strelkalari orqali chatlar orasida harakatlanish, `Enter` orqali ochish.
   - `Escape` tugmasi orqali barcha modal oynalar, emoji picker va kontekst menyuni yopish.
   - Fokuslangan elementlar uchun `focus-visible` ko'rsatkichi.

9. **Xavfsizlik (Security & XSS Prevention)**:
   - Hech qanday `dangerouslySetInnerHTML` ishlatilmaydi.
   - Barcha xabarlar sof React matn tugunlari sifatida render qilinadi.
   - Havolalar xavfsiz regex orqali aniqlanib, `target="_blank"` va `rel="noopener noreferrer"` attributlari bilan ochiladi.

10. **Qorong'u va Yorug' Mavzu (Dark/Light Mode)**:
    - Telegramning rasmiy qorong'u (Dark Slate `#17212b`) va yorug' ranglari, fon naqshi va pufakcha dizayni.

---

## 📁 Loyiha Fayllar Tuzilmasi

```
chat-app/
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.app.json
├── src/
│   ├── types/
│   │   ├── user.ts            # User, CurrentUserProfile, UserStatus
│   │   ├── attachment.ts      # Attachment, AttachmentType
│   │   ├── message.ts         # Message, MessageStatus, MessageReaction, ReplyInfo
│   │   ├── chat.ts            # Chat, ChatType, ChatMember, Folder
│   │   └── index.ts           # Barcha tiplarni birlashtiruvchi index
│   ├── services/
│   │   ├── db.ts              # IndexedDB uchun maxsus Promise-based wrapper
│   │   ├── mockData.ts        # Boshlang'ich chatlar, kontaktlar va 1200+ xabar generatori
│   │   └── chatService.ts     # Offline saqlash va API qatlami
│   ├── context/
│   │   ├── types.ts           # ChatState va ChatAction discriminated union turlari
│   │   ├── chatReducer.ts     # Sof holat reduktori (immutability)
│   │   ├── useChatContext.ts  # ChatContext va useChatContext hook'i
│   │   └── ChatContext.tsx    # Ilovaning asosiy State Provider'i
│   ├── hooks/
│   │   ├── useChats.ts           # Chatlarni filtrlash, papkalar, unread badge'lar
│   │   ├── useMessages.ts        # Xabarlarni yuklash, optimistik yuborish, o'chirish, qadash
│   │   ├── useBroadcast.ts       # BroadcastChannel orqali tablararo sinxronizatsiya
│   │   ├── useTypingIndicator.ts # "Yozmoqda..." holatini boshqarish va avtomatik tozalash
│   │   ├── useMediaQuery.ts      # Mobil va planshet o'lchamlarini aniqlash (useSyncExternalStore)
│   │   └── useVirtualList.ts     # 1000+ xabarni silliq renderlovchi virtual scroll hook'i
│   ├── components/
│   │   ├── Avatar/               # Surat, bosh harflar (initials), onlayn belgisi
│   │   ├── FolderTabs/           # Papkalar satri va o'qilmaganlar soni
│   │   ├── ChatListItem/         # Chatlar ro'yxatidagi alohida satr
│   │   ├── Sidebar/              # Qidiruv, menyu, papkalar va chatlar ro'yxati
│   │   ├── ChatHeader/           # Suhbat sarlavhasi, ism, status, qo'ng'iroq/menyu
│   │   ├── PinnedBar/            # Qadalgan xabar satri va sakrash
│   │   ├── MessageBubble/        # Kiruvchi/chiquvchi pufakcha, reaktsiyalar, a'zo ranglari
│   │   ├── MessageInput/         # Biriktirish, auto-growing input, emoji, yuborish
│   │   ├── EmojiPicker/          # Emojilar to'plami va qidiruv oynasi
│   │   ├── ContextMenu/          # Sichqonchaning o'ng tugmasi kontekst menyusi
│   │   ├── NewChatDialog/        # Yangi chat, guruh yoki kanal ochish modali
│   │   └── SettingsPanel/        # Profil sozlamalari, mavzu o'zgartirish, test benchmarki
│   ├── utils/
│   │   ├── colors.ts             # Telegram a'zo ranglarini yaratish
│   │   ├── formatters.ts         # Vaqt va hajm formatlash
│   │   └── textParser.tsx        # XSS-xavfsiz havolalarni ajratuvchi parser
│   ├── styles/
│   │   ├── variables.css         # Telegram ranglar palitrasi va CSS o'zgaruvchilar
│   │   └── global.css            # Global reset, scrollbarlar, focus-visible
│   ├── App.tsx                   # Asosiy konteyner va klaviatura hodisalari
│   └── main.tsx                  # React 19 StrictMode kirish nuqtasi
```

---

## 🛠 Texnik Arxitektura

- **Strict TypeScript**: Hech qanday `any` ishlatilmagan. Barcha komponentlar, holatlar, harakatlar (actions) va modellarga qat'iy tiplar berilgan.
- **State Management**: Tashqi kutubxonalarsiz (Zustand/Redux'siz), sof `React.createContext` va `useReducer` kombinatsiyasi.
- **Offline Storage**: Maxsus yozilgan `TelegramIndexedDB` wrapper'i barcha chatlar, xabarlar va profil sozlamalarini brauzerning IndexedDB xotirasida saqlaydi. Sahifa yangilansa ham barcha ma'lumotlar saqlanib qoladi.
- **Performance**: `useVirtualList` orqali 1000 dan ortiq xabarlar xotira to'lmasdan render qilinadi.

---

## 💻 Mahalliy Ishga Tushirish (Local Run)

Loyiha katalogiga kiring va ishlab chiqish serverini ishga tushiring:

```bash
cd "/Users/Shakhzod0222/Desktop/My projects/Telegram clone/chat-app"
npm run dev
```

Brauzerda `http://localhost:5173` manzilini oching.

### Loyihani tekshirish buyruqlari:
```bash
# Kod sifatini tekshirish (oxlint)
npm run lint

# TypeScript tekshiruvi va production bundle yig'ish
npm run build

# Yig'ilgan versiyani ko'rish
npm run preview
```

---

## 🌐 Vercel va Netlify Deploy Yo'riqnomasi

### 1. Vercel orqali deploy qilish:

#### A) Vercel CLI yordamida (eng tez yo'l):
```bash
# Vercel CLI o'rnatish
npm i -g vercel

# Loyiha papkasiga kirish
cd chat-app

# Deploy qilish
vercel
```

#### B) Vercel Web Dashboard orqali:
1. Loyihangizni GitHub/GitLab omboriga yuklang (push).
2. [vercel.com](https://vercel.com) ga kiring va **"Add New Project"** tugmasini bosing.
3. GitHub omboringizni tanlang.
4. **Root Directory** bo'limida `chat-app` papkasini ko'rsating (agar loyiha subpapka ichida bo'lsa).
5. Build sozlamalari avtomatik aniqlanadi:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. **"Deploy"** tugmasini bosing.

---

### 2. Netlify orqali deploy qilish:

#### A) Netlify CLI yordamida:
```bash
npm i -g netlify-cli
cd chat-app
netlify deploy --prod --dir=dist
```

#### B) Netlify Web Dashboard orqali:
1. [app.netlify.com](https://app.netlify.com) ga kiring.
2. **"Add new site"** -> **"Import an existing project"** ni tanlang.
3. Git provayderingizni ulang.
4. Sozlamalarni kiriting:
   - **Base directory**: `chat-app`
   - **Build command**: `npm run build`
   - **Publish directory**: `chat-app/dist`
5. SPA (Single Page Application) routing uchun loyiha ildizida `public/_redirects` fayli yaratib, unga quyidagini yozib qo'yishingiz mumkin:
   ```
   /*    /index.html   200
   ```
6. **"Deploy site"** tugmasini bosing.

---

## 🔌 Keyingi Qadam: WebSocket yoki Firebase bilan Integratsiya

Hozirgi vaqtda ilovada `src/services/chatService.ts` brauzerning IndexedDB xotirasi hamda `useBroadcast` orqali tablararo real-time sinxronizatsiyadan foydalanadi.

Haqiqiy serverli real-time backendga o'tish uchun quyidagi 2 ta variantdan birini tanlashingiz mumkin:

### 1-variant: WebSocket (Node.js / Socket.io / Go / Fastify)

`src/services/chatService.ts` faylini WebSocket mijozi bilan almashtirish:

```typescript
// src/services/websocketChatService.ts
import type { Message, Chat, MessageStatus } from '../types';

class WebSocketChatService {
  private socket: WebSocket | null = null;
  private listeners: ((message: Message) => void)[] = [];

  public connect(token: string) {
    this.socket = new WebSocket(`wss://api.yourdomain.com/ws?token=${token}`);

    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'NEW_MESSAGE') {
        this.listeners.forEach((fn) => fn(data.payload));
      }
    };
  }

  public sendMessage(message: Message) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type: 'SEND_MESSAGE', payload: message }));
    }
  }

  public onNewMessage(callback: (message: Message) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((fn) => fn !== callback);
    };
  }
}

export const wsService = new WebSocketChatService();
```

---

### 2-variant: Firebase (Firestore & Realtime Database)

Server qurmasdan to'liq bulutli backendga o'tish uchun:

1. Firebase paketlarini o'rnating:
   ```bash
   npm install firebase
   ```

2. Firebase config faylini yarating (`src/services/firebase.ts`):
   ```typescript
   import { initializeApp } from 'firebase/app';
   import { getFirestore, collection, addDoc, onSnapshot, query, orderBy } from 'firebase/firestore';

   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "your-app.firebaseapp.com",
     projectId: "your-app",
     storageBucket: "your-app.appspot.com",
     messagingSenderId: "...",
     appId: "..."
   };

   const app = initializeApp(firebaseConfig);
   export const firestore = getFirestore(app);
   ```

3. `useMessages` ichida xabarlarni real-time eshitish:
   ```typescript
   useEffect(() => {
     if (!chatId) return;

     const q = query(
       collection(firestore, `chats/${chatId}/messages`),
       orderBy('timestamp', 'asc')
     );

     const unsubscribe = onSnapshot(q, (snapshot) => {
       const msgs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Message[];
       dispatch({ type: 'LOAD_MESSAGES', payload: { chatId, messages: msgs } });
     });

     return () => unsubscribe();
   }, [chatId]);
   ```

Bu arxitektura mavjud React Context va `useReducer` holatiga to'liq mos tushadi, hech qanday komponent kodini o'zgartirish talab etilmaydi!
# Telegram-clone
# Telegram-clone
