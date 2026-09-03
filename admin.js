const ordersKey='nexrank_orders';
const money=value=>`${new Intl.NumberFormat('ar-EG',{maximumFractionDigits:0}).format(Number(value)||0)} ج.م`;
const readOrders=()=>{try{return JSON.parse(localStorage.getItem(ordersKey)||'[]')}catch{return[]}};
const safe=value=>String(value??'').replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));

function renderOrders(query=''){
  const all=readOrders(),term=query.trim().toLowerCase(),orders=all.filter(order=>JSON.stringify(order).toLowerCase().includes(term));
  document.getElementById('totalOrders').textContent=all.length.toLocaleString('ar-EG');
  document.getElementById('todayOrders').textContent=all.filter(order=>new Date(order.createdAt).toDateString()===new Date().toDateString()).length.toLocaleString('ar-EG');
  document.getElementById('totalValue').textContent=money(all.reduce((sum,order)=>sum+Number(order.total||0),0));
  document.getElementById('ordersCount').textContent=`${orders.length.toLocaleString('ar-EG')} طلب`;
  document.getElementById('emptyState').style.display=orders.length?'none':'block';
  document.getElementById('ordersBody').innerHTML=orders.map(order=>`<tr><td><strong>${safe(order.id)}</strong><small>${new Date(order.createdAt).toLocaleString('ar-EG')}</small></td><td><strong>${safe(order.customer?.name)}</strong><small>${safe(order.customer?.whatsapp)}</small></td><td>${safe(order.service==='global'?'Hero Global':'Rank Boost')}${order.hero?`<small>${safe(order.hero)}</small>`:''}</td><td><strong>${safe(order.route?.from)}</strong><small>إلى ${safe(order.route?.to)} · ${safe(order.route?.stars)} نجمة</small></td><td>${safe(order.method==='selfplay'?'Self Play':'Pilot')}<small>${safe(order.paymentMethod||'الدفع لاحقًا')}</small></td><td><strong>${money(order.total)}</strong></td><td><span class="status ${order.syncStatus==='waiting'?'waiting':''}">${order.syncStatus==='waiting'?'بانتظار Google':'تم الإرسال'}</span></td></tr>`).join('');
}

const config=window.NEXRANK_CONFIG||{},sheetLink=document.getElementById('sheetLink'),badge=document.getElementById('connectionBadge');
if(config.ordersSheetUrl){sheetLink.href=config.ordersSheetUrl;sheetLink.classList.remove('disabled')}
if(config.ordersWebhookUrl){badge.classList.add('connected');badge.querySelector('span').textContent='Google متصل'}
document.getElementById('searchOrders').addEventListener('input',event=>renderOrders(event.target.value));
renderOrders();
