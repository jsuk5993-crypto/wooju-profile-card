const roleOptions=[
  {value:'TOP',label:'TOP',asset:'assets/roles/display/top.png'},
  {value:'JUNGLE',label:'JUNGLE',asset:'assets/roles/display/jug.png'},
  {value:'MID',label:'MID',asset:'assets/roles/display/mid.png'},
  {value:'ADC',label:'ADC',asset:'assets/roles/display/adc.png'},
  {value:'SUPPORT',label:'SUPPORT',asset:'assets/roles/display/sup.png'}
];
const tierOptions=[
  {value:'IRON',asset:'assets/tiers/iron.png'},{value:'BRONZE',asset:'assets/tiers/bronze.png'},{value:'SILVER',asset:'assets/tiers/silver.png'},
  {value:'GOLD',asset:'assets/tiers/gold.png'},{value:'PLATINUM',asset:'assets/tiers/platinum.png'},{value:'EMERALD',asset:'assets/tiers/emerald.png'},
  {value:'DIAMOND',asset:'assets/tiers/diamond.png'},{value:'MASTER',asset:'assets/tiers/master.png'},{value:'GRANDMASTER',asset:'assets/tiers/grandmaster.png'},
  {value:'CHALLENGER',asset:'assets/tiers/challenger.png'}
];
const tierTheme={IRON:['#7b6d73','#b6a8ae','#3b3337'],BRONZE:['#a66a43','#d29a73','#5c3424'],SILVER:['#9eb2c6','#dce8f1','#4a5b6c'],GOLD:['#d1a840','#ffe08a','#76520e'],PLATINUM:['#43aebe','#a6edf2','#1f5f66'],EMERALD:['#2fc484','#9cf3c8','#155f42'],DIAMOND:['#649cff','#c0d7ff','#2f4f98'],MASTER:['#a855f7','#dec1ff','#4c1d95'],GRANDMASTER:['#df5267','#ffb3bf','#7d1e2d'],CHALLENGER:['#6ecbf8','#d8f4ff','#2b6d8e']};
const fallback={version:'14.24.1',list:[{id:'Nilah',name:'닐라',title:'해방된 기쁨',tags:['Fighter','Assassin']},{id:'Caitlyn',name:'케이틀린',title:'필트오버의 보안관',tags:['Marksman']},{id:'Velkoz',name:'벨코즈',title:'공허의 눈',tags:['Mage']},{id:'Samira',name:'사미라',title:'사막의 장미',tags:['Marksman']},{id:'Kaisa',name:'카이사',title:'공허의 딸',tags:['Marksman']},{id:'Jinx',name:'징크스',title:'난폭한 말괄량이',tags:['Marksman']},{id:'Ahri',name:'아리',title:'구미호',tags:['Mage','Assassin']}]};
const $=id=>document.getElementById(id); const els={nickname:$('nickname'),serverTag:$('serverTag'),birth:$('birth'),gender:$('gender'),introText:$('introText'),introCount:$('introCount'),mainRole:$('mainRole'),subRole:$('subRole'),tier:$('tier'),most1:$('most1'),most2:$('most2'),most3:$('most3'),tagInput:$('tagInput'),tagInputWrap:$('tagInputWrap'),clearTags:$('clearTags'),characterUpload:$('characterUpload'),clearCharacterBtn:$('clearCharacterBtn'),aiGenerateBtn:$('aiGenerateBtn'),aiStatus:$('aiStatus'),downloadBtn:$('downloadBtn'),resetBtn:$('resetBtn'),card:$('profileCard'),viewport:$('cardViewport'),characterImage:$('characterImage'),profileIcon:$('profileIcon'),cardNickname:$('cardNickname'),cardTag:$('cardTag'),cardBirth:$('cardBirth'),cardGender:$('cardGender'),cardIntro:$('cardIntro'),mainRoleIcon:$('mainRoleIcon'),subRoleIcon:$('subRoleIcon'),mainRoleText:$('mainRoleText'),subRoleText:$('subRoleText'),tierIcon:$('tierIcon'),tierText:$('tierText'),most1Icon:$('most1Icon'),most2Icon:$('most2Icon'),most3Icon:$('most3Icon'),most1Name:$('most1Name'),most2Name:$('most2Name'),most3Name:$('most3Name'),cardTags:$('cardTags')};

const apiBase = (window.WOOJU_CONFIG?.apiBaseUrl || 'https://wooju-ai.onrender.com').replace(/\/$/, '');
function apiUrl(path){
  if (apiBase) return `${apiBase}${path}`;
  return path;
}

let state={tags:['즐겜','디코가능','일반','친목','솔랭'],uploadedCharacter:null,championVersion:fallback.version,champions:[]};
function fill(select,items,selected){select.innerHTML='';items.forEach(i=>{const o=document.createElement('option');o.value=i.value||i.id;o.textContent=i.label||i.name||i.value;if(o.value===selected)o.selected=true;select.appendChild(o)})}
function champ(id){return state.champions.find(c=>c.id===id)||fallback.list.find(c=>c.id===id)||fallback.list[0]}
function champIcon(id){return `https://ddragon.leagueoflegends.com/cdn/${state.championVersion}/img/champion/${id}.png`}
function splash(id){return `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${id}_0.jpg`}
function roleAsset(v){return roleOptions.find(r=>r.value===v)?.asset||roleOptions[0].asset} function tierAsset(v){return tierOptions.find(t=>t.value===v)?.asset||tierOptions[0].asset}
function collect(){return{nickname:els.nickname.value.trim()||'이 궤',serverTag:els.serverTag.value.trim()||'#에이엑',birth:els.birth.value.trim()||'2000',gender:els.gender.value,introText:els.introText.value.trim()||'같이 재밌게 게임해요',mainRole:els.mainRole.value,subRole:els.subRole.value,tier:els.tier.value,most1:els.most1.value,most2:els.most2.value,most3:els.most3.value,tags:state.tags,uploadedCharacter:state.uploadedCharacter}}
function save(){try{const d=collect();d.uploadedCharacter=null;localStorage.setItem('wooju-card-v7',JSON.stringify(d))}catch(e){console.warn('Profile save skipped:',e)}} function load(){try{return JSON.parse(localStorage.getItem('wooju-card-v7'))}catch{return null}}
function apply(d){if(!d)return;['nickname','serverTag','birth','introText'].forEach(k=>{if(d[k])els[k].value=d[k]});if(d.gender)els.gender.value=d.gender;if(d.mainRole)els.mainRole.value=d.mainRole;if(d.subRole)els.subRole.value=d.subRole;if(d.tier)els.tier.value=d.tier;if(d.most1)els.most1.value=d.most1;if(d.most2)els.most2.value=d.most2;if(d.most3)els.most3.value=d.most3;if(Array.isArray(d.tags))state.tags=d.tags;if(d.uploadedCharacter)state.uploadedCharacter=d.uploadedCharacter}
function renderTags(){els.tagInputWrap.querySelectorAll('.tag-pill').forEach(e=>e.remove());state.tags.forEach((t,i)=>{const s=document.createElement('span');s.className='tag-pill';s.innerHTML=`#${t}<button type="button">×</button>`;s.querySelector('button').onclick=()=>{state.tags.splice(i,1);renderTags();update()};els.tagInputWrap.insertBefore(s,els.tagInput)});els.cardTags.innerHTML='';state.tags.slice(0,5).forEach(t=>{const s=document.createElement('span');s.textContent=`#${t}`;els.cardTags.appendChild(s)})}
function addTag(v){const t=v.replace(/^#/,'').trim();if(!t||state.tags.includes(t)||state.tags.length>=8)return;state.tags.push(t);renderTags();update()}
function update(){const d=collect();els.cardNickname.textContent=d.nickname;els.cardTag.textContent=d.serverTag;els.cardBirth.textContent=d.birth;els.cardGender.textContent=d.gender;els.cardIntro.textContent=d.introText;els.introCount.textContent=d.introText.length;els.mainRoleText.textContent=d.mainRole;els.subRoleText.textContent=d.subRole;els.mainRoleIcon.src=roleAsset(d.mainRole);els.subRoleIcon.src=roleAsset(d.subRole);els.tierText.textContent=d.tier;els.tierIcon.src=tierAsset(d.tier);const th=tierTheme[d.tier]||tierTheme.MASTER;document.documentElement.style.setProperty('--tier',th[0]);document.documentElement.style.setProperty('--tier-light',th[1]);document.documentElement.style.setProperty('--tier-dark',th[2]);document.documentElement.style.setProperty('--tier-glow',`${th[0]}70`);const c1=champ(d.most1),c2=champ(d.most2),c3=champ(d.most3);els.profileIcon.src=champIcon(c1.id);els.most1Icon.src=champIcon(c1.id);els.most2Icon.src=champIcon(c2.id);els.most3Icon.src=champIcon(c3.id);els.most1Name.textContent=c1.name;els.most2Name.textContent=c2.name;els.most3Name.textContent=c3.name;els.characterImage.src=state.uploadedCharacter||splash(c1.id);renderTags();save()}
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

    `PLAYER CONTEXT: main role ${d.mainRole}; tier ${d.tier}. These may affect only subtle prestige/intensity. They must never override the champion's canonical identity or signature visual language.`,

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

async function exportCardPNG(){
  const b=els.downloadBtn;
  const oldText=b.textContent;
  b.disabled=true;
  b.textContent='PNG 만드는 중...';
  try{
    if(document.fonts?.ready) await document.fonts.ready;
    await waitForCardImages(els.card);

    // IMPORTANT: never resize the live preview. Only the cloned DOM used by
    // html2canvas is reset to its native 1080x1080 export size.
    const cv=await html2canvas(els.card,{
      scale:1,
      backgroundColor:'#07101e',
      useCORS:true,
      allowTaint:false,
      logging:false,
      imageTimeout:20000,
      width:1080,
      height:1080,
      windowWidth:1080,
      windowHeight:1080,
      onclone:(doc)=>{
        const card=doc.getElementById('profileCard');
        if(card){
          card.style.transform='none';
          card.style.transformOrigin='0 0';
          card.style.left='0';
          card.style.top='0';
          card.style.width='1080px';
          card.style.height='1080px';
        }
        const viewport=doc.getElementById('cardViewport');
        if(viewport){
          viewport.style.width='1080px';
          viewport.style.height='1080px';
          viewport.style.overflow='visible';
        }
      }
    });

    const blob=await new Promise((resolve,reject)=>{
      cv.toBlob(v=>v?resolve(v):reject(new Error('PNG 변환에 실패했습니다.')),'image/png');
    });
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');
    a.href=url;
    a.download=`${(els.nickname.value||'wooju').replace(/\s+/g,'_')}_WOOJU.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1500);
  }catch(err){
    console.error('PNG export failed:',err);
    alert(`PNG 저장 실패: ${err?.message||'알 수 없는 오류'}\n\n새로고침하지 말고 이 문구를 알려주세요.`);
  }finally{
    b.disabled=false;
    b.textContent=oldText;
    // Live preview is never modified, but re-apply its correct scale just in case.
    scaleCard();
  }
}

function setup(){
  [els.nickname,els.serverTag,els.birth,els.gender,els.introText,els.mainRole,els.subRole,els.tier,els.most1,els.most2,els.most3].forEach(e=>{e.addEventListener('input',update);e.addEventListener('change',update)});
  els.tagInput.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===','){e.preventDefault();addTag(els.tagInput.value);els.tagInput.value=''}});
  document.querySelectorAll('.quick-tags button').forEach(b=>b.onclick=()=>addTag(b.dataset.tag));
  els.clearTags.onclick=()=>{state.tags=[];renderTags();update()};
  els.characterUpload.onchange=e=>{const f=e.target.files?.[0];if(!f)return;const rd=new FileReader();rd.onload=()=>{state.uploadedCharacter=rd.result;update()};rd.readAsDataURL(f)};
  els.clearCharacterBtn.onclick=()=>{state.uploadedCharacter=null;els.characterUpload.value='';update()};
  els.aiGenerateBtn.onclick=generateAI;
  els.resetBtn.onclick=()=>{localStorage.removeItem('wooju-card-v7');location.reload()};
  els.downloadBtn.onclick=exportCardPNG;

  // Ensure external Riot images are requested in CORS-safe mode for export.
  [els.characterImage,els.profileIcon,els.most1Icon,els.most2Icon,els.most3Icon].forEach(img=>{img.crossOrigin='anonymous'});

  new ResizeObserver(scaleCard).observe(els.viewport);
  window.addEventListener('resize',scaleCard);
}
async function loadChamps(){try{const vr=await fetch('https://ddragon.leagueoflegends.com/api/versions.json'),vs=await vr.json();state.championVersion=vs[0]||fallback.version;const cr=await fetch(`https://ddragon.leagueoflegends.com/cdn/${state.championVersion}/data/ko_KR/champion.json`),p=await cr.json();state.champions=Object.values(p.data).map(c=>({id:c.id,name:c.name,title:c.title||'',blurb:c.blurb||'',tags:c.tags||[],partype:c.partype||''})).sort((a,b)=>a.name.localeCompare(b.name,'ko'))}catch{state.champions=fallback.list;state.championVersion=fallback.version}const items=state.champions.map(c=>({value:c.id,label:c.name,id:c.id,name:c.name}));fill(els.most1,items,'Nilah');fill(els.most2,items,'Caitlyn');fill(els.most3,items,'Velkoz')}
async function init(){fill(els.mainRole,roleOptions,'ADC');fill(els.subRole,roleOptions,'MID');fill(els.tier,tierOptions,'MASTER');await loadChamps();apply(load());setup();update();scaleCard()} init();
