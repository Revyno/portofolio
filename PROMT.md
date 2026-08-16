# AI VRM Assistant — Web Implementation

Saya ingin mengimplementasikan fitur **AI Assistant berbasis VRM** ke dalam website saya menggunakan konsep/arsitektur dari repository **AIRI (moeru-ai/airi)**.

Repository referensi:
https://github.com/moeru-ai/airi

## Tujuan

Buat sebuah **AI Assistant berbasis karakter VRM** yang dapat digunakan langsung di website.

Assistant harus tampil sebagai floating widget di **pojok kanan bawah halaman**, mirip seperti AI chatbot modern, tetapi menggunakan karakter VRM 3D sebagai visual utama.

Karakter VRM akan menggunakan file VRM milik saya sendiri.

## Konsep UI

Desktop:

```text
┌──────────────────────────────────────────────┐
│                                              │
│              WEBSITE CONTENT                 │
│                                              │
│                                              │
│                                              │
│                                      ┌──────┐│
│                                      │ VRM  ││
│                                      │      ││
│                                      │  AI  ││
│                                      └──────┘│
│                                      ┌──────┐│
│                                      │ Chat ││
│                                      └──────┘│
└──────────────────────────────────────────────┘
```

Assistant berada di:

* `bottom: 20px`
* `right: 20px`

Jangan mengganggu konten utama website.

Gunakan `position: fixed`.

## Responsive Behavior

### Desktop

Tampilkan floating assistant dengan ukuran sekitar:

* width: 360–420px
* height: 520–650px

VRM menjadi fokus utama pada bagian atas.

Chat interface berada pada bagian bawah.

### Tablet

Sesuaikan ukuran menjadi lebih kecil:

* width: sekitar 320–360px
* height: sekitar 500–580px

### Mobile

Assistant harus responsive.

Jangan membuat widget keluar dari viewport.

Gunakan:

```css
width: min(92vw, 420px);
max-height: 85vh;
```

Pada mobile, assistant dapat berubah menjadi hampir full-width tetapi tetap memiliki margin dari sisi layar.

Contoh:

```text
┌───────────────────────┐
│                       │
│     WEBSITE           │
│                       │
│                       │
│  ┌─────────────────┐  │
│  │      VRM        │  │
│  │                 │  │
│  │    Assistant    │  │
│  ├─────────────────┤  │
│  │ Chat            │  │
│  │                 │  │
│  │ [ Type message ]│  │
│  └─────────────────┘  │
└───────────────────────┘
```

## Floating Button

Ketika assistant ditutup, tampilkan floating button di kanan bawah.

Contoh:

```text
┌───────────────────────────────┐
│                               │
│                               │
│                         ┌───┐ │
│                         │ AI│ │
│                         └───┘ │
└───────────────────────────────┘
```

Ketika button diklik:

```text
Floating Button
       ↓
Open Assistant
       ↓
VRM + Chat Interface
```

Tambahkan animasi pembukaan yang smooth.

## VRM Character

Gunakan VRM milik saya sendiri.

File:

```text
/public/models/assistant.vrm
```

Gunakan teknologi WebGL/Three.js yang sesuai dengan ekosistem AIRI.

VRM harus memiliki:

* Idle animation
* Blink
* Eye movement / look-at
* Basic facial expression
* Speaking state
* Mouth movement ketika TTS berjalan

Jangan membuat karakter hanya sebagai gambar/video.

Karakter harus benar-benar dirender sebagai model VRM 3D.

## AI Interaction

Assistant harus memiliki interface:

```text
User
 ↓
Chat UI
 ↓
AI Controller
 ↓
LLM
 ↓
Response
 ↓
TTS
 ↓
VRM Speaking Animation
```

User dapat:

1. Mengirim text
2. Mendapatkan response AI
3. Melihat VRM berbicara
4. Mendengar voice response

Jika STT tersedia, sediakan juga opsi voice input.

## Assistant State

Buat state untuk:

```text
idle
thinking
speaking
listening
error
```

Contoh:

```text
idle
   ↓
user sends message
   ↓
thinking
   ↓
AI response
   ↓
speaking
   ↓
finished
   ↓
idle
```

VRM harus memberikan visual feedback sesuai state.

Contoh:

* `idle` → idle animation
* `thinking` → subtle animation/expression
* `speaking` → mouth movement
* `listening` → listening expression
* `error` → error state

## UI

Gunakan desain modern dan minimal.

Assistant harus terlihat seperti bagian dari website, bukan seperti admin dashboard.

Gunakan:

* rounded corners
* subtle shadow
* backdrop blur jika sesuai
* smooth transition
* clean typography
* responsive layout

Jangan menggunakan UI yang terlalu besar.

## Chat Interface

Chat harus memiliki:

```text
Assistant message

User message

Assistant message

User message
```

Input:

```text
┌─────────────────────────────┐
│ Ask me something...      ➤ │
└─────────────────────────────┘
```

Tambahkan:

* Send button
* Loading indicator
* Scrollable chat history
* Clear conversation
* Voice button jika STT tersedia

## Website Integration

Assistant harus bisa digunakan secara global.

Buat component:

```text
components/
└── ai-assistant/
    ├── AIAssistant.tsx
    ├── AssistantButton.tsx
    ├── AssistantWindow.tsx
    ├── VRMCharacter.tsx
    ├── ChatMessages.tsx
    ├── ChatInput.tsx
    ├── VoiceInput.tsx
    └── assistant-store.ts
```

Kemudian gunakan:

```tsx
<AIAssistant />
```

di root layout sehingga assistant tersedia di seluruh halaman.

## Performance

Perhatikan performa karena VRM menggunakan WebGL.

Implementasikan:

* Lazy loading
* Dynamic import untuk Three.js/VRM
* Jangan load VRM sebelum assistant dibuka jika tidak diperlukan
* Cleanup WebGL resources ketika component unmount
* Hindari multiple WebGL renderer
* Optimalkan animation loop
* Jangan menghambat initial page load

Jika Next.js digunakan, komponen VRM harus berjalan sebagai client component.

## Accessibility

Assistant harus memiliki:

* Keyboard navigation
* Accessible button
* ARIA labels
* Focus management
* Close button
* Escape untuk menutup assistant

## Z-Index

Assistant harus berada di atas konten website tetapi tidak mengganggu navbar/modal lain.

Gunakan z-index yang terkontrol, misalnya:

```css
z-index: 9999;
```

Hindari menggunakan z-index ekstrem tanpa alasan.

## Architecture

Gunakan struktur:

```text
Website
   │
   ├── Global Layout
   │      │
   │      └── AIAssistant
   │              │
   │              ├── Floating Button
   │              │
   │              └── Assistant Window
   │                       │
   │                       ├── VRM Renderer
   │                       │
   │                       ├── Chat
   │                       │
   │                       ├── STT
   │                       │
   │                       └── TTS
   │
   └── Website Pages
```

## AIRI Integration

Gunakan repository AIRI sebagai referensi utama:

https://github.com/moeru-ai/airi

Pelajari terlebih dahulu struktur AIRI dan identifikasi package/library yang benar-benar diperlukan.

Jangan menyalin seluruh aplikasi AIRI ke dalam project.

Ambil hanya bagian yang diperlukan untuk:

* VRM rendering
* VRM animation
* AI communication
* TTS
* STT
* Character state
* Relevant utilities

Pastikan dependency yang digunakan kompatibel dengan project existing.

## Important

Sebelum melakukan implementasi:

1. Analisis struktur project existing.
2. Identifikasi framework dan versi yang digunakan.
3. Periksa dependency yang sudah tersedia.
4. Hindari konflik dependency.
5. Jangan mengubah arsitektur project existing secara besar-besaran.
6. Gunakan component yang modular.
7. Pisahkan VRM rendering dari AI logic.
8. Pisahkan chat UI dari AI provider.
9. Buat AI provider abstraction sehingga LLM dapat diganti.
10. Jangan hardcode API key di frontend.

## Environment Variables

Gunakan environment variable untuk API configuration.

Contoh:

```env
NEXT_PUBLIC_AI_ENABLED=true
AI_API_URL=
AI_API_KEY=
AI_MODEL=
TTS_API_URL=
STT_API_URL=
```

API key yang bersifat secret tidak boleh menggunakan `NEXT_PUBLIC_`.

## Expected Result

Hasil akhir harus berupa:

```text
Website
│
├── Floating AI Button
│
└── AI Assistant
      │
      ├── VRM Character
      │      ├── Idle
      │      ├── Blink
      │      ├── Look At
      │      ├── Expression
      │      └── Speaking
      │
      ├── Chat
      │
      ├── LLM
      │
      ├── TTS
      │
      └── Optional STT
```

Assistant harus:

* Responsive
* Mobile friendly
* Desktop friendly
* Tidak mengganggu website
* Menggunakan VRM custom milik saya
* Bisa chat dengan AI
* Bisa berbicara menggunakan TTS
* Memiliki animasi saat berbicara
* Bisa dibuka/tutup
* Berjalan secara global di website
* Memiliki performa yang baik
* Menggunakan arsitektur modular
* Mudah dikembangkan di masa depan

## Final Requirement

Jangan langsung melakukan implementasi sebelum memahami repository AIRI dan project existing.

Pertama berikan:

1. Analisis arsitektur existing project.
2. Package AIRI yang relevan.
3. Dependency yang perlu ditambahkan.
4. Struktur folder yang direkomendasikan.
5. Flow komunikasi AI → TTS → VRM.
6. Risiko/performance consideration.
7. Rencana implementasi bertahap.

Setelah itu baru implementasikan fitur tersebut.
