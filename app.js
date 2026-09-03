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

/* One selectable position on a single flattened scale: rank + division
   collapse into one axis, so the user makes one decision, not three. */
const steps=[];
/* The chip stays small: it shows the icon plus a short tag. The full name
   of the centred step is printed once in the rail head instead. */
const tags={Mythic:'MYT','Mythical Honor':'HON','Mythical Glory':'GLO','Mythical Immortal':'IMM'};
ranks.forEach((rank,rankIndex)=>{
  if(rank.divisions[0])rank.divisions.forEach((badge,division)=>
    steps.push({rank:rankIndex,division,tag:badge,full:`${rank.name} ${badge}`,image:rank.image}));
  else steps.push({rank:rankIndex,division:0,tag:tags[rank.name]||rank.name.slice(0,3).toUpperCase(),full:rank.name,image:rank.image});
});

const state={service:'rank',active:'current',current:{rank:4,division:0,stars:0},target:{rank:6,division:0,stars:0},method:'pilot',promo:null,lang:'ar'};
const notify={whatsapp:'+201030303397',email:'cealiomar@gmail.com'};
const ORDER_WEBHOOK_URL=window.NEXRANK_CONFIG?.ordersWebhookUrl||'';
const $=id=>document.getElementById(id);
const reducedMotion=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Latin digits in both languages. 'ar-EG' alone yields Arabic-Indic
   numerals, which clashed with the Latin digits browsers render in
   <input> fields — two numeral systems in one view. */
const num=value=>new Intl.NumberFormat(state.lang==='en'?'en-US':'ar-EG-u-nu-latn',{maximumFractionDigits:0}).format(Math.round(value));
const egp=value=>`${num(value)} ${state.lang==='en'?'EGP':'ج.م'}`;
const copy={
  en:{
    'nav.services':'Services','nav.how':'How it works','nav.contact':'Contact','nav.start':'Start order','hero.kicker':'MLBB RANK BOOSTING','hero.title':'Climb to the rank<br /><em>you deserve.</em>','hero.body':'Choose your current rank and goal, then see a clear EGP invoice in seconds. Pilot or Self Play with a pro team.','hero.cta':'Calculate your price','hero.availability':'Available for new orders','hero.rating':'Customer rating','hero.reply':'Average reply','hero.manual':'Manual play','calc.overline':'INSTANT PRICE CALCULATOR','calc.title':'Choose your rank. See the price instantly.','calc.subtitle':'Set your exact division and stars, then send the order directly.','tabs.rank':'Rank boost','tabs.popular':'MOST POPULAR','rank.step':'Choose your journey','rank.stepHelp':'Tap the start or target, then choose one rank.','rank.current':'Current rank','rank.target':'Your target','rank.change':'Change','rank.oneTap':'One tap only','rank.precision':'Exact division and stars','rank.stars':'Stars','rank.starsNow':'Current stars','rank.youNeed':'You need','rank.starUnit':'stars','rank.starsGoal':'Star goal','method.title':'Choose how to play','method.help':'You can change this before submitting.','method.pilot':'The team completes the service','method.self':'Play yourself with the team','method.base':'Base price','extras.hero':'Specific hero only','extras.chooseHero':'Choose the hero we will play','extras.express':'Express completion','global.title':'Go Global with your hero','global.help':'An estimate first, final confirmation after reviewing Hero Power.','global.hero':'Hero name','global.goal':'Target','global.method':'Play method','global.upload':'Upload a Hero Power screenshot','global.optional':'Optional now, required at confirmation','invoice.title':'Your invoice','invoice.egp':'In Egyptian pounds','invoice.from':'From','invoice.to':'To','invoice.apply':'Apply','invoice.total':'Total','invoice.nocharge':'No charge now','invoice.confirm':'Confirm order','invoice.note':'We review availability and contact you before payment','payment.title':'Available payment methods','payment.help':'Choose after order confirmation','proof.manual':'Manual play','proof.manualSub':'No bots or scripts','proof.contact':'Direct contact','proof.contactSub':'WhatsApp and email','proof.track':'Clear tracking','proof.trackSub':'From order to completion','proof.global':'Hero Global','proof.globalSub':'Tailored to each hero','how.overline':'HOW IT WORKS','how.title':'Three steps. No complexity.','how.one':'Choose your goal','how.oneSub':'Set rank, play method, and see your price.','how.two':'Confirm the order','how.twoSub':'Leave contact details and the team gets your request.','how.three':'Start playing','how.threeSub':'We confirm availability and timing, then start.','footer.note':'An independent service, not officially affiliated with Mobile Legends: Bang Bang.','dialog.overline':'ORDER CONFIRMATION','dialog.title':'Where should we contact you?','dialog.subtitle':'Nothing is charged. The team reviews your request first.','dialog.name':'Name','dialog.whatsapp':'WhatsApp number','dialog.email':'Email','dialog.region':'Server','dialog.payment':'Preferred payment method','dialog.paymentLater':'Choose later','dialog.submit':'Send request','success.title':'Request received!','success.number':'Order number','success.done':'Done'
  }
};

Object.assign(copy.en,{
  'nav.whatsapp':'WhatsApp','a11y.skip':'Skip to the calculator',
  'calc.subtitle':'Set your rank and stars — the price follows you step by step.',
  'rank.stepHelp':'Tap the start or the target, then pick from the rail.',
  'rank.railHint':'Swipe the rail or use − +',
  'method.help':'Every choice shows what it does to the price.',
  'extras.heroSub':'We play a hero you choose','extras.expressSub':'Priority in the queue',
  'footer.admin':'Orders board'
});

function rankData(endpoint){return ranks[state[endpoint].rank]}
function absolutePosition(endpoint){const s=state[endpoint],rank=ranks[s.rank];const before=ranks.slice(0,s.rank).reduce((n,r)=>n+r.units,0);const stars=rank.divisions[0]?s.stars:s.stars-rank.starMin;return before+(rank.divisions[0]?s.division*5:0)+Math.max(0,stars)}

/* U+2066 LRI … U+2069 PDI isolates "0★" so bidi reordering cannot throw
   the star to the visual start of an RTL line. `plain` drops the isolates
   for payloads that leave the page (Sheets, WhatsApp). */
function rankLabel(endpoint,{plain=false}={}){
  const s=state[endpoint],r=ranks[s.rank],division=r.divisions[s.division]||'';
  const name=`${r.name}${division?` ${division}`:''}`;
  if(r.divisions[0]&&!s.stars)return name;
  const stars=`${num(s.stars)}★`;
  return `${name} · ${plain?stars:`⁦${stars}⁩`}`;
}

/* The journey card prints the name and the star count as separate nodes:
   a long rank name may ellipsize, the star count never may — it is what
   moves the price. */
function rankParts(endpoint){
  const st=state[endpoint],r=ranks[st.rank],division=r.divisions[st.division]||'';
  return {
    name:`${r.name}${division?` ${division}`:''}`,
    stars:(r.divisions[0]&&!st.stars)?'':`${num(st.stars)}★`
  };
}

function stepIndexOf(endpoint){const s=state[endpoint];return steps.findIndex(step=>step.rank===s.rank&&step.division===s.division)}

function setStep(endpoint,index){
  const step=steps[Math.max(0,Math.min(steps.length-1,index))],rank=ranks[step.rank];
  state[endpoint]={rank:step.rank,division:step.division,stars:rank.divisions[0]?0:rank.starMin};
  ensureValid();render();
}

function setStars(endpoint,value){
  const rank=rankData(endpoint);
  state[endpoint].stars=Math.max(rank.starMin,Math.min(rank.starMax,value));
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
  const rows=bands.map(b=>({label:`${b.rank.name}: ${num(b.stars)} ${state.lang==='ar'?'نجمة':'stars'} × ${egp(b.rank.rate)}`,value:egp(b.cost)}));
  if(state.method==='selfplay'){const extra=total*.7;total+=extra;rows.push({label:'Self Play (+70%)',value:egp(extra)})}
  if($('heroOnly').checked){const extra=total*.15,hero=$('specificHero').value.trim()||(state.lang==='ar'?'حدد الهيرو':'Choose hero');total+=extra;rows.push({label:`${hero} · ${state.lang==='ar'?'هيرو محدد':'Specific hero'} (+15%)`,value:egp(extra)})}
  if($('express').checked){const extra=total*.25;total+=extra;rows.push({label:`${state.lang==='ar'?'تنفيذ سريع':'Express'} (+25%)`,value:egp(extra)})}
  total=Math.max(total,state.method==='selfplay'?250:150);return{total,rows,from:rankLabel('current'),to:rankLabel('target'),fromRank:rankData('current'),toRank:rankData('target')}
}

function globalInvoice(){
  const goal=Number($('globalGoal').value),power=Number($('heroPower').value||0),targets={500:4500,100:7000,50:8000,10:10000},points=Math.max(0,targets[goal]-power);let total=Math.max(1800,(points/100)*(goal<=50?85:65));const rows=[{label:`${num(points)} Hero Power`,value:egp(total)},{label:`Global Top ${goal}`,value:state.lang==='ar'?'مراجعة':'Review'}];
  if($('globalMethod').value==='selfplay'){const extra=total*.7;total+=extra;rows.push({label:'Self Play (+70%)',value:egp(extra)})}
  const hero=$('heroName').value.trim()||'Hero Global';return{total,rows,from:`${num(power)} Power`,to:`${hero} · Top ${goal}`,fromRank:ranks[6],toRank:ranks[9]}
}

function applyDiscount(invoice){if(!state.promo)return invoice;let discount=state.promo.type==='percent'?invoice.total*state.promo.value:state.promo.value;discount=Math.min(discount,invoice.total);invoice.total-=discount;invoice.rows.push({label:`Promo ${state.promo.code}`,value:`− ${egp(discount)}`});return invoice}

function saveOrderBackup(order){const key='nexrank_orders';let orders=[];try{orders=JSON.parse(localStorage.getItem(key)||'[]')}catch{}orders.unshift({...order,syncStatus:ORDER_WEBHOOK_URL?'sent':'waiting'});localStorage.setItem(key,JSON.stringify(orders.slice(0,500)))}
async function sendOrder(order){saveOrderBackup(order);if(!ORDER_WEBHOOK_URL)return false;try{await fetch(ORDER_WEBHOOK_URL,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(order)});return true}catch(error){console.error('Order delivery failed',error);return false}}

/* ---------------------------------------------------------- rendering */

let railSignature='',railCentred=-1,railFirstPaint=true;

function renderRail(){
  const endpoint=state.active,rail=$('rankRail'),active=stepIndexOf(endpoint),
        floor=endpoint==='target'?stepIndexOf('current'):0,
        signature=`${endpoint}|${floor}|${state.lang}`;
  $('railPrompt').textContent=state.lang==='ar'
    ?(endpoint==='current'?'اختَر رانكك الحالي':'اختَر الرانك المستهدف')
    :(endpoint==='current'?'Choose your current rank':'Choose your target rank');
  if(signature!==railSignature){
    railSignature=signature;railCentred=-1;
    rail.innerHTML=steps.map((step,index)=>
      `<button class="rail-chip" type="button" role="option" data-step="${index}" style="--i:${index}"${index<floor?' disabled':''}>`
      +`<img src="${step.image}" alt="" width="27" height="27" />`
      +`<i>${step.tag}</i></button>`).join('');
    rail.querySelectorAll('.rail-chip:not(:disabled)').forEach(chip=>
      chip.addEventListener('click',()=>setStep(endpoint,Number(chip.dataset.step))));
  }
  rail.querySelectorAll('.rail-chip').forEach((chip,index)=>{
    const on=index===active;chip.classList.toggle('selected',on);chip.setAttribute('aria-selected',String(on));
  });
  $('railNow').textContent=steps[active].full;
  $('railPrev').disabled=active<=floor;
  $('railNext').disabled=active>=steps.length-1;
  if(active!==railCentred){
    railCentred=active;
    const chip=rail.children[active];
    if(chip){
      /* scrollIntoView also scrolls every scrollable ancestor, which nudged
         the document sideways. A relative scroll moves only the rail, and a
         delta behaves the same in LTR and RTL. */
      const c=chip.getBoundingClientRect(),r=rail.getBoundingClientRect();
      const delta=(c.left+c.width/2)-(r.left+r.width/2);
      /* first paint lands instantly — animating in from 0 reads as a glitch */
      const behavior=(railFirstPaint||reducedMotion())?'auto':'smooth';
      railFirstPaint=false;
      if(Math.abs(delta)>1)rail.scrollBy({left:delta,behavior});
    }
  }
}

function renderStars(){
  const endpoint=state.active,rank=rankData(endpoint),stars=state[endpoint].stars,absolute=!rank.divisions[0];
  $('starDots').classList.toggle('hidden',absolute);
  $('starStepper').classList.toggle('hidden',!absolute);
  if(absolute){
    $('starValue').textContent=num(stars);
    $('starMinus').disabled=stars<=rank.starMin;
    $('starPlus').disabled=stars>=rank.starMax;
    return;
  }
  /* shape carries the state as well as colour, so it does not depend on
     colour alone and an empty slot stays visible */
  $('starDots').innerHTML=Array.from({length:5},(_,i)=>
    `<button class="star-dot${i<stars?' on':''}" type="button" data-star="${i}" aria-label="${i+1}" aria-pressed="${i<stars}">${i<stars?'★':'☆'}</button>`).join('');
  $('starDots').querySelectorAll('.star-dot').forEach(dot=>dot.addEventListener('click',()=>{
    const i=Number(dot.dataset.star);
    setStars(endpoint,stars===i+1?i:i+1);
  }));
}

/* Counts the total from its old value to its new one. Falls back to the
   final value instantly when motion is reduced or the tab is not painting,
   so the number is never left stale. */
function countTo(node,from,to,frames={}){
  if(frames.id)cancelAnimationFrame(frames.id);
  if(reducedMotion()||document.hidden||from===to){node.textContent=egp(to);return frames}
  const start=performance.now(),dur=520;
  const step=now=>{
    const t=Math.min(1,(now-start)/dur),eased=1-Math.pow(1-t,3);
    node.textContent=egp(from+(to-from)*eased);
    if(t<1)frames.id=requestAnimationFrame(step);else node.textContent=egp(to);
  };
  frames.id=requestAnimationFrame(step);
  return frames;
}
const counters=new WeakMap();

let lastTotal='',lastTotalValue=null;
function renderInvoice(){
  const invoice=applyDiscount(state.service==='global'?globalInvoice():rankInvoice()),money=egp(invoice.total);
  $('invoiceFrom').textContent=invoice.from;$('invoiceTo').textContent=invoice.to;
  $('invoiceFromIcon').src=invoice.fromRank.image;$('invoiceToIcon').src=invoice.toRank.image;
  $('invoiceRows').innerHTML=invoice.rows.map(row=>`<div class="invoice-row"><span>${row.label}</span><b>${row.value}</b></div>`).join('');
  [$('totalPrice'),$('mobileTotalPrice')].forEach(node=>{
    if(!counters.has(node))counters.set(node,{});
    countTo(node,lastTotalValue==null?invoice.total:lastTotalValue,invoice.total,counters.get(node));
  });
  $('summaryStars').textContent=num(Math.max(0,absolutePosition('target')-absolutePosition('current')));
  $('orderButton').disabled=invoice.total<=0;$('mobileOrderButton').disabled=invoice.total<=0;
  $('orderButton').dataset.total=invoice.total;
  if(lastTotal&&lastTotal!==money)[$('totalPrice'),$('mobileTotalPrice')].forEach(node=>{
    node.classList.remove('price-bump');void node.offsetWidth;node.classList.add('price-bump');
  });
  lastTotal=money;lastTotalValue=invoice.total;
}

function render(){
  ['current','target'].forEach(endpoint=>{
    const parts=rankParts(endpoint);
    $(`${endpoint}EndIcon`).src=rankData(endpoint).image;
    $(`${endpoint}EndLabel`).textContent=parts.name;
    $(`${endpoint}EndStars`).textContent=parts.stars;
    $(`${endpoint}End`).classList.toggle('active',state.active===endpoint);
  });
  $('neededStars').textContent=num(Math.max(0,absolutePosition('target')-absolutePosition('current')));
  renderRail();renderStars();renderInvoice();
}

/* -------------------------------------------------------- the sheet */

const isSheetLayout=()=>matchMedia('(max-width:1023px)').matches;
function toggleSheet(force){
  if(!isSheetLayout())return;
  const panel=$('invoicePanel'),open=force??!panel.classList.contains('open');
  panel.classList.toggle('open',open);
  $('summaryToggle').setAttribute('aria-expanded',String(open));
  $('sheetScrim').hidden=!open;
  document.body.style.overflow=open?'hidden':'';
}

function changeService(service){
  state.service=service;
  document.querySelectorAll('.service-button').forEach(b=>{
    const on=b.dataset.service===service;b.classList.toggle('active',on);b.setAttribute('aria-selected',String(on));
  });
  $('rankBuilder').classList.toggle('hidden',service==='global');
  $('globalBuilder').classList.toggle('hidden',service!=='global');
  if(service==='selfplay'){state.method='selfplay';document.querySelector('input[name="method"][value="selfplay"]').checked=true;syncMethods()}
  renderInvoice();
}
function syncMethods(){document.querySelectorAll('.option').forEach(label=>label.classList.toggle('selected',label.querySelector('input').checked))}
function applyPromo(){const code=$('promoInput').value.trim().toUpperCase(),offers={STREAM10:{type:'percent',value:.10},WELCOME100:{type:'fixed',value:100},GLOBAL15:{type:'percent',value:.15}},message=$('promoMessage');if(!offers[code]){state.promo=null;message.textContent=state.lang==='ar'?'الكود غير صحيح أو منتهي':'Invalid or expired code';message.className='promo-message error'}else{state.promo={code,...offers[code]};message.textContent=state.lang==='ar'?'تم تطبيق الخصم':'Discount applied';message.className='promo-message'}renderInvoice()}

function setLanguage(lang){
  state.lang=lang;document.documentElement.lang=lang;document.documentElement.dir=lang==='ar'?'rtl':'ltr';
  $('langButton').textContent=lang==='ar'?'EN':'AR';
  document.querySelectorAll('[data-i18n]').forEach(node=>{if(!node.dataset.ar)node.dataset.ar=node.textContent;const key=node.dataset.i18n;node.textContent=lang==='en'&&copy.en[key]?copy.en[key]:node.dataset.ar});
  document.querySelectorAll('[data-i18n-html]').forEach(node=>{if(!node.dataset.ar)node.dataset.ar=node.innerHTML;const key=node.dataset.i18nHtml;node.innerHTML=lang==='en'&&copy.en[key]?copy.en[key]:node.dataset.ar});
  lastTotal='';render();
}

function openOrderDialog(){
  const heroInput=state.service==='global'?$('heroName'):($('heroOnly').checked?$('specificHero'):null);
  if(heroInput&&!heroInput.value.trim()){heroInput.classList.add('invalid');toggleSheet(false);heroInput.focus();return}
  if(heroInput)heroInput.classList.remove('invalid');
  toggleSheet(false);
  $('orderDialog').showModal();
}
function initWebGL(){const canvas=$('scene');if(matchMedia('(max-width:680px), (prefers-reduced-motion: reduce)').matches)return;const gl=canvas.getContext('webgl',{alpha:false,antialias:false,powerPreference:'low-power'});if(!gl)return;const vertex=`attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`,fragment=`precision mediump float;uniform vec2 r;uniform float t;uniform vec2 m;float h(vec2 p){return fract(sin(dot(p,vec2(41.3,289.2)))*47358.5);}void main(){vec2 u=(gl_FragCoord.xy-.5*r)/r.y;vec3 c=vec3(.025,.03,.055);float d=length(u-vec2(.38,.27)+m*.05);c+=vec3(.12,.07,.3)*smoothstep(.75,.03,d);float w=sin(u.x*3.+u.y*2.4+t*.1)+sin(u.x*5.5-u.y*2.8+t*.07);c+=vec3(.02,.065,.12)*smoothstep(.16,0.,abs(u.y+.23+w*.04));float s=step(.998,h(floor((u+2.)*vec2(160.,90.))));c+=s*vec3(.38,.45,.7);gl_FragColor=vec4(c,1.);}`;const sh=(type,src)=>{const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);return s},program=gl.createProgram();gl.attachShader(program,sh(gl.VERTEX_SHADER,vertex));gl.attachShader(program,sh(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);gl.useProgram(program);const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);const loc=gl.getAttribLocation(program,'p');gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);const resize=()=>{const d=Math.min(1.4,devicePixelRatio||1);canvas.width=innerWidth*d;canvas.height=innerHeight*d;gl.viewport(0,0,canvas.width,canvas.height)};let mouse=[0,0];addEventListener('pointermove',e=>mouse=[e.clientX/innerWidth-.5,.5-e.clientY/innerHeight],{passive:true});addEventListener('resize',resize);resize();const tl=gl.getUniformLocation(program,'t'),rl=gl.getUniformLocation(program,'r'),ml=gl.getUniformLocation(program,'m');const draw=now=>{gl.uniform1f(tl,now*.001);gl.uniform2f(rl,canvas.width,canvas.height);gl.uniform2f(ml,...mouse);gl.drawArrays(gl.TRIANGLES,0,3);requestAnimationFrame(draw)};requestAnimationFrame(draw)}


document.addEventListener('DOMContentLoaded',()=>{
  /* endpoint segmented control — the rail and the stars always edit
     whichever endpoint is active, so there is one model throughout */
  ['current','target'].forEach(endpoint=>{
    $(`${endpoint}End`).addEventListener('click',()=>{state.active=endpoint;render()});
  });

  $('railPrev').addEventListener('click',()=>setStep(state.active,stepIndexOf(state.active)-1));
  $('railNext').addEventListener('click',()=>setStep(state.active,stepIndexOf(state.active)+1));
  $('starMinus').addEventListener('click',()=>setStars(state.active,state[state.active].stars-1));
  $('starPlus').addEventListener('click',()=>setStars(state.active,state[state.active].stars+1));

  document.querySelectorAll('.service-button').forEach(button=>
    button.addEventListener('click',()=>changeService(button.dataset.service)));
  document.querySelectorAll('input[name="method"]').forEach(input=>
    input.addEventListener('change',()=>{state.method=input.value;syncMethods();renderInvoice()}));

  $('heroOnly').addEventListener('change',()=>{
    const enabled=$('heroOnly').checked;
    $('specificHeroPicker').classList.toggle('hidden',!enabled);
    $('specificHero').required=enabled;syncMethods();
    if(enabled)$('specificHero').focus();
    renderInvoice();
  });
  $('express').addEventListener('change',()=>{syncMethods();renderInvoice()});
  [$('specificHero'),$('heroName'),$('heroPower'),$('globalGoal'),$('globalMethod')]
    .forEach(input=>input.addEventListener('input',renderInvoice));

  $('applyPromo').addEventListener('click',applyPromo);
  $('promoInput').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();applyPromo()}});
  $('langButton').addEventListener('click',()=>setLanguage(state.lang==='ar'?'en':'ar'));

  $('summaryToggle').addEventListener('click',()=>toggleSheet());
  $('sheetScrim').addEventListener('click',()=>toggleSheet(false));
  $('sheetGrab').addEventListener('click',()=>toggleSheet(false));
  addEventListener('keydown',e=>{if(e.key==='Escape')toggleSheet(false)});

  $('orderButton').addEventListener('click',openOrderDialog);
  $('mobileOrderButton').addEventListener('click',openOrderDialog);
  $('closeDialog').addEventListener('click',()=>$('orderDialog').close());
  $('finishOrder').addEventListener('click',()=>$('orderDialog').close());

  $('contactForm').addEventListener('submit',async e=>{
    e.preventDefault();
    const submit=e.submitter;
    submit.disabled=true;
    submit.textContent=state.lang==='ar'?'جاري إرسال الطلب…':'Sending…';
    const id=`#${Math.floor(1000+Math.random()*8999)}`,
      order={
        id,createdAt:new Date().toISOString(),service:state.service,
        total:$('orderButton').dataset.total,paymentMethod:$('paymentMethod').value,
        route:{
          from:rankLabel('current',{plain:true}),
          to:rankLabel('target',{plain:true}),
          stars:Math.max(0,absolutePosition('target')-absolutePosition('current'))
        },
        method:state.method,
        hero:state.service==='global'?$('heroName').value.trim():($('heroOnly').checked?$('specificHero').value.trim():''),
        extras:{specificHero:$('heroOnly').checked,express:$('express').checked,promo:state.promo?.code||''},
        customer:{name:$('customerName').value.trim(),whatsapp:$('customerWhatsapp').value.trim(),email:$('customerEmail').value.trim(),region:$('customerRegion').value},
        notify
      };
    const delivered=await sendOrder(order);
    window.dispatchEvent(new CustomEvent('nexrank:order-created',{detail:order}));
    $('orderId').textContent=id;
    $('orderSyncStatus').textContent=delivered
      ?(state.lang==='ar'?'تم تسجيل الطلب وإرسال إشعار للفريق.':'Order saved and team notified.')
      :(state.lang==='ar'?'تم حفظ الطلب في لوحة الطلبات. ربط Google مطلوب لتفعيل الإيميل والشيت.':'Order saved locally. Connect Google to enable email and Sheets.');
    $('contactStep').classList.add('hidden');
    $('successStep').classList.remove('hidden');
    submit.disabled=false;
  });

  /* the sheet is mobile-only; leaving it open across a resize to desktop
     would strand body overflow:hidden */
  addEventListener('resize',()=>{if(!isSheetLayout()){$('invoicePanel').classList.remove('open');$('sheetScrim').hidden=true;document.body.style.overflow=''}});

  render();
  initWebGL();
  initReveals();
});

/* Entry choreography. IntersectionObserver only — a scroll listener would
   reflow continuously and cost mobile frames. */
function initReveals(){
  if(reducedMotion())return;
  const io=new IntersectionObserver((entries,obs)=>{
    entries.forEach(entry=>{
      if(!entry.isIntersecting)return;
      entry.target.classList.add('is-in');
      obs.unobserve(entry.target);
    });
  },{rootMargin:'0px 0px -8% 0px',threshold:.08});
  document.querySelectorAll('[data-reveal]').forEach(el=>io.observe(el));
  document.querySelectorAll('[data-reveal-group]').forEach(group=>{
    [...group.children].forEach((child,i)=>child.style.setProperty('--d',`${i*70}ms`));
    io.observe(group);
  });
}
