# VOXA — Creative Intelligence System 2100

نسخة إنتاجية من VOXA بواجهة مستقبلية + Gemini خلف Vercel Serverless Function.

## 1) الأمان

لا يوجد مفتاح Gemini داخل `index.html` ولا داخل GitHub.

ضعه في Vercel:

`Project → Settings → Environment Variables`

Name:
`GEMINI_API_KEY`

Value:
مفتاح Gemini الخاص بك.

ثم أعد Deploy.

## 2) التشغيل

الملفات:

- `index.html` واجهة VOXA
- `api/chat.js` بوابة Gemini الآمنة
- `.env.example` نموذج متغير البيئة

يمكن رفع المشروع إلى GitHub ثم ربطه مع Vercel.

## 3) النموذج

المشروع يستخدم:
`gemini-3.6-flash`

ويستدعي Gemini من الخادم باستخدام `x-goog-api-key`، وليس من المتصفح.
