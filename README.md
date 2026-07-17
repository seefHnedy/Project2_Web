# Smart University Student Portal - Login UI

واجهة تسجيل دخول جاهزة لمشروع **Smart University Student Portal System**.

## التشغيل السريع

```bash
npm install
npm run dev
```

افتح الرابط الذي يظهر في التيرمنال، غالباً:

```bash
http://localhost:5173
```

## ملاحظات مهمة

- الواجهة تعمل مباشرة بوضع Mock بدون Backend.
- أدخل أي رقم جامعي وكلمة مرور بطول 6 أحرف أو أكثر.
- يوجد اختيار دور المستخدم: طالب، دكتور، إدارة.
- عند توفر Laravel API عدّل `.env` وضع:

```bash
VITE_API_BASE_URL=http://127.0.0.1:8000
VITE_USE_MOCK=false
```

## شكل Request المتوقع للـ Backend

```json
{
  "universityNumber": "202012345",
  "password": "123456",
  "role": "admin"
}
```

الواجهة تتوقع Response مثل:

```json
{
  "token": "jwt-token",
  "user": {
    "name": "Admin User",
    "role": "admin"
  }
}
```

## رفع المشروع على GitHub

```bash
git init
git add .
git commit -m "Add smart portal login UI"
git branch -M main
git remote add origin YOUR_REPO_URL
git push -u origin main
```
