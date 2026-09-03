const ranks = [
  {id:'warrior',name:'Warrior',divisions:['III','II','I'],starMin:0,starMax:4,units:15,rate:10,image:'assets/ranks/warrior.png'},
  {id:'elite',name:'Elite',divisions:['IV','III','II','I'],starMin:0,starMax:4,units:20,rate:12,image:'assets/ranks/elite.png'},
  {id:'master',name:'Master',divisions:['IV','III','II','I'],starMin:0,starMax:4,units:20,rate:15,image:'assets/ranks/master.png'},
  {id:'grandmaster',name:'Grandmaster',divisions:['V','IV','III','II','I'],starMin:0,starMax:4,units:25,rate:20,image:'assets/ranks/grandmaster.png'},
  {id:'epic',name:'Epic',divisions:['V','IV','III','II','I'],starMin:0,starMax:4,units:25,rate:35,image:'assets/ranks/epic.png'},
  {id:'legend',name:'Legend',divisions:['V','IV','III','II','I'],starMin:0,starMax:4,units:25,rate:45,image:'assets/ranks/legend.png'},
  {id:'mythic',name:'Mythic',divisions:[''],starMin:0,starMax:24,units:25,rate:65,image:'assets/ranks/mythic.png'},
  {id:'honor',name:'Mythical Honor',divisions:[''],starMin:25,starMax:49,units:25,rate:80,image:'assets/ranks/mythical-honor.png'},
  {id:'glory',name:'Mythical Glory',divisions:[''],starMin:50,starMax:99,units:50,rate:100,image:'assets/ranks/mythical-glory.png'},
  {id:'immortal',name:'Mythical Immortal',divisions:[''],starMin:100,starMax:999,units:900,rate:125,image:'assets/ranks/mythical-immortal.png'}
];
const state={service:'rank',active:'current',pickerOpen:false,precisionOpen:true,current:{rank:4,division:0,stars:0},target:{rank:6,division:0,stars:0},method:'pilot',promo:null,lang:'ar'};
const notify={whatsapp:'+201030303397',email:'cealiomar@gmail.com'};
const ORDER_WEBHOOK_URL=window.NEXRANK_CONFIG?.ordersWebhookUrl||'';
const $=id=>document.getElementById(id);
const egp=value=>`${new Intl.NumberFormat('ar-EG',{maximumFractionDigits:0}).format(Math.round(value))} ج.م`;

const copy={
  en:{
    'nav.services':'Services','nav.how':'How it works','nav.contact':'Contact','nav.start':'Start order','hero.kicker':'MLBB RANK BOOSTING','hero.title':'Climb to the rank<br /><em>you deserve.</em>','hero.body':'Choose your current rank and goal, then see a clear EGP invoice in seconds. Pilot or Self Play with a pro team.','hero.cta':'Calculate your price','hero.availability':'Available for new orders','hero.rating':'Customer rating','hero.reply':'Average reply','hero.manual':'Manual play','calc.overline':'INSTANT PRICE CALCULATOR','calc.title':'Choose your rank. See the price instantly.','calc.subtitle':'Set your exact division and stars, then send the order directly.','tabs.rank':'Rank boost','tabs.popular':'MOST POPULAR','rank.step':'Choose your journey','rank.stepHelp':'Tap the start or target, then choose one rank.','rank.current':'Current rank','rank.target':'Your target','rank.change':'Change','rank.oneTap':'One tap only','rank.precision':'Exact division and stars','rank.stars':'Stars','rank.starsNow':'Current stars','rank.youNeed':'You need','rank.starUnit':'stars','rank.starsGoal':'Star goal','method.title':'Choose how to play','method.help':'You can change this before submitting.','method.pilot':'The team completes the service','method.self':'Play yourself with the team','method.base':'Base price','extras.hero':'Specific hero only','extras.chooseHero':'Choose the hero we will play','extras.express':'Express completion','global.title':'Go Global with your hero','global.help':'An estimate first, final confirmation after reviewing Hero Power.','global.hero':'Hero name','global.goal':'Target','global.method':'Play method','global.upload':'Upload a Hero Power screenshot','global.optional':'Optional now, required at confirmation','invoice.title':'Your invoice','invoice.egp':'In Egyptian pounds','invoice.from':'From','invoice.to':'To','invoice.apply':'Apply','invoice.total':'Total','invoice.nocharge':'No charge now','invoice.confirm':'Confirm order','invoice.note':'We review availability and contact you before payment','payment.title':'Available payment methods','payment.help':'Choose after order confirmation','proof.manual':'Manual play','proof.manualSub':'No bots or scripts','proof.contact':'Direct contact','proof.contactSub':'WhatsApp and email','proof.track':'Clear tracking','proof.trackSub':'From order to completion','proof.global':'Hero Global','proof.globalSub':'Tailored to each hero','how.overline':'HOW IT WORKS','how.title':'Three steps. No complexity.','how.one':'Choose your goal','how.oneSub':'Set rank, play method, and see your price.','how.two':'Confirm the order','how.twoSub':'Leave contact details and the team gets your request.','how.three':'Start playing','how.threeSub':'We confirm availability and timing, then start.','footer.note':'An independent service, not officially affiliated with Mobile Legends: Bang Bang.','dialog.overline':'ORDER CONFIRMATION','dialog.title':'Where should we contact you?','dialog.subtitle':'Nothing is charged. The team reviews your request first.','dialog.name':'Name','dialog.whatsapp':'WhatsApp number','dialog.email':'Email','dialog.region':'Server','dialog.payment':'Preferred payment method','dialog.paymentLater':'Choose later','dialog.submit':'Send request','success.title':'Request received!','success.number':'Order number','success.done':'Done'
  }
};

function rankData(endpoint){return ranks[state[endpoint].rank]}
function absolutePosition(endpoint){const s=state[endpoint],rank=ranks[s.rank];const before=ranks.slice(0,s.rank).reduce((n,r)=>n+r.units,0);const stars=rank.divisions[0]?s.stars:s.stars-rank.starMin;return before+(rank.divisions[0]?s.division*5:0)+Math.max(0,stars)}
function rankLabel(endpoint){const s=state[endpoint],r=ranks[s.rank],division=r.divisions[s.division]||'';const showStars=!r.divisions[0]||s.stars>0;return `${r.name}${division?` ${division}`:''}${showStars?` · ${s.stars}★`:''}`}

function populatePrecision(){
  const columns=document.querySelectorAll('.precision-column');let visibleColumns=0;
  ['current','target'].forEach((endpoint,index)=>{
    const rank=rankData(endpoint),select=$(`${endpoint}Division`),slider=$(`${endpoint}Stars`);
    select.innerHTML=rank.divisions.map((d,i)=>`<option value="${i}">${d||'—'}</option>`).join('');select.value=state[endpoint].division;select.disabled=!rank.divisions[0];
    slider.min=rank.starMin;slider.max=rank.starMax;slider.value=state[endpoint].stars;$(`${endpoint}StarsValue`).textContent=state[endpoint].stars;
    columns[index].classList.toggle('hidden',!rank.divisions[0]);if(rank.divisions[0])visibleColumns++;
  });
  $('precisionPanel').classList.toggle('single',visibleColumns===1);
}

function renderPicker(){
  const currentIndex=state.current.rank,selected=state[state.active].rank;
  $('pickerPrompt').textContent=state.lang==='ar'?(state.active==='current'?'اختَر رانكك الحالي':'اختَر الرانك المستهدف'):(state.active==='current'?'Choose your current rank':'Choose your target rank');
  $('rankPicker').innerHTML=ranks.map((rank,index)=>`<button class="rank-card ${index===selected?'selected':''}" data-rank="${index}" type="button" ${state.active==='target'&&index<currentIndex?'disabled':''}><img src="${rank.image}" alt="${rank.name}" /><span>${rank.name.replace('Mythical ','')}</span></button>`).join('');
  $('rankPicker').querySelectorAll('.rank-card:not(:disabled)').forEach(button=>button.addEventListener('click',()=>chooseRank(Number(button.dataset.rank))));
}

function chooseRank(index){
  const endpoint=state.active,rank=ranks[index];state[endpoint]={rank:index,division:0,stars:rank.starMin};
  if(endpoint==='current'){
    if(index>=state.target.rank){if(index<ranks.length-1)state.target={rank:index+1,division:0,stars:ranks[index+1].starMin};else state.target={rank:index,division:0,stars:Math.min(rank.starMax,rank.starMin+10)}}
    state.active='target';
  }else state.pickerOpen=false;
  ensureValid();render();
}

function ensureValid(){
  if(absolutePosition('target')<=absolutePosition('current')){
    const current=state.current,rank=ranks[current.rank];
    if(rank.divisions[0]&&current.stars<rank.starMax)state.target={rank:current.rank,division:current.division,stars:current.stars+1};
    else if(rank.divisions[0]&&current.division<rank.divisions.length-1)state.target={rank:current.rank,division:current.division+1,stars:0};
    else if(!rank.divisions[0]&&current.stars<rank.starMax)state.target={rank:current.rank,division:0,stars:current.stars+1};
    else if(current.rank<ranks.length-1)state.target={rank:current.rank+1,division:0,stars:ranks[current.rank+1].starMin};
  }
}

function bandsBetween(start,end){
  return ranks.map((rank,index)=>{const bandStart=ranks.slice(0,index).reduce((n,r)=>n+r.units,0),bandEnd=bandStart+rank.units,stars=Math.max(0,Math.min(end,bandEnd)-Math.max(start,bandStart));return stars?{rank,stars,cost:stars*rank.rate}:null}).filter(Boolean)
}

function rankInvoice(){
  const start=absolutePosition('current'),end=absolutePosition('target'),bands=bandsBetween(start,end);let total=bands.reduce((n,b)=>n+b.cost,0);
  const rows=bands.map(b=>({label:`${b.rank.name}: ${b.stars} ${state.lang==='ar'?'نجمة':'stars'} × ${egp(b.rank.rate)}`,value:egp(b.cost)}));
  if(state.method==='selfplay'){const extra=total*.7;total+=extra;rows.push({label:'Self Play (+70%)',value:egp(extra)})}
  if($('heroOnly').checked){const extra=total*.15,hero=$('specificHero').value.trim()|| (state.lang==='ar'?'حدد الهيرو':'Choose hero');total+=extra;rows.push({label:`${hero} · ${state.lang==='ar'?'هيرو محدد':'Specific hero'} (+15%)`,value:egp(extra)})}
  if($('express').checked){const extra=total*.25;total+=extra;rows.push({label:`${state.lang==='ar'?'تنفيذ سريع':'Express'} (+25%)`,value:egp(extra)})}
  total=Math.max(total,state.method==='selfplay'?250:150);return{total,rows,from:rankLabel('current'),to:rankLabel('target'),fromRank:rankData('current'),toRank:rankData('target')}
}

function globalInvoice(){
  const goal=Number($('globalGoal').value),power=Number($('heroPower').value||0),targets={500:4500,100:7000,50:8000,10:10000},points=Math.max(0,targets[goal]-power);let total=Math.max(1800,(points/100)*(goal<=50?85:65));const rows=[{label:`${points.toLocaleString('ar-EG')} Hero Power`,value:egp(total)},{label:`Global Top ${goal}`,value:state.lang==='ar'?'مراجعة':'Review'}];
  if($('globalMethod').value==='selfplay'){const extra=total*.7;total+=extra;rows.push({label:'Self Play (+70%)',value:egp(extra)})}
  const hero=$('heroName').value.trim()||'Hero Global';return{total,rows,from:`${power.toLocaleString('ar-EG')} Power`,to:`${hero} · Top ${goal}`,fromRank:ranks[6],toRank:ranks[9]}
}

function applyDiscount(invoice){if(!state.promo)return invoice;let discount=state.promo.type==='percent'?invoice.total*state.promo.value:state.promo.value;discount=Math.min(discount,invoice.total);invoice.total-=discount;invoice.rows.push({label:`Promo ${state.promo.code}`,value:`− ${egp(discount)}`});return invoice}

function saveOrderBackup(order){const key='nexrank_orders';let orders=[];try{orders=JSON.parse(localStorage.getItem(key)||'[]')}catch{}orders.unshift({...order,syncStatus:ORDER_WEBHOOK_URL?'sent':'waiting'});localStorage.setItem(key,JSON.stringify(orders.slice(0,500)))}
async function sendOrder(order){saveOrderBackup(order);if(!ORDER_WEBHOOK_URL)return false;try{await fetch(ORDER_WEBHOOK_URL,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(order)});return true}catch(error){console.error('Order delivery failed',error);return false}}

function renderInvoice(){
  const invoice=applyDiscount(state.service==='global'?globalInvoice():rankInvoice());
  $('invoiceFrom').textContent=invoice.from;$('invoiceTo').textContent=invoice.to;$('invoiceFromIcon').src=invoice.fromRank.image;$('invoiceToIcon').src=invoice.toRank.image;
  $('invoiceRows').innerHTML=invoice.rows.map(row=>`<div class="invoice-row"><span>${row.label}</span><b>${row.value}</b></div>`).join('');$('totalPrice').textContent=egp(invoice.total);$('mobileTotalPrice').textContent=egp(invoice.total);$('orderButton').disabled=invoice.total<=0;$('mobileOrderButton').disabled=invoice.total<=0;$('orderButton').dataset.total=invoice.total;
}

function openOrderDialog(){const heroInput=state.service==='global'?$('heroName'):($('heroOnly').checked?$('specificHero'):null);if(heroInput&&!heroInput.value.trim()){heroInput.classList.add('invalid');heroInput.focus();return}if(heroInput)heroInput.classList.remove('invalid');$('orderDialog').showModal()}

function render(){
  ['current','target'].forEach(endpoint=>{const rank=rankData(endpoint);$(`${endpoint}PointIcon`).src=rank.image;$(`${endpoint}PointLabel`).textContent=rankLabel(endpoint);$(`${endpoint}Point`).classList.toggle('active',state.pickerOpen&&state.active===endpoint)});
  $('rankPickerWrap').classList.toggle('hidden',!state.pickerOpen);
  $('starGoalBar').classList.toggle('hidden',state.pickerOpen);
  const currentStars=state.current.rank>=6,targetStars=state.target.rank>=6;
  $('currentAbsoluteWrap').classList.toggle('hidden',!currentStars);$('targetAbsoluteWrap').classList.toggle('hidden',!targetStars);
  $('starGoalBar').classList.toggle('only-total',!currentStars&&!targetStars);$('starGoalBar').classList.toggle('one-field',currentStars!==targetStars);
  ['current','target'].forEach(endpoint=>{const input=$(`${endpoint}AbsoluteStars`),rank=rankData(endpoint);input.min=rank.starMin;input.max=rank.starMax;input.value=state[endpoint].stars});
  $('neededStars').textContent=Math.max(0,absolutePosition('target')-absolutePosition('current')).toLocaleString(state.lang==='ar'?'ar-EG':'en-US');
  const needsPrecision=state.current.rank<6||state.target.rank<6,showPrecision=needsPrecision&&!state.pickerOpen&&state.precisionOpen;
  $('precisionToggle').classList.toggle('hidden',!needsPrecision||state.pickerOpen);$('precisionToggle').classList.toggle('open',showPrecision);$('precisionPanel').classList.toggle('hidden',!showPrecision);
  renderPicker();populatePrecision();renderInvoice();
}

function changeService(service){state.service=service;document.querySelectorAll('.service-button').forEach(b=>b.classList.toggle('active',b.dataset.service===service));$('rankBuilder').classList.toggle('hidden',service==='global');$('globalBuilder').classList.toggle('hidden',service!=='global');if(service==='selfplay'){state.method='selfplay';document.querySelector('input[name="method"][value="selfplay"]').checked=true;syncMethods()}renderInvoice()}
function syncMethods(){document.querySelectorAll('.method-option').forEach(label=>label.classList.toggle('selected',label.querySelector('input').checked))}
function applyPromo(){const code=$('promoInput').value.trim().toUpperCase(),offers={STREAM10:{type:'percent',value:.10},WELCOME100:{type:'fixed',value:100},GLOBAL15:{type:'percent',value:.15}},message=$('promoMessage');if(!offers[code]){state.promo=null;message.textContent=state.lang==='ar'?'الكود غير صحيح أو منتهي':'Invalid or expired code';message.className='promo-message error'}else{state.promo={code,...offers[code]};message.textContent=state.lang==='ar'?'تم تطبيق الخصم':'Discount applied';message.className='promo-message'}renderInvoice()}

function setLanguage(lang){state.lang=lang;document.documentElement.lang=lang;document.documentElement.dir=lang==='ar'?'rtl':'ltr';$('langButton').textContent=lang==='ar'?'EN':'AR';document.querySelectorAll('[data-i18n]').forEach(node=>{if(!node.dataset.ar)node.dataset.ar=node.textContent;const key=node.dataset.i18n;node.textContent=lang==='en'&&copy.en[key]?copy.en[key]:node.dataset.ar});document.querySelectorAll('[data-i18n-html]').forEach(node=>{if(!node.dataset.ar)node.dataset.ar=node.innerHTML;const key=node.dataset.i18nHtml;node.innerHTML=lang==='en'&&copy.en[key]?copy.en[key]:node.dataset.ar});render()}

function initWebGL(){const canvas=$('scene');if(matchMedia('(max-width:680px), (prefers-reduced-motion: reduce)').matches)return;const gl=canvas.getContext('webgl',{alpha:false,antialias:false,powerPreference:'low-power'});if(!gl)return;const vertex=`attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`,fragment=`precision mediump float;uniform vec2 r;uniform float t;uniform vec2 m;float h(vec2 p){return fract(sin(dot(p,vec2(41.3,289.2)))*47358.5);}void main(){vec2 u=(gl_FragCoord.xy-.5*r)/r.y;vec3 c=vec3(.025,.03,.055);float d=length(u-vec2(.38,.27)+m*.05);c+=vec3(.12,.07,.3)*smoothstep(.75,.03,d);float w=sin(u.x*3.+u.y*2.4+t*.1)+sin(u.x*5.5-u.y*2.8+t*.07);c+=vec3(.02,.065,.12)*smoothstep(.16,0.,abs(u.y+.23+w*.04));float s=step(.998,h(floor((u+2.)*vec2(160.,90.))));c+=s*vec3(.38,.45,.7);gl_FragColor=vec4(c,1.);}`;const sh=(type,src)=>{const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);return s},program=gl.createProgram();gl.attachShader(program,sh(gl.VERTEX_SHADER,vertex));gl.attachShader(program,sh(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);gl.useProgram(program);const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);const loc=gl.getAttribLocation(program,'p');gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);const resize=()=>{const d=Math.min(1.4,devicePixelRatio||1);canvas.width=innerWidth*d;canvas.height=innerHeight*d;gl.viewport(0,0,canvas.width,canvas.height)};let mouse=[0,0];addEventListener('pointermove',e=>mouse=[e.clientX/innerWidth-.5,.5-e.clientY/innerHeight],{passive:true});addEventListener('resize',resize);resize();const tl=gl.getUniformLocation(program,'t'),rl=gl.getUniformLocation(program,'r'),ml=gl.getUniformLocation(program,'m');const draw=now=>{gl.uniform1f(tl,now*.001);gl.uniform2f(rl,canvas.width,canvas.height);gl.uniform2f(ml,...mouse);gl.drawArrays(gl.TRIANGLES,0,3);requestAnimationFrame(draw)};requestAnimationFrame(draw)}

document.addEventListener('DOMContentLoaded',()=>{
  initWebGL();render();
  ['current','target'].forEach(endpoint=>{
    $(`${endpoint}Point`).addEventListener('click',()=>{state.active=endpoint;state.pickerOpen=true;render()});
    $(`${endpoint}Division`).addEventListener('change',e=>{state[endpoint].division=Number(e.target.value);ensureValid();render()});
    $(`${endpoint}Stars`).addEventListener('input',e=>{state[endpoint].stars=Number(e.target.value);ensureValid();render()});
    $(`${endpoint}AbsoluteStars`).addEventListener('change',e=>{const rank=rankData(endpoint),value=Number(e.target.value);state[endpoint].stars=Math.max(rank.starMin,Math.min(rank.starMax,Number.isFinite(value)?value:rank.starMin));ensureValid();render()});
  });
  $('precisionToggle').addEventListener('click',()=>{state.precisionOpen=!state.precisionOpen;render()});
  document.querySelectorAll('.service-button').forEach(button=>button.addEventListener('click',()=>changeService(button.dataset.service)));
  document.querySelectorAll('input[name="method"]').forEach(input=>input.addEventListener('change',()=>{state.method=input.value;syncMethods();renderInvoice()}));
  $('heroOnly').addEventListener('change',()=>{const enabled=$('heroOnly').checked;$('specificHeroPicker').classList.toggle('hidden',!enabled);$('specificHero').required=enabled;if(enabled)$('specificHero').focus();renderInvoice()});
  [$('express'),$('specificHero'),$('heroName'),$('heroPower'),$('globalGoal'),$('globalMethod')].forEach(input=>input.addEventListener('input',renderInvoice));
  $('applyPromo').addEventListener('click',applyPromo);$('promoInput').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();applyPromo()}});$('langButton').addEventListener('click',()=>setLanguage(state.lang==='ar'?'en':'ar'));
  $('orderButton').addEventListener('click',openOrderDialog);$('mobileOrderButton').addEventListener('click',openOrderDialog);$('closeDialog').addEventListener('click',()=>$('orderDialog').close());$('finishOrder').addEventListener('click',()=>$('orderDialog').close());
  $('contactForm').addEventListener('submit',async e=>{e.preventDefault();const submit=e.submitter;submit.disabled=true;submit.textContent=state.lang==='ar'?'جاري إرسال الطلب…':'Sending…';const id=`#${Math.floor(1000+Math.random()*8999)}`,order={id,createdAt:new Date().toISOString(),service:state.service,total:$('orderButton').dataset.total,paymentMethod:$('paymentMethod').value,route:{from:rankLabel('current'),to:rankLabel('target'),stars:Math.max(0,absolutePosition('target')-absolutePosition('current'))},method:state.method,hero:state.service==='global'?$('heroName').value.trim():($('heroOnly').checked?$('specificHero').value.trim():''),extras:{specificHero:$('heroOnly').checked,express:$('express').checked,promo:state.promo?.code||''},customer:{name:$('customerName').value.trim(),whatsapp:$('customerWhatsapp').value.trim(),email:$('customerEmail').value.trim(),region:$('customerRegion').value},notify};const delivered=await sendOrder(order);window.dispatchEvent(new CustomEvent('nexrank:order-created',{detail:order}));$('orderId').textContent=id;$('orderSyncStatus').textContent=delivered?(state.lang==='ar'?'تم تسجيل الطلب وإرسال إشعار للفريق.':'Order saved and team notified.'):(state.lang==='ar'?'تم حفظ الطلب في لوحة الطلبات. ربط Google مطلوب لتفعيل الإيميل والشيت.':'Order saved locally. Connect Google to enable email and Sheets.');$('contactStep').classList.add('hidden');$('successStep').classList.remove('hidden');submit.disabled=false});
});
