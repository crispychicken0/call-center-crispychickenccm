# 🍗 Crispy Chicken – Offers (with Contact Bar)

موقع العروض الخاصة بـ **Crispy Chicken** مع ميزات:

- 📞 **Sticky contact bar**: شريط تواصل ثابت (Call / WhatsApp / Email / Menu).
- ⚡ **Floating quick-action buttons**: أزرار سريعة أسفل يمين الصفحة.
- 🛠️ **Admin panel**: لوحة تحكم لإدارة العروض ورفعها مباشرة إلى GitHub.
- 🚀 **Auto Deploy**: نشر تلقائي عبر Vercel عند أي تعديل.

---

## 🌍 رابط الموقع
👉 [call-center-crispychicken.vercel.app](https://call-center-crispychicken.vercel.app)

---

## 📂 الملفات
- `index.html` → الصفحة الرئيسية مع العروض.
- `admin.html` + `admin.js` → لوحة التحكم لإدارة العروض.
- `offers.json` → ملف العروض (قابل للتعديل بسهولة).
- `vercel.json` → إعدادات النشر على Vercel.
- `README.md` → هذا الملف.

---

## 🛠️ تعديل العروض
- افتح ملف `offers.json`.
- مثال على عرض جديد:
```json
{
  "title_en": "🐔 Chicken Day Offer",
  "description_en": "🍗 8 pcs Crispy Chicken + 2 Garlic Sauces\n📅 Only on 1st & 2nd September\n💰 Just 20 AED\n🔥 Don’t miss it!",
  "title_ar": "🐔 عرض يوم الدجاج",
  "description_ar": "🍗 8 قطع دجاج مقرمش + 2 صلصة ثوم\n📅 فقط يوم 1 و 2 سبتمبر\n💰 فقط 20 درهم\n🔥 لا تفوّت العرض!",
  "min_order_aed": "20"
}
