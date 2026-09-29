const roleOptions=[
  {value:'TOP',label:'TOP',asset:'assets/roles/display/top.png'},
  {value:'JUNGLE',label:'JUNGLE',asset:'assets/roles/display/jug.png'},
  {value:'MID',label:'MID',asset:'assets/roles/display/mid.png'},
  {value:'ADC',label:'ADC',asset:'assets/roles/display/adc.png'},
  {value:'SUPPORT',label:'SUPPORT',asset:'assets/roles/display/sup.png'}
];
const tierOptions=[
  {value:'UNRANKED',label:'UNRANKED',asset:null},
  {value:'IRON',asset:'assets/tiers/iron.png'},{value:'BRONZE',asset:'assets/tiers/bronze.png'},{value:'SILVER',asset:'assets/tiers/silver.png'},
  {value:'GOLD',asset:'assets/tiers/gold.png'},{value:'PLATINUM',asset:'assets/tiers/platinum.png'},{value:'EMERALD',asset:'assets/tiers/emerald.png'},
  {value:'DIAMOND',asset:'assets/tiers/diamond.png'},{value:'MASTER',asset:'assets/tiers/master.png'},{value:'GRANDMASTER',asset:'assets/tiers/grandmaster.png'},
  {value:'CHALLENGER',asset:'assets/tiers/challenger.png'}
];
const tierTheme={UNRANKED:['#707887','#d6dae2','#2e3440'],IRON:['#7b6d73','#b6a8ae','#3b3337'],BRONZE:['#a66a43','#d29a73','#5c3424'],SILVER:['#9eb2c6','#dce8f1','#4a5b6c'],GOLD:['#d1a840','#ffe08a','#76520e'],PLATINUM:['#43aebe','#a6edf2','#1f5f66'],EMERALD:['#2fc484','#9cf3c8','#155f42'],DIAMOND:['#649cff','#c0d7ff','#2f4f98'],MASTER:['#a855f7','#dec1ff','#4c1d95'],GRANDMASTER:['#df5267','#ffb3bf','#7d1e2d'],CHALLENGER:['#6ecbf8','#d8f4ff','#2b6d8e']};
const fallback={version:'14.24.1',list:[{id:'Nilah',name:'닐라',title:'해방된 기쁨',tags:['Fighter','Assassin']},{id:'Caitlyn',name:'케이틀린',title:'필트오버의 보안관',tags:['Marksman']},{id:'Velkoz',name:'벨코즈',title:'공허의 눈',tags:['Mage']},{id:'Samira',name:'사미라',title:'사막의 장미',tags:['Marksman']},{id:'Kaisa',name:'카이사',title:'공허의 딸',tags:['Marksman']},{id:'Jinx',name:'징크스',title:'난폭한 말괄량이',tags:['Marksman']},{id:'Ahri',name:'아리',title:'구미호',tags:['Mage','Assassin']}]};
const $=id=>document.getElementById(id); const els={nickname:$('nickname'),serverTag:$('serverTag'),birth:$('birth'),gender:$('gender'),introText:$('introText'),introCount:$('introCount'),mainRole:$('mainRole'),subRole:$('subRole'),tier:$('tier'),rankType:$('rankType'),most1:$('most1'),most2:$('most2'),most3:$('most3'),tagInput:$('tagInput'),tagInputWrap:$('tagInputWrap'),clearTags:$('clearTags'),characterUpload:$('characterUpload'),clearCharacterBtn:$('clearCharacterBtn'),aiGenerateBtn:$('aiGenerateBtn'),aiStatus:$('aiStatus'),downloadBtn:$('downloadBtn'),resetBtn:$('resetBtn'),card:$('profileCard'),viewport:$('cardViewport'),characterImage:$('characterImage'),profileIcon:$('profileIcon'),cardNickname:$('cardNickname'),cardTag:$('cardTag'),cardBirth:$('cardBirth'),cardGender:$('cardGender'),cardIntro:$('cardIntro'),mainRoleIcon:$('mainRoleIcon'),subRoleIcon:$('subRoleIcon'),mainRoleText:$('mainRoleText'),subRoleText:$('subRoleText'),tierIcon:$('tierIcon'),tierText:$('tierText'),tierQueueText:$('tierQueueText'),most1Icon:$('most1Icon'),most2Icon:$('most2Icon'),most3Icon:$('most3Icon'),most1Name:$('most1Name'),most2Name:$('most2Name'),most3Name:$('most3Name'),cardTags:$('cardTags')};

const apiBase = (window.WOOJU_CONFIG?.apiBaseUrl || 'https://wooju-ai.onrender.com').replace(/\/$/, '');
function apiUrl(path){
  if (apiBase) return `${apiBase}${path}`;
  return path;
}

let state={tags:['즐겜','디코가능','일반','친목','솔랭'],uploadedCharacter:null,championVersion:fallback.version,champions:[]};

// Large AI/uploaded background images are stored in IndexedDB instead of localStorage.
// This keeps the generated background after refresh/revisit without hitting localStorage quota limits.
const BG_DB_NAME='wooju-card-assets';
const BG_DB_VERSION=1;
const BG_STORE='backgrounds';
const BG_KEY='current-background';
function openBgDB(){
  return new Promise((resolve,reject)=>{
    const req=indexedDB.open(BG_DB_NAME,BG_DB_VERSION);
    req.onupgradeneeded=()=>{
      const db=req.result;
      if(!db.objectStoreNames.contains(BG_STORE)) db.createObjectStore(BG_STORE,{keyPath:'id'});
    };
    req.onsuccess=()=>resolve(req.result);
    req.onerror=()=>reject(req.error);
  });
}
async function saveBackgroundImage(dataUrl, source='ai'){
  if(!dataUrl) return;
  try{
    const db=await openBgDB();
    await new Promise((resolve,reject)=>{
      const tx=db.transaction(BG_STORE,'readwrite');
      tx.objectStore(BG_STORE).put({id:BG_KEY,dataUrl,source,updatedAt:Date.now()});
      tx.oncomplete=resolve;
      tx.onerror=()=>reject(tx.error);
      tx.onabort=()=>reject(tx.error);
    });
    db.close();
  }catch(e){ console.warn('Background persistence failed:',e); }
}
async function loadBackgroundImage(){
  try{
    const db=await openBgDB();
    const value=await new Promise((resolve,reject)=>{
      const tx=db.transaction(BG_STORE,'readonly');
      const req=tx.objectStore(BG_STORE).get(BG_KEY);
      req.onsuccess=()=>resolve(req.result||null);
      req.onerror=()=>reject(req.error);
    });
    db.close();
    return value?.dataUrl||null;
  }catch(e){ console.warn('Background restore failed:',e); return null; }
}
async function clearBackgroundImage(){
  try{
    const db=await openBgDB();
    await new Promise((resolve,reject)=>{
      const tx=db.transaction(BG_STORE,'readwrite');
      tx.objectStore(BG_STORE).delete(BG_KEY);
      tx.oncomplete=resolve;
      tx.onerror=()=>reject(tx.error);
      tx.onabort=()=>reject(tx.error);
    });
    db.close();
  }catch(e){ console.warn('Background clear failed:',e); }
}

function fill(select,items,selected){select.innerHTML='';items.forEach(i=>{const o=document.createElement('option');o.value=i.value||i.id;o.textContent=i.label||i.name||i.value;if(o.value===selected)o.selected=true;select.appendChild(o)})}
function champ(id){return state.champions.find(c=>c.id===id)||fallback.list.find(c=>c.id===id)||fallback.list[0]}
function champIcon(id){return `https://ddragon.leagueoflegends.com/cdn/${state.championVersion}/img/champion/${id}.png`}
function splash(id){return `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${id}_0.jpg`}
function roleAsset(v){return roleOptions.find(r=>r.value===v)?.asset||roleOptions[0].asset} function tierAsset(v){return tierOptions.find(t=>t.value===v)?.asset||''}
function collect(){return{nickname:els.nickname.value.trim()||'이 궤',serverTag:els.serverTag.value.trim()||'#에이엑',birth:els.birth.value.trim()||'2000',gender:els.gender.value,introText:els.introText.value.trim()||'같이 재밌게 게임해요',mainRole:els.mainRole.value,subRole:els.subRole.value,tier:els.tier.value,rankType:els.rankType.value,most1:els.most1.value,most2:els.most2.value,most3:els.most3.value,tags:state.tags,uploadedCharacter:state.uploadedCharacter}}
function save(){try{const d=collect();d.uploadedCharacter=null;localStorage.setItem('wooju-card-v7',JSON.stringify(d))}catch(e){console.warn('Profile save skipped:',e)}} function load(){try{return JSON.parse(localStorage.getItem('wooju-card-v7'))}catch{return null}}
function apply(d){if(!d)return;['nickname','serverTag','birth','introText'].forEach(k=>{if(d[k])els[k].value=d[k]});if(d.gender)els.gender.value=d.gender;if(d.mainRole)els.mainRole.value=d.mainRole;if(d.subRole)els.subRole.value=d.subRole;if(d.tier)els.tier.value=d.tier;if(d.rankType)els.rankType.value=d.rankType;if(d.most1)els.most1.value=d.most1;if(d.most2)els.most2.value=d.most2;if(d.most3)els.most3.value=d.most3;if(Array.isArray(d.tags))state.tags=d.tags;if(d.uploadedCharacter)state.uploadedCharacter=d.uploadedCharacter}
function renderTags(){els.tagInputWrap.querySelectorAll('.tag-pill').forEach(e=>e.remove());state.tags.forEach((t,i)=>{const s=document.createElement('span');s.className='tag-pill';s.innerHTML=`#${t}<button type="button">×</button>`;s.querySelector('button').onclick=()=>{state.tags.splice(i,1);renderTags();update()};els.tagInputWrap.insertBefore(s,els.tagInput)});els.cardTags.innerHTML='';state.tags.slice(0,5).forEach(t=>{const s=document.createElement('span');s.textContent=`#${t}`;els.cardTags.appendChild(s)})}
function addTag(v){const t=v.replace(/^#/,'').trim();if(!t||state.tags.includes(t)||state.tags.length>=8)return;state.tags.push(t);renderTags();update()}
function fitIdentityLine(){
  // Keep nickname + tag on one line, but fit them into a conservative safe text area.
  // Some iPhones render Jua slightly wider, so we use a smaller visual width target
  // than the full identity box to prevent overlaps like "닉네임#KR1".
  const box=els.cardNickname.closest('.identity');
  if(!box) return;

  const safeMaxWidth=Math.min(box.clientWidth || 620, 560);
  const gap=14;
  let nickSize=88;
  let tagSize=30;
  const minNickSize=32;
  const minTagSize=14;

  const applySize=()=>{
    els.cardNickname.style.fontSize=`${nickSize}px`;
    els.cardTag.style.fontSize=`${tagSize}px`;
  };

  applySize();
  for(let i=0;i<70;i++){
    const total=els.cardNickname.scrollWidth + els.cardTag.scrollWidth + gap;
    if(total<=safeMaxWidth) break;
    if(nickSize<=minNickSize && tagSize<=minTagSize) break;
    nickSize=Math.max(minNickSize,nickSize-1);
    tagSize=Math.max(minTagSize,Math.round(nickSize*0.34));
    applySize();
  }

  // If the combination is still too long on narrow Safari rendering, trim only a bit more.
  while((els.cardNickname.scrollWidth + els.cardTag.scrollWidth + gap) > safeMaxWidth && nickSize > minNickSize){
    nickSize=Math.max(minNickSize,nickSize-1);
    tagSize=Math.max(minTagSize,Math.round(nickSize*0.33));
    applySize();
  }
}
function fitTierText(){
  const el=els.tierText;
  const wrap=el?.parentElement;
  if(!el||!wrap) return;
  let size=50;
  const minSize=30;
  el.style.fontSize=`${size}px`;
  el.style.whiteSpace='nowrap';
  // The text area next to the emblem is intentionally narrow; shrink only long tier names.
  const maxWidth=Math.max(120,wrap.clientWidth||198);
  for(let i=0;i<24 && el.scrollWidth>maxWidth && size>minSize;i++){
    size-=1;
    el.style.fontSize=`${size}px`;
  }
}
function update(){const d=collect();els.cardNickname.textContent=d.nickname;els.cardTag.textContent=d.serverTag;fitIdentityLine();els.cardBirth.textContent=d.birth;els.cardGender.textContent=d.gender;els.cardIntro.textContent=d.introText;els.introCount.textContent=d.introText.length;els.mainRoleText.textContent=d.mainRole;els.subRoleText.textContent=d.subRole;els.mainRoleIcon.src=roleAsset(d.mainRole);els.subRoleIcon.src=roleAsset(d.subRole);els.tierText.textContent=d.tier;els.tierQueueText.textContent=d.rankType==='FLEX'?'(자유랭크)':'(솔로랭크)';
const isUnranked=d.tier==='UNRANKED';
const tierBlock=els.tierIcon.closest('.tier-block');
tierBlock?.classList.toggle('is-unranked',isUnranked);
if(isUnranked){
  els.tierIcon.removeAttribute('src');
  els.tierIcon.alt='';
}else{
  els.tierIcon.src=tierAsset(d.tier);
  els.tierIcon.alt=`${d.tier} 티어`;
}
requestAnimationFrame(fitTierText);
const th=tierTheme[d.tier]||tierTheme.MASTER;document.documentElement.style.setProperty('--tier',th[0]);document.documentElement.style.setProperty('--tier-light',th[1]);document.documentElement.style.setProperty('--tier-dark',th[2]);document.documentElement.style.setProperty('--tier-glow',`${th[0]}70`);const c1=champ(d.most1),c2=champ(d.most2),c3=champ(d.most3);els.profileIcon.src=champIcon(c1.id);els.most1Icon.src=champIcon(c1.id);els.most2Icon.src=champIcon(c2.id);els.most3Icon.src=champIcon(c3.id);els.most1Name.textContent=c1.name;els.most2Name.textContent=c2.name;els.most3Name.textContent=c3.name;els.characterImage.src=state.uploadedCharacter||splash(c1.id);renderTags();save()}
function scaleCard(){const w=els.viewport.clientWidth;const scale=w/1080;els.card.style.transform=`scale(${scale})`;els.viewport.style.height=`${1080*scale}px`}
function promptText(){
  const d=collect();
  const c=champ(d.most1);
  const title=c.title?` — ${c.title}`:'';
  const lore=c.blurb?c.blurb.replace(/\s+/g,' ').trim():'';
  const archetypes=Array.isArray(c.tags)&&c.tags.length?c.tags.join(', '):'champion';

  return [
    `Create ONE original, premium square fantasy game key-art illustration for use ONLY as a profile-card background.`,

    `SELECTED CHAMPION: ${c.id} (${c.name})${title}. Archetypes: ${archetypes}.`,
    lore?`Official champion context: ${lore}`:'',

    `The server provides TWO image references. Follow their roles exactly.`,
    `REFERENCE IMAGE 1 is the official default splash artwork for ${c.id}. This is the ONLY authority for champion identity. Preserve the selected champion's recognizable species/body type, face or creature anatomy, hairstyle/head shape, signature clothing or armor language, accessories, silhouette, weapon/prop, signature powers, personality, and core color identity. The finished artwork must be immediately recognizable as ${c.id}.`,
    `REFERENCE IMAGE 2 is ONLY a QUALITY / RENDERING / COMPOSITION benchmark. Use its premium polish, close-up visual impact, cinematic lighting, sharp focal rendering, layered depth, dynamic perspective, foreground effects, elegant motion, and expensive game-key-art finish. DO NOT copy Reference 2's person, face, hairstyle, clothing, jewelry, yellow outfit, blue water powers, color palette, or character-specific details unless those elements genuinely belong to ${c.id}.`,

    `Create a NEW composition rather than tracing or reproducing either reference image. Identity comes from Reference 1; presentation quality and visual ambition come from Reference 2.`,

    `ART DIRECTION: top-tier premium fantasy game key art; beautiful or majestic as appropriate to the champion; sophisticated semi-realistic rendering; cinematic key light and rim light; luminous highlights; crisp face/focal detail; rich material definition; atmospheric depth; foreground/midground/background separation; elegant particles and champion-specific effects; controlled bloom; refined color grading; high contrast around the focal point; visually dense and luxurious without becoming messy. The first impression must feel expensive and professionally art-directed.`,

    `STAGING: NOT a passive portrait and NOT a simple standing pose. Use a strong dynamic action pose or emotionally charged hero moment. Favor dramatic perspective, tasteful foreshortening, flowing hair/fabric/energy where appropriate, and signature powers or weapons sweeping through the foreground. The champion should feel alive, powerful, and in motion.`,

    `CARD COMPOSITION: output is square 1:1. Put the main champion predominantly in the center-right, with the main face/focal point roughly at 64–76% of canvas width. Keep about the left 38–42% darker, calmer, lower-detail, and lower-contrast for white profile text. The left side must still feel atmospheric and finished, not empty. Keep the lower band slightly darker/calmer because fixed tier, champion icons, and tags will overlay it.`,

    `ENVIRONMENT: build a setting that belongs naturally to ${c.id}'s world, faction, powers, or narrative. Use champion-specific architecture, weather, magic, technology, terrain, particles, or atmosphere where appropriate. Never default to generic castle/forest/sky filler.`,

    `NON-HUMAN FIDELITY: never humanize a non-human champion. Preserve yordles, monsters, void entities, spirits, constructs, creatures, celestial beings, unusual anatomy, companions, masks, forms, or transformations when they are central to the champion identity.`,

    `QUALITY FAILURE PREVENTION: no generic fantasy cosplay, no plain portrait, no weak pose, no flat lighting, no muddy textures, no low-detail face, no cheap mobile-game look, no duplicated main character, no duplicate face, no malformed hands/limbs, no wrong limb count, no broken weapon geometry, no random unrelated accessories, no empty background, no visual dead zone around the main subject.`,

    `PLAYER CONTEXT: main role ${d.mainRole}; tier ${d.tier}; ranked queue ${d.rankType==='FLEX'?'Flex Rank':'Solo Rank'}. These may affect only subtle prestige/intensity. They must never override the champion's canonical identity or signature visual language.`,

    `STRICT OUTPUT EXCLUSIONS: artwork only. NO text, letters, numbers, logos, watermark, champion name, League logo, rank emblem, role icon, UI, HUD, card border, frame, plaque, button, tag, WOOJU branding, or interface decoration anywhere in the generated image.`,

    `FINAL BAR: the finished image should look like a premium promotional splash/key-art illustration that a player would be happy to pay for: immediately recognizable champion identity from Reference 1, and the dramatic beauty, polish, depth, lighting, and visual impact demonstrated by Reference 2.`
  ].filter(Boolean).join('\n\n');
}
async function generateAI(){
  const b=els.aiGenerateBtn, s=els.aiStatus;
  b.disabled=true;
  b.textContent='생성 중...';
  s.className='helper';
  s.textContent='공식 챔피언 이미지 + 프리미엄 스타일 레퍼런스로 생성 중...';
  try{
    const d=collect(), c=champ(d.most1);
    const endpoint=apiUrl('/api/generate-character');
    const r=await fetch(endpoint,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        prompt:promptText(),
        champion:c,
        championId:c.id,
        mainRole:d.mainRole,
        tier:d.tier,
        format:'background-only-square'
      })
    });
    let j={};
    try{ j=await r.json(); }catch{}
    if(!r.ok){
      throw new Error(j?.error?.message || j?.error || `HTTP ${r.status}`);
    }
    state.uploadedCharacter=j.imageUrl || (j.imageBase64 ? `data:${j.mimeType||'image/png'};base64,${j.imageBase64}` : null);
    if(!state.uploadedCharacter) throw new Error('이미지 데이터가 없습니다.');
    await saveBackgroundImage(state.uploadedCharacter,'ai');
    update();
    s.className='helper is-ok';
    s.textContent='공식 챔피언 레퍼런스 기반 AI 배경을 적용했습니다.';
  }catch(err){
    console.error('AI background generation failed:', err);
    s.className='helper is-warn';
    s.textContent=`AI 배경 생성 실패: ${err?.message || '서버 연결을 확인해주세요.'}`;
  }finally{
    b.disabled=false;
    b.textContent='AI 배경 생성';
  }
}
function waitForCardImages(root){
  const imgs=[...root.querySelectorAll('img')];
  return Promise.all(imgs.map(img=>{
    if(img.complete && img.naturalWidth>0) return Promise.resolve();
    return new Promise(resolve=>{
      const done=()=>resolve();
      img.addEventListener('load',done,{once:true});
      img.addEventListener('error',done,{once:true});
      setTimeout(done,15000);
    });
  }));
}
function isIOSDevice(){
  return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform==='MacIntel' && navigator.maxTouchPoints>1);
}
function dataUrlToFile(dataUrl,filename){
  const parts=dataUrl.split(',');
  const mime=(parts[0].match(/data:([^;]+)/)||[])[1]||'image/png';
  const bin=atob(parts[1]);
  const bytes=new Uint8Array(bin.length);
  for(let i=0;i<bin.length;i++) bytes[i]=bin.charCodeAt(i);
  return new File([bytes],filename,{type:mime});
}
function showIOSSaveOverlay(dataUrl){
  document.getElementById('iosSaveOverlay')?.remove();
  const overlay=document.createElement('div');
  overlay.id='iosSaveOverlay';
  Object.assign(overlay.style,{position:'fixed',inset:'0',zIndex:'999999',background:'rgba(1,7,18,.96)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'20px'});
  const msg=document.createElement('div');
  msg.innerHTML='<strong style="font-size:18px">이미지를 길게 눌러 사진에 저장</strong><br><span style="font-size:13px;opacity:.75">카카오톡 안에서 저장 메뉴가 안 뜨면 Safari에서 열어주세요.</span>';
  Object.assign(msg.style,{color:'#fff',textAlign:'center',marginBottom:'14px',lineHeight:'1.55'});
  const img=document.createElement('img');
  img.src=dataUrl;
  img.alt='저장할 WOOJU 프로필 카드';
  Object.assign(img.style,{display:'block',width:'min(88vw,620px)',maxHeight:'74vh',objectFit:'contain',borderRadius:'12px',boxShadow:'0 18px 60px rgba(0,0,0,.55)'});
  const close=document.createElement('button');
  close.type='button';close.textContent='닫기';
  Object.assign(close.style,{marginTop:'16px',padding:'11px 24px',border:'0',borderRadius:'12px',background:'#fff',color:'#07101e',fontWeight:'800',fontSize:'15px'});
  close.onclick=()=>overlay.remove();
  overlay.append(msg,img,close);
  document.body.appendChild(overlay);
}


let exportFontCSSCache=null;

async function buildGoogleFontEmbedCSS(){
  if(exportFontCSSCache) return exportFontCSSCache;
  const links=[...document.querySelectorAll('link[rel="stylesheet"][href*="fonts.googleapis.com"]')]
    .map(l=>l.href)
    .filter(Boolean);
  if(!links.length) return '';

  const cssParts=[];
  for(const href of links){
    try{
      const res=await fetch(href,{mode:'cors',cache:'force-cache'});
      let css=await res.text();
      const urls=[...css.matchAll(/url\(([^)]+)\)/g)].map(m=>m[1].replace(/["']/g,'').trim());
      for(const url of urls){
        try{
          const fres=await fetch(url,{mode:'cors',cache:'force-cache'});
          const blob=await fres.blob();
          const dataUrl=await new Promise((resolve,reject)=>{
            const fr=new FileReader();
            fr.onload=()=>resolve(fr.result);
            fr.onerror=reject;
            fr.readAsDataURL(blob);
          });
          css=css.split(url).join(dataUrl);
        }catch(fontErr){
          console.warn('Font file embed failed:',url,fontErr);
        }
      }
      cssParts.push(css);
    }catch(err){
      console.warn('Google font stylesheet fetch failed:',href,err);
    }
  }
  exportFontCSSCache=cssParts.join(String.fromCharCode(10));
  return exportFontCSSCache;
}

async function prepareExportFonts(){
  if(document.fonts?.load){
    await Promise.allSettled([
      document.fonts.load('400 88px "Jua"', 'MU지개반사 #KR1 가나다 ABC 123'),
      document.fonts.load('400 37px "Jua"', '같이 재밌게 게임해요 1997년생 자랭 환영'),
      document.fonts.load('700 53px "Rajdhani"', 'CHALLENGER GRANDMASTER MASTER GOLD ADC MID SUPPORT WOOJU'),
      document.fonts.load('700 30px "Noto Sans KR"', '모스트 챔피언 솔로랭크 자유랭크 출겜 디코가능 일반 친목 솔랭')
    ]);
  }
  if(document.fonts?.ready) await document.fonts.ready;

  const googleCSS=await buildGoogleFontEmbedCSS();
  if(googleCSS) return googleCSS;

  if(window.htmlToImage?.getFontEmbedCSS){
    try{
      return await window.htmlToImage.getFontEmbedCSS(document.documentElement);
    }catch(err){
      console.warn('Font embedding fallback failed:',err);
    }
  }
  return undefined;
}

async function exportCardPNG(){
  const b=els.downloadBtn;
  const oldText=b.textContent;
  b.disabled=true;
  b.textContent='PNG 만드는 중...';

  try{
    const fontEmbedCSS=await prepareExportFonts();
    fitTierText();
    await waitForCardImages(els.card);

    if(!window.htmlToImage?.toPng){
      throw new Error('PNG 저장 라이브러리를 불러오지 못했습니다. 페이지를 새로고침한 뒤 다시 시도해주세요.');
    }

    const dataUrl=await window.htmlToImage.toPng(els.card,{
      width:1080,
      height:1080,
      canvasWidth:1080,
      canvasHeight:1080,
      pixelRatio:1,
      backgroundColor:'#07101e',
      cacheBust:true,
      includeQueryParams:true,
      skipAutoScale:true,
      preferredFontFormat:'woff2',
      ...(fontEmbedCSS?{fontEmbedCSS}:{}),
      style:{
        transform:'none',
        transformOrigin:'0 0',
        left:'0px',
        top:'0px',
        width:'1080px',
        height:'1080px',
        margin:'0'
      }
    });

    const filename=`${(els.nickname.value||'wooju').replace(/\s+/g,'_')}_WOOJU.png`;

    // iOS Safari / in-app browsers often ignore <a download>. Prefer native share with a real File.
    if(isIOSDevice()){
      let shared=false;
      try{
        const file=dataUrlToFile(dataUrl,filename);
        const shareData={files:[file],title:'WOOJU 프로필 카드'};
        if(navigator.share && (!navigator.canShare || navigator.canShare(shareData))){
          await navigator.share(shareData);
          shared=true;
        }
      }catch(err){
        // Cancel is not an error. If share is unavailable/blocked, show a saveable image overlay.
        if(err?.name==='AbortError') return;
        console.warn('iOS share fallback:',err);
      }
      if(!shared) showIOSSaveOverlay(dataUrl);
      return;
    }

    const a=document.createElement('a');
    a.href=dataUrl;
    a.download=filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }catch(err){
    console.error('PNG export failed:',err);
    alert(`PNG 저장 실패: ${err?.message||'알 수 없는 오류'}\n\n새로고침하지 말고 이 문구를 알려주세요.`);
  }finally{
    b.disabled=false;
    b.textContent=oldText;
    scaleCard();
  }
}

function setup(){
  [els.nickname,els.serverTag,els.birth,els.gender,els.introText,els.mainRole,els.subRole,els.tier,els.rankType,els.most1,els.most2,els.most3].forEach(e=>{e.addEventListener('input',update);e.addEventListener('change',update)});
  els.tagInput.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===','){e.preventDefault();addTag(els.tagInput.value);els.tagInput.value=''}});
  document.querySelectorAll('.quick-tags button').forEach(b=>b.onclick=()=>addTag(b.dataset.tag));
  els.clearTags.onclick=()=>{state.tags=[];renderTags();update()};
  els.characterUpload.onchange=e=>{const f=e.target.files?.[0];if(!f)return;const rd=new FileReader();rd.onload=async()=>{state.uploadedCharacter=rd.result;await saveBackgroundImage(state.uploadedCharacter,'upload');update()};rd.readAsDataURL(f)};
  els.clearCharacterBtn.onclick=async()=>{state.uploadedCharacter=null;els.characterUpload.value='';await clearBackgroundImage();update()};
  els.aiGenerateBtn.onclick=generateAI;
  els.resetBtn.onclick=async()=>{localStorage.removeItem('wooju-card-v7');await clearBackgroundImage();location.reload()};
  els.downloadBtn.onclick=exportCardPNG;

  // Ensure external Riot images are requested in CORS-safe mode for export.
  [els.characterImage,els.profileIcon,els.most1Icon,els.most2Icon,els.most3Icon].forEach(img=>{img.crossOrigin='anonymous'});

  new ResizeObserver(scaleCard).observe(els.viewport);
  window.addEventListener('resize',scaleCard);
}
async function loadChamps(){try{const vr=await fetch('https://ddragon.leagueoflegends.com/api/versions.json'),vs=await vr.json();state.championVersion=vs[0]||fallback.version;const cr=await fetch(`https://ddragon.leagueoflegends.com/cdn/${state.championVersion}/data/ko_KR/champion.json`),p=await cr.json();state.champions=Object.values(p.data).map(c=>({id:c.id,name:c.name,title:c.title||'',blurb:c.blurb||'',tags:c.tags||[],partype:c.partype||''})).sort((a,b)=>a.name.localeCompare(b.name,'ko'))}catch{state.champions=fallback.list;state.championVersion=fallback.version}const items=state.champions.map(c=>({value:c.id,label:c.name,id:c.id,name:c.name}));fill(els.most1,items,'Nilah');fill(els.most2,items,'Caitlyn');fill(els.most3,items,'Velkoz')}
async function init(){fill(els.mainRole,roleOptions,'ADC');fill(els.subRole,roleOptions,'MID');fill(els.tier,tierOptions,'MASTER');await loadChamps();apply(load());state.uploadedCharacter=await loadBackgroundImage();setup();update();scaleCard();if(document.fonts?.ready){document.fonts.ready.then(()=>{fitIdentityLine();fitTierText();scaleCard()})}} init();
