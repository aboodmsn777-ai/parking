# كيف تضيف شذوذًا جديدًا

كل شذوذ ملف واحد داخل `src/anomalies/list/`. أي ملف تضعه هناك يُلتقط تلقائيًا:
يدخل في الاختيار العشوائي، ويظهر في قائمة «الشذوذات المكتشفة»، ويُحسب في النهاية السرية. لا تعديل في أي مكان آخر.

## القالب

```js
// src/anomalies/list/my-anomaly.js
export default {
  id: 'my-anomaly',            // فريد، وهو نفسه مفتاح الحفظ
  tier: 'medium',              // easy | medium | hard | horror  (horror يظهر فقط بعد العتبة 4)
  name: { ar: 'اسم يظهر في القائمة', en: 'Name shown in the list' },

  enable(ctx)  { /* غيّر شيئًا في الممر */ },
  disable(ctx) { /* أرجِع كل شيء كما كان — إلزامي */ },
  update(ctx, dt) { /* اختياري: يُستدعى كل إطار ما دام الشذوذ فعّالًا */ },
};
```

## ما الذي يوفره `ctx`

| الحقل | الوصف |
|---|---|
| `ctx.world.props` | كل الأغراض: `bin`, `vending`, `clock`, `cctv`, `door`, `extraDoor`, `coast`, `eyes`, `board`, `exitSign`, `puddle`, `hands`, `shadow`, `bench2`, `reflection` |
| `ctx.world.hallLights` | مصابيح الممر الثمانية. لكل واحد `mul` (شدة 0–1) و`color` و`z`. لا تلمس الأول `[0]` لأنه يُرى من نقطة الانتقال |
| `ctx.world.bays`, `ctx.world.strips`, `ctx.world.mats` | مقاطع الجدران، الشريط الأصفر، الخامات |
| `ctx.world.root` | أضف إليه مجسماتك الخاصة (`makeFigure()` من `world/figure.js` يصنع شخصًا) |
| `ctx.player` | `pos`, `yaw`, `speed` |
| `ctx.audio.play(id, { pos, vol, loop })` | صوت مكاني. `id` من ملفات `public/audio` أو من `core/synth.js` |
| `ctx.t` | الثواني منذ تفعيل الشذوذ |
| `ctx.data` | مكان حرّ لحالة الشذوذ (يُصفَّر كل دورة) |
| `ctx.caught('why')` | للشذوذات المرعبة: يمسك اللاعب ويعيده للعتبة 0 |
| `ctx.threshold` | رقم العتبة الحالي |

## قواعد

1. `disable` يجب أن يعيد الحالة تمامًا؛ الممر «الطبيعي» هو المرجع الذي يحفظه اللاعب.
2. لا تغيّر شيئًا في أول 6 أمتار من الممر (z أكبر من ‎-6) ولا في المنعطفات: هذه المنطقة تُرى لحظة الانتقال الخفي فيظهر التغيير كقفزة.
3. إذا حرّكت مجسمًا يلقي ظلًّا أثناء اللعب ضع `ctx.world.dynamicShadows = true` في `enable` وأعده `false` في `disable`.
4. الإضاءة تُعاد تلقائيًا (`resetLights`) عند كل دورة.

## تجربة شذوذك مباشرة

شغّل `npm run dev` وافتح `http://127.0.0.1:5188/?debug` ثم في الكونسول بعد بدء اللعب:

```js
__t.director.force('my-anomaly')   // فعّله الآن
__t.director.force(null)           // ارجع للطبيعي
```

## استبدال الأصوات

ضع ملف `mp3` باسم المعرّف (مثل `step1.mp3`, `amb_hum.mp3`) في `public/audio/` وأضف اسمه إلى
`public/audio/manifest.json` → `{"files":["step1.mp3"]}`. أي معرّف غير موجود في القائمة يُولَّد بالكود تلقائيًا.

## أوامر

```bash
npm install
```
```bash
npm run dev
```
```bash
npm run build
```

ناتج `npm run build` في مجلد `dist/` ملفات ثابتة بمسارات نسبية، جاهزة للرفع على أي استضافة أو متجر ألعاب ويب (ارفع محتوى `dist` كما هو أو كملف zip).
