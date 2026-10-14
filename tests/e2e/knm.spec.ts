import { expect, test, type Page } from "@playwright/test";
import lessons from "../../src/data/knm/lessons.json";
import bank from "../../src/data/knm/questions.json";
import curriculum from "../../src/data/knm/curriculum.json";
import { buildKnmExam } from "../../src/lib/knm/scoring";
import type { KnmQuestion } from "../../src/lib/knm/types";
const key="dutchflow-knm-progress-v1", origin="http://127.0.0.1:3100";
const first=bank.questions.filter((q)=>q.lessonSlug===lessons[0].slug);
async function answer(page: Page, questions: typeof first, wrongFirst=false) {
  for(const [i,q] of questions.entries()) {
    await page.getByRole("navigation",{name:"التنقل بين أسئلة KNM"}).getByRole("button",{name:new RegExp(`^السؤال ${i+1}،`)}).click();
    await page.locator('.knm-question input[type="radio"]').nth(wrongFirst&&i===0?(q.correctIndex+1)%3:q.correctIndex).check();
  }
  await page.getByRole("button",{name:"سلّم المحاولة واعرض النتيجة"}).click();
}
async function signIn(page: Page,email:string) {
  await page.goto('/account');await page.getByLabel('اسمك').fill('متعلّم KNM');await page.getByLabel('البريد الإلكتروني').fill(email);await page.getByRole('button',{name:'أرسل رابط الدخول'}).click();await expect(page.getByRole('status')).toContainText('تحقّق من بريدك');
  let url=''; await expect.poll(async()=>{url=(await(await page.context().request.get(`http://127.0.0.1:3026/?email=${encodeURIComponent(email)}`)).json()).url||'';return Boolean(url);}).toBe(true);
  await page.goto(url);await expect(page.getByRole('heading',{name:'مرحباً، متعلّم KNM'})).toBeVisible();
}
test('KNM discovery, bilingual content, coverage and all routes work without answer-key projection',async({page,request})=>{
  await page.setViewportSize({width:390,height:844});await page.goto('/learn?level=A2');await page.locator('.learning-resources summary').click();await page.getByRole('navigation',{name:'موارد التعلّم A2'}).getByRole('link',{name:/KNM/}).click();
  await expect(page.locator('.knm-lesson-card')).toHaveCount(32);await page.getByLabel('المحور',{exact:true}).selectOption('7');await expect(page.locator('.knm-lesson-card')).toHaveCount(4);
  await page.getByLabel('ابحث في منهج KNM').fill('donor');await expect(page.locator('.knm-lesson-card')).toHaveCount(1);await page.locator('.knm-lesson-card').click();
  await expect(page.locator('.knm-point')).toHaveCount(8);await page.locator('.knm-point details').first().locator('summary').click();await expect(page.locator('.knm-point details').first()).toContainText('الخصوصية');
  for(const width of [320,390,1280]){await page.setViewportSize({width,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);}
  await page.goto('/knm/sources');await expect(page.locator('.knm-objectives li')).toHaveCount(78);
  for(const lesson of lessons)expect((await request.get(`/knm/lessons/${lesson.slug}`)).status()).toBe(200);
  for(const exam of curriculum.exams){const html=await(await request.get(`/knm/exams/${exam.slug}`)).text();expect(html).not.toContain('"correctIndex":');expect(html).not.toContain('"explanation":');}
  expect((await request.get('/knm/lessons/unknown')).status()).toBe(404);expect((await request.get('/knm/exams/unknown')).status()).toBe(404);
});
test('guest lesson mistakes persist, review clears only corrected questions and A1/A2 stay untouched',async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('dutchflow-progress-v1',JSON.stringify({completedLessons:['introductions','a2-yesterday-and-today']})));
  await page.goto(`/knm/lessons/${lessons[0].slug}`);await page.getByRole('button',{name:'ابدأ تدريب الدرس'}).click();await answer(page,first,true);
  await expect(page.locator('.knm-result h2')).toHaveText('نتيجتك: 7 من 8');await expect(page.locator('.knm-result')).toContainText('حُفظ تقدّم التدريب');
  expect((await page.evaluate((k)=>JSON.parse(localStorage.getItem(k)!),key)).wrongQuestionIds).toEqual([first[0].id]);
  await page.getByRole('link',{name:'راجع الأخطاء',exact:true}).click();await page.getByRole('button',{name:'ابدأ مراجعة الأخطاء'}).click();await page.getByRole('button',{name:'ابدأ تدريب الدرس'}).click();await answer(page,[first[0]]);
  await expect(page.locator('.knm-result')).toContainText('حُفظ تقدّم التدريب');expect((await page.evaluate((k)=>JSON.parse(localStorage.getItem(k)!),key)).wrongQuestionIds).toEqual([]);
  await page.goto(`/knm/lessons/${lessons[0].slug}`);await page.getByRole('button',{name:'ابدأ تدريب الدرس'}).click();await answer(page,first);await expect(page.locator('.knm-result')).toContainText('حُفظ تقدّم التدريب');
  await page.goto('/knm/progress');await expect(page.getByRole('heading',{name:'أكملت 1 من 32 تدريب درس'})).toBeVisible();
  await page.goto('/progress');await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow','1');await page.goto('/progress?level=A2');await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow','1');
});
test('timed exam resumes answers and flags, locks on expiry and retries a failed submission',async({page})=>{
  const form=buildKnmExam(bank.questions as KnmQuestion[],0);let fail=true;
  await page.route('**/api/knm/grade',async route=>{if(fail){fail=false;await route.fulfill({status:503,body:'Unavailable'});}else await route.continue();});
  await page.goto('/knm/exams/practice-1');await page.getByRole('button',{name:'ابدأ الامتحان التدريبي'}).click();await page.locator('.knm-question input').nth(form[0].correctIndex).check();await page.getByRole('button',{name:'علّم السؤال للعودة إليه'}).click();
  await expect.poll(async()=>page.evaluate(()=>sessionStorage.getItem('dutchflow-knm-draft-v1:exam:practice-1'))).not.toBeNull();
  await page.reload();await expect(page.locator('.knm-question input').nth(form[0].correctIndex)).toBeChecked();await expect(page.getByRole('button',{name:'أزل علامة المراجعة'})).toBeVisible();
  await page.evaluate(()=>{const k='dutchflow-knm-draft-v1:exam:practice-1';const d=JSON.parse(sessionStorage.getItem(k)!);d.deadline=Date.now()-1000;sessionStorage.setItem(k,JSON.stringify(d));});await page.reload();
  await expect(page.locator('.knm-question input').first()).toBeDisabled();await expect(page.locator('.knm-quiz').getByRole('alert').filter({hasText:'انتهى الوقت'})).toContainText('انتهى الوقت');await page.getByRole('button',{name:'سلّم المحاولة واعرض النتيجة'}).click();await expect(page.locator('.knm-quiz').getByRole('alert').filter({hasText:'تعذّر تصحيح'})).toContainText('تعذّر تصحيح');
  await page.getByRole('button',{name:'سلّم المحاولة واعرض النتيجة'}).click();await expect(page.locator('.knm-result h2')).toHaveText('نتيجتك: 1 من 40');await expect(page.locator('.knm-result')).toContainText('حُفظ تقدّم التدريب');
  expect(await page.evaluate(()=>sessionStorage.getItem('dutchflow-knm-draft-v1:exam:practice-1'))).toBeNull();const state=await page.evaluate((k)=>JSON.parse(localStorage.getItem(k)!),key);expect(state.completedLessons).toEqual([]);expect(state.wrongQuestionIds).toHaveLength(39);
});
test('invalid drafts are discarded; storage save failures report the result and permit an explicit retry',async({page})=>{
  await page.addInitScript(()=>{sessionStorage.setItem('dutchflow-knm-draft-v1:exam:practice-1',JSON.stringify({revision:'old',deadline:Date.now()+10000,answers:{},owner:null}));});
  await page.goto('/knm/exams/practice-1');await expect(page.getByRole('status')).toContainText('مسودة قديمة');await expect(page.getByRole('button',{name:'ابدأ الامتحان التدريبي'})).toBeVisible();
  await page.goto(`/knm/lessons/${lessons[0].slug}`);await page.evaluate(()=>{const original=Storage.prototype.setItem;let fail=true;Storage.prototype.setItem=function(k,v){if(k==='dutchflow-knm-progress-v1'&&fail){fail=false;throw Error('quota');}return original.call(this,k,v);};});
  await page.getByRole('button',{name:'ابدأ تدريب الدرس'}).click();await answer(page,first);await expect(page.locator('.knm-result')).toContainText('لم يُحفظ التقدّم بعد');await page.getByRole('button',{name:'أعد محاولة الحفظ'}).click();await expect(page.locator('.knm-result')).toContainText('حُفظ تقدّم التدريب');
});
test('progress outages leave static content available and never imply zero stored completions',async({page})=>{
  let fail=true;await page.route('**/api/knm/progress',async route=>{if(fail)await route.fulfill({status:503,body:'Unavailable'});else await route.continue();});
  await page.goto('/knm');await expect(page.locator('.knm-next')).toContainText('تعذّر تحميل');await expect(page.locator('.knm-next')).not.toContainText('أكملت 0');await expect(page.locator('.knm-lesson-card')).toHaveCount(32);fail=false;await page.getByRole('button',{name:'أعد تحميل تقدّم KNM'}).click();await expect(page.locator('.knm-next')).toContainText('أكملت 0 من 32');
});
test('server rejects forged, stale, oversized and unknown review submissions',async({request})=>{
  const base={revision:curriculum.revision,mode:'lesson',key:lessons[0].slug,answers:{[first[0].id]:first[0].correctIndex}};
  const post=(body:unknown)=>request.post('/api/knm/grade',{data:body});
  expect((await post({...base,score:8})).status()).toBe(400);expect((await post({...base,revision:'old'})).status()).toBe(409);expect((await post({...base,answers:{unknown:0}})).status()).toBe(400);expect((await post({...base,answers:{[first[0].id]:3}})).status()).toBe(400);
  expect((await post({...base,questionIds:[first[0].id]})).status()).toBe(400);expect((await post({...base,key:'missing'})).status()).toBe(400);expect((await request.post('/api/knm/grade',{data:{...base,padding:'x'.repeat(18000)}})).status()).toBe(413);
  expect((await request.get('/api/knm/review?ids=unknown')).status()).toBe(400);
  const review=await(await request.get(`/api/knm/review?ids=${first[0].id}`)).json();expect(review.questions[0]).not.toHaveProperty('correctIndex');expect(review.questions[0]).not.toHaveProperty('explanation');
});
test('KNM account progress is separately persisted, synchronized, isolated and origin/session guarded',async({page,browser})=>{
  await page.context().setExtraHTTPHeaders({'x-real-ip':'192.0.2.224'});
  await page.addInitScript((k)=>localStorage.setItem(k,JSON.stringify({version:1,completedLessons:['finding-work'],wrongQuestionIds:[]})),key);
  await signIn(page,'knm-owner@example.test');await page.goto('/knm/progress');await expect(page.getByRole('heading',{name:'أكملت 0 من 32 تدريب درس'})).toBeVisible();
  const user=(await(await page.request.get('/api/progress')).json()).user.id;
  const submission={revision:curriculum.revision,mode:'lesson',key:lessons[0].slug,answers:Object.fromEntries(first.map(q=>[q.id,q.correctIndex])),expectedUserId:user};
  expect((await page.request.post('/api/knm/progress',{headers:{Origin:'https://untrusted.test'},data:submission})).status()).toBe(403);
  expect((await page.request.post('/api/knm/progress',{headers:{Origin:origin},data:{...submission,expectedUserId:'other'}})).status()).toBe(409);
  expect((await page.request.post('/api/knm/progress',{headers:{Origin:origin},data:{...submission,completedLessons:['fake']}})).status()).toBe(400);
  expect((await page.request.post('/api/knm/progress',{headers:{Origin:origin},data:submission})).status()).toBe(200);
  const wrong={...submission,answers:{...submission.answers,[first[0].id]:(first[0].correctIndex+1)%3}};
  expect((await page.request.post('/api/knm/progress',{headers:{Origin:origin},data:wrong})).status()).toBe(200);
  const persisted=await(await page.request.get('/api/knm/progress')).json();expect(persisted.completedLessons).toEqual([lessons[0].slug]);expect(persisted.wrongQuestionIds).toEqual([first[0].id]);
  expect((await page.request.post('/api/knm/progress',{headers:{Origin:origin},data:submission})).status()).toBe(200);
  expect((await(await page.request.get('/api/knm/progress')).json()).wrongQuestionIds).toEqual([]);
  await page.reload();await expect(page.getByRole('heading',{name:'أكملت 1 من 32 تدريب درس'})).toBeVisible();
  const second=await browser.newContext({baseURL:origin,extraHTTPHeaders:{'x-real-ip':'192.0.2.225'}});const other=await second.newPage();await signIn(other,'knm-owner@example.test');await other.goto('/knm/progress');await expect(other.getByRole('heading',{name:'أكملت 1 من 32 تدريب درس'})).toBeVisible();expect(await other.evaluate((k)=>localStorage.getItem(k),key)).toBeNull();
  const third=await browser.newContext({baseURL:origin,extraHTTPHeaders:{'x-real-ip':'192.0.2.226'}});const isolated=await third.newPage();await signIn(isolated,'knm-other@example.test');await isolated.goto('/knm/progress');await expect(isolated.getByRole('heading',{name:'أكملت 0 من 32 تدريب درس'})).toBeVisible();
  expect((await(await page.request.get('/api/progress')).json()).completedLessons).toEqual([]);await second.close();await third.close();
});

test('keyboard missing-answer focus and Arabic assistance preserve the current question choice',async({page})=>{
  await page.goto(`/knm/lessons/${lessons[0].slug}`);await page.getByRole('button',{name:'ابدأ تدريب الدرس'}).click();await page.getByRole('button',{name:'سلّم المحاولة واعرض النتيجة'}).click();
  await expect(page.locator('.knm-question h2')).toBeFocused();await page.locator('.knm-question input').nth(first[0].correctIndex).check();await page.locator('.knm-question details summary').click();await expect(page.locator('.knm-question details')).toContainText(first[0].prompt.ar);
  await answer(page,first);await expect(page.locator('.knm-result')).toContainText('استُخدمت المساعدة العربية في 1');
});
test('a graded attempt can recover an unavailable identity/progress read before saving',async({page})=>{
  let fail=true;await page.route('**/api/progress',async route=>{if(fail)await route.fulfill({status:503,body:'Unavailable'});else await route.continue();});
  await page.goto(`/knm/lessons/${lessons[0].slug}`);await page.getByRole('button',{name:'ابدأ تدريب الدرس'}).click();await answer(page,first);
  await expect(page.locator('.knm-result')).toContainText('لم يُحفظ التقدّم بعد');await expect(page.getByRole('button',{name:'أعد محاولة الحفظ'})).toBeDisabled();
  fail=false;await page.getByRole('button',{name:'أعد تحميل تقدّم KNM'}).click();await expect(page.getByRole('button',{name:'أعد محاولة الحفظ'})).toBeEnabled();await page.getByRole('button',{name:'أعد محاولة الحفظ'}).click();await expect(page.locator('.knm-result')).toContainText('حُفظ تقدّم التدريب');
});
test('pending account persistence never announces a successful save before acknowledgement',async({page})=>{
  let release!:()=>void;const pending=new Promise<void>(resolve=>{release=resolve;});const user={id:'knm-pending-user',name:'Learner',email:'pending@example.test'};
  await page.route('**/api/progress',route=>route.fulfill({json:{enabled:true,user,completedLessons:[]}}));
  await page.route('**/api/knm/progress',async route=>{if(route.request().method()==='POST'){await pending;await route.fulfill({json:{userId:user.id,completedLessons:[lessons[0].slug],wrongQuestionIds:[]}});}else await route.fulfill({json:{userId:user.id,completedLessons:[],wrongQuestionIds:[]}});});
  await page.goto('/knm');await expect(page.locator('.knm-next')).toContainText('أكملت 0 من 32');await page.getByRole('link',{name:'تابع هذا الدرس'}).click();
  await page.getByRole('button',{name:'ابدأ تدريب الدرس'}).click();await answer(page,first);
  try {await expect(page.locator('.knm-result').getByRole('status')).toHaveText('جارٍ حفظ تقدّم KNM…');await expect(page.locator('.knm-result')).not.toContainText('حُفظ تقدّم التدريب');}finally{release();}
  await expect(page.locator('.knm-result')).toContainText('حُفظ تقدّم التدريب');
});

test('authored visual questions stay accessible on mobile, in timed practice and mistake feedback', async ({ page, request }) => {
  const visualQuestions = bank.questions.filter((q) => 'visual' in q);
  for (const q of visualQuestions) {
    await page.goto(`/knm/lessons/${q.lessonSlug}`);
    await page.getByRole('button', { name: 'ابدأ تدريب الدرس' }).click();
    const group = bank.questions.filter((item) => item.lessonSlug === q.lessonSlug);
    const index = group.findIndex((item) => item.id === q.id);
    await page.locator('.knm-question-nav button').nth(index).click();
    await expect(page.getByRole('figure', { name: q.visual!.description.nl })).toBeVisible();
    await expect(page.locator('.knm-scene')).toContainText(q.visual!.title);
    for (const width of [320, 390, 1280]) {
      await page.setViewportSize({ width, height: 844 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
    await page.locator('.knm-question details summary').click();
    await expect(page.locator('.knm-question details')).toContainText(q.visual!.description.ar);
  }
  const q = visualQuestions[0];
  const response = await request.get(`/api/knm/review?ids=${q.id}`);
  const payload = await response.json();
  expect(JSON.stringify(payload)).toContain(q.visual!.title);
  expect(JSON.stringify(payload)).not.toContain('correctIndex');
  await page.goto(`/knm/lessons/${lessons[0].slug}`);
  await page.getByRole('button', { name: 'ابدأ تدريب الدرس' }).click();
  await answer(page, first, true);
  await page.getByLabel('عرض التصحيح').selectOption('mistakes');
  await expect(page.locator('.knm-feedback')).toHaveCount(1);
  await expect(page.locator('.knm-score-grid')).toContainText(curriculum.themes[0].title.ar);
  await page.getByLabel('عرض التصحيح').selectOption('all');
  await expect(page.locator('.knm-feedback')).toHaveCount(first.length);
  await expect(page.locator('.knm-feedback .knm-scene')).toHaveCount(1);
  await page.goto('/knm/exams/practice-1');
  await page.getByRole('button', { name: 'ابدأ الامتحان التدريبي' }).click();
  const visualIndex = buildKnmExam(bank.questions as KnmQuestion[], 0).findIndex((item) => item.visual);
  await page.locator('.knm-question-nav button').nth(visualIndex).click();
  await expect(page.locator('.knm-scene')).toBeVisible();
  await expect(page.locator('.knm-question details')).toHaveCount(0);
});
