# ربط الطلبات بـ Google Sheet والإيميل

الموقع جاهز للإرسال، لكن Google يحتاج تفويضًا مرة واحدة من صاحب الحساب.

1. افتح [Google Sheets](https://sheets.new) وأنشئ Sheet جديد باسم `NEXRANK Orders`.
2. من القائمة اختر **Extensions → Apps Script**.
3. امسح الكود الموجود والصق محتوى ملف `google-apps-script/Code.gs`.
4. اضغط **Deploy → New deployment → Web app**.
5. اجعل **Execute as** = `Me`، و**Who has access** = `Anyone`، ثم وافق على صلاحية إرسال الإيميل والكتابة في الشيت.
6. انسخ رابط Web app الذي ينتهي بـ `/exec`.
7. افتح `config.js` وضع الرابط داخل `ordersWebhookUrl`، وضع رابط الشيت داخل `ordersSheetUrl`.

بعدها كل طلب جديد سيُضاف كسطر في صفحة `Orders`، وسيصل إشعار إلى `cealiomar@gmail.com` بكامل تفاصيل الطلب.
