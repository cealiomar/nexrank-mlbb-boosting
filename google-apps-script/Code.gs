const NOTIFICATION_EMAIL = 'cealiomar@gmail.com';
const SHEET_NAME = 'Orders';

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const order = JSON.parse(e.postData.contents || '{}');
    validateOrder_(order);
    const sheet = getOrdersSheet_();
    sheet.appendRow([
      safeCell_(order.id),
      new Date(order.createdAt || Date.now()),
      safeCell_(order.customer.name),
      safeCell_(order.customer.whatsapp),
      safeCell_(order.customer.email),
      safeCell_(order.customer.region),
      safeCell_(order.service),
      safeCell_(order.route && order.route.from),
      safeCell_(order.route && order.route.to),
      Number(order.route && order.route.stars || 0),
      safeCell_(order.method),
      safeCell_(order.hero),
      safeCell_(order.extras && order.extras.promo),
      Number(order.total || 0),
      safeCell_(order.paymentMethod),
      'New'
    ]);
    sendNotification_(order);
    return json_({ok:true,id:order.id});
  } catch (error) {
    return json_({ok:false,error:String(error)});
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return json_({ok:true,service:'NEXRANK Orders'});
}

function getOrdersSheet_() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = spreadsheet.insertSheet(SHEET_NAME);
  const headers = ['Order ID','Created At','Customer','WhatsApp','Email','Server','Service','From','To','Stars Needed','Method','Hero','Promo','Total EGP','Payment Method','Status'];
  sheet.getRange(1,1,1,headers.length).setValues([headers]).setFontWeight('bold').setBackground('#b8ff4f').setFontColor('#10150a');
  sheet.setFrozenRows(1);
  if (sheet.getLastRow() <= 1) sheet.autoResizeColumns(1,headers.length);
  return sheet;
}

function sendNotification_(order) {
  const customer = order.customer || {};
  const route = order.route || {};
  const heroLine = order.hero ? `<tr><td>Hero</td><td><b>${escapeHtml_(order.hero)}</b></td></tr>` : '';
  const html = `<div dir="rtl" style="font-family:Arial,sans-serif;max-width:620px;margin:auto;background:#101725;color:#f6f8fc;padding:24px;border-radius:16px">
    <h2 style="color:#b8ff4f">طلب NEXRANK جديد ${escapeHtml_(order.id)}</h2>
    <table style="width:100%;border-collapse:collapse" cellpadding="9">
      <tr><td>العميل</td><td><b>${escapeHtml_(customer.name)}</b></td></tr>
      <tr><td>واتساب</td><td><b>${escapeHtml_(customer.whatsapp)}</b></td></tr>
      <tr><td>الإيميل</td><td>${escapeHtml_(customer.email)}</td></tr>
      <tr><td>الخدمة</td><td>${escapeHtml_(order.service)}</td></tr>
      <tr><td>المسار</td><td>${escapeHtml_(route.from)} ← ${escapeHtml_(route.to)}</td></tr>
      <tr><td>عدد النجوم</td><td>${escapeHtml_(route.stars)}</td></tr>
      <tr><td>طريقة اللعب</td><td>${escapeHtml_(order.method)}</td></tr>
      ${heroLine}
      <tr><td>طريقة الدفع</td><td>${escapeHtml_(order.paymentMethod)}</td></tr>
      <tr><td>الإجمالي</td><td style="color:#b8ff4f"><b>${escapeHtml_(order.total)} ج.م</b></td></tr>
    </table>
  </div>`;
  const body = `New order ${order.id}\nCustomer: ${customer.name}\nWhatsApp: ${customer.whatsapp}\nRoute: ${route.from} -> ${route.to}\nPayment: ${order.paymentMethod}\nTotal: ${order.total} EGP`;
  MailApp.sendEmail({to:NOTIFICATION_EMAIL,subject:`طلب جديد ${order.id} — ${customer.name}`,body:body,htmlBody:html,replyTo:customer.email || undefined,name:'NEXRANK Orders'});
}

function validateOrder_(order) {
  if (!order || !order.id || !order.customer || !order.customer.name || !order.customer.whatsapp) throw new Error('Missing required order fields');
}

function safeCell_(value) {
  const text = String(value == null ? '' : value);
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function escapeHtml_(value) {
  return String(value == null ? '' : value).replace(/[&<>"']/g,function(char){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]});
}

function json_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON);
}
