---
title: الدليل الاستعراضي الشامل ومختبر إمكانات MDFull
author: الفريق الهندسي لتطوير محطات التوثيق
date: 2026-11-08
version: 1.0.0
tags: [Markdown, MathJax, KaTeX, Mermaid, RTL, BiDi, Benchmark]
status: معتمد للإنتاج والعروض الترويجية
---

# محطة MDFull: المختبر التقني والاستعراضي الشامل 🚀

مرحباً بك في الوثيقة المرجعية الشاملة المصممة لاختبار واستعراض **كافة إمكانات لغة التوصيف الماركداون (Markdown)** دون أي استثناء. تجمع هذه الوثيقة بين **النصوص ثنائية الاتجاه (العربية والإنجليزية)**، و**المعادلات الرياضية والكيميائية المتقدمة**، و**المخططات البيانية التفاعلية الكاملة**، و**الجداول المعيارية**، و**التنبيهات الرسمية**.

> [!TIP]
> **نصيحة للعروض التقديمية:** يمكنك تحويل هذا المستند فوراً إلى **عرض شرائح تفاعلي (Executive Slide Deck)** بمجرد النقر على زر **"عرض شرائح"** في الشريط العلوي، أو بالضغط على اختصار لوحة المفاتيح <kbd>Ctrl</kbd> + <kbd>P</kbd>.

---

## 1. التناغم الذكي بين اللغتين العربية والإنجليزية في مستند واحد (Bilingual Coexistence & BiDi Showcase) 🌐

تتميز محطة **MDFull** بقدرة استثنائية على إدارة المستندات التقنية الهجينة التي تحتوي على نصوص عربية وأجنبية جنباً إلى جنب، مع منح كل لغة خصائصها الطبيعية الكاملة (الاتجاه، الخط، المحاذاة، وعزل علامات الترقيم):

### أ. انسيابية اللغة العربية مع عزل الأكواد اللاتينية المضمنة (Arabic RTL with Inline LTR Code):
عند قراءة توثيق تقني باللغة العربية، كثيراً ما تتداخل أوامر برمجية مثل `git checkout -b feature/auth-system` أو دوال مثل `documentStore.openTab(fileName, filePath, fileContent)` داخل سياق الجملة. في المحررات التقليدية، تنقلب الأقواس وتنتقل النقطة الختامية لبداية السطر مسببة تشوهاً بصرياً حاداً.

هنا، يضمن محرك **BiDi Arbitrator** بقاء الفقرة من اليمين لليسار، مع استقرار الترقيم في مكانه الطبيعي تماماً:
* عند استدعاء الدالة `authProvider.verifySession({ token: "Bearer eyJhbGci...", timeoutMs: 5000 })`، يعيد الخادم كائن `Promise<UserSession>` مباشرة.
* مسار الملف في نظام التشغيل هو `C:\Users\Engineering\Workspace\MDFull\src\main.tsx` وتتم قراءته بسلاسة دون ارتباك الفواصل المائلة.
* المتغيرات البيئية مثل `VITE_API_ENDPOINT="https://api.enterprise.sa/v1"` تظهر بدقة هندسية متناهية.

> [!NOTE]
> يقوم النظام بعزل كل مصطلح لاتيني أو كود مضمن تلقائياً داخل وسم `<bdi dir="ltr">`؛ مما يمنع انتقال التأثير الاتجاهي للحروف اللاتينية إلى الكلمات العربية المحيطة بها.

---

### B. Autonomous English Technical Section (Pure LTR Block Flow):
The reader automatically recognizes paragraphs and sections predominantly written in Latin scripts, seamlessly rendering them with native Left-to-Right (LTR) alignment, standard Western typography, and appropriate margin hierarchies:

#### Architectural Overview & High-Throughput Processing Pipeline:
The document station incorporates a modular zero-copy streaming parser capable of tokenizing complex CommonMark structures, nested mathematical environments, and interactive vector diagrams. 

Key architectural components include:
1. **Bi-Directional Lexer:** Analyzes script density per block to determine whether an element should flow `rtl` or `ltr`.
2. **KaTeX Accelerator:** Pre-renders complex mathematical notation with zero Layout Shift (CLS = 0.00).
3. **SVG Vector Styler:** Post-processes Mermaid canvases into clean enterprise architectures with dynamic lighting and anti-collision staggering.

```json
{
  "system": "MDFull",
  "engine": "AST-Unified-Stream",
  "bilingualSupport": {
    "arabicRTL": true,
    "englishLTR": true,
    "inlineCodeIsolation": "BDI-Enforced",
    "punctuationLock": "Active"
  },
  "performance": {
    "renderTimeMs": 1.4,
    "memoryFootprintMb": 38.2
  }
}
```

> [!TIP]
> Notice how the blockquote above naturally aligns to the left with its border on the left side, matching English editorial standards, while the Arabic blockquotes throughout this document align to the right!

---

### ج. جدول المقارنة الثنائي بين اللغات (Bilingual Feature Matrix):

| الخاصية التقنية (Feature) | المعالجة التقليدية (Standard Editors) | معالجة MDFull الذكية |
| :--- | :--- | :--- |
| **Arabic Block Flow** | Mixed RTL/LTR confusion with broken commas | **Native RTL with Readex Pro Arabic** |
| **English Technical Sections** | Forced into right-alignment awkwardly | **Clean Autonomous LTR Alignment** |
| **Inline Code Tokens** | Brackets & semicolons invert `() {} ;` | **Strict `<bdi>` Isolation with Locked Punctuation** |
| **Mixed Path Strings** | Slashes invert `C:\folder\file.md` | **Immutable LTR Geometry** |
| **Dual-Language Outlines** | Numbers appear on the wrong side | **Direction-Adaptive Hierarchical TOC** |

---

> [!NOTE]
> **ملاحظة تشغيلية:** يدعم النظام التخزين المؤقت الداخلي للمستندات لضمان التبديل الفوري بين التبويبات بدون أي تأخير.

> [!TIP]
> **نصيحة للأداء:** احرص على استخدام المتغيرات المحلية داخل الدوال لتفادي حجز الذاكرة غير الضروري.

> [!IMPORTANT]
> **شرط إلزامي:** يجب ألا يتجاوز أي ملف مصدري في المشروع 400 سطر لضمان قابلية الصيانة والمعيارية الصارمة.

> [!WARNING]
> **تحذير أمني:** لا تقم بتخزين مفاتيح الـ API أو أسرار الاعتماد المشفرة داخل ملفات الماركداون العامة.

> [!CAUTION]
> **تنبيه خطر:** حذف مجلد `.git` أو تنفيذ أمر `rm -rf /` يؤدي لفقدان دائم للبيانات دون إمكانية للاسترجاع.

---

## 2. الموسوعة الرياضية والعلمية الشاملة ($\LaTeX$ / KaTeX Showcase) 📐

يدعم القارئ تصيير المعادلات الرياضية والفيزيائية والكيميائية بدقة بصرية فائقة sub-millisecond مع دعم الرموز المضمنة والمنفصلة:

### أ. المعادلات الرياضية المضمنة (Inline Math):
* معادلة تكافؤ الكتلة والطاقة لأينشتاين: $E = mc^2$
* نظرية فيثاغورس للمثلثات القائمة: $a^2 + b^2 = c^2$
* الانحراف المعياري للإحصاء الوصفي: $\sigma = \sqrt{\frac{1}{N}\sum_{i=1}^N (x_i - \mu)^2}$
* صيغة أويلر الشهيرة: $e^{i\pi} + 1 = 0$

### ب. المعادلات التفاضلية وحساب التكامل (Calculus & Integrals):
تكامل فورييه ثنائي الاتجاه للتحليل الطيفي للإشارات:

$$
\hat{f}(\xi) = \int_{-\infty}^{\infty} f(x)\,e^{-2\pi i x \xi}\,dx
$$

قانون غاوس الكهرومغناطيسي ضمن معادلات ماكسويل التفاضلية:

$$
\nabla \cdot \mathbf{E} = \frac{\rho}{\varepsilon_0}, \quad \nabla \times \mathbf{B} = \mu_0 \left(\mathbf{J} + \varepsilon_0 \frac{\partial \mathbf{E}}{\partial t}\right)
$$

معادلة شرودنغر الموجية لميكانيكا الكم:

$$
i\hbar \frac{\partial}{\partial t} \Psi(\mathbf{r}, t) = \left[ -\frac{\hbar^2}{2m} \nabla^2 + V(\mathbf{r}, t) \right] \Psi(\mathbf{r}, t)
$$

### ج. الجبر الخطي والمصفوفات المعقدة (Linear Algebra & Matrices):
مصفوفة دوران هندسية وحساب المحددات الذاتية:

$$
\mathbf{R}(\theta) = \begin{pmatrix}
\cos\theta & -\sin\theta & 0 \\
\sin\theta & \cos\theta & 0 \\
0 & 0 & 1
\end{pmatrix}, \quad \det(\mathbf{A} - \lambda \mathbf{I}) = 0
$$

### د. المعادلات الكيميائية الحيوية (Biochemical & Stoichiometry):
معادلة البناء الضوئي الخلوي باستخدام تدوين `mhchem`:

$$
\ce{6CO2 + 6H2O ->[ضوء الشمس][كلوروفيل] C6H12O6 + 6O2}
$$

تفاعل أكسدة واختزال أيوني:

$$
\ce{2MnO4- + 5H2O2 + 6H+ -> 2Mn^2+ + 5O2 ^ + 8H2O}
$$

### هـ. المتغيرات الفيزيائية المكتوبة باللغة العربية:
يدعم المحرك تسمية المتغيرات العربية الصريحة داخل المعادلات دون أي خطأ في التصيير:

$$
\text{طاقة الحركة} = \frac{1}{2} \times \text{الكتلة} \times (\text{السرعة})^2
$$

$$
\text{القوة} = \text{الكتلة} \times \text{التسارع}
$$

---

## 3. استوديو المخططات التفاعلي الشامل (Mermaid Studio Spectrum) 📊

يدعم البرنامج كافة أنواع مخططات `Mermaid` مع إمكانية التكبير ($+$)، التصغير ($-$)، إعادة الضبط ($↺$)، وحفظ المخطط كصورة `SVG` متجهة.

### أ. مخطط التدفق واتخاذ القرار (Flowchart with Arabic Nodes):
```mermaid
flowchart TD
    Start(["🚀 بدء تشغيل التطبيق"]) --> LoadConfig["قراءة ملف الإعدادات"]
    LoadConfig --> CheckTheme{"ما هو الثيم المفضل؟"}
    CheckTheme -->|"داكن"| DarkTheme["تفعيل Dark Mode"]
    CheckTheme -->|"فاتح"| LightTheme["تفعيل Light Mode"]
    CheckTheme -->|"طرفية"| TermTheme["تفعيل Terminal Mode"]
    DarkTheme --> RenderEngine["محرك التصيير AST"]
    LightTheme --> RenderEngine
    TermTheme --> RenderEngine
    RenderEngine --> DisplaySuccess(["✅ عرض الواجهة التفاعلية"])
```

### ب. مخطط التعاقب الزمني للعمليات (Sequence Diagram):
يوضح دورة مصادقة الـ OAuth2 وتبادل الرموز المميزة:

```mermaid
sequenceDiagram
    autonumber
    actor User as المستخدم (Client)
    participant UI as واجهة التطبيق (UI)
    participant Auth as خادم الهوية (Auth0)
    participant API as واجهة البرمجة (Backend)

    User->>UI: طلب تسجيل الدخول
    UI->>Auth: إعادة التوجيه لصفحة التحقق
    Auth-->>User: إظهار نموذج المصادقة الثنائية (MFA)
    User->>Auth: إدخال رمز التحقق
    Auth-->>UI: إصدار رمز الوصول (JWT Token)
    UI->>API: طلب البيانات المشفرة مع الرمز
    API-->>UI: إرجاع البيانات المحمية
    UI-->>User: فتح شاشة لوحة التحكم
```

### ج. مخطط العلاقات البيانية لقواعد البيانات (Entity-Relationship ER):
```mermaid
erDiagram
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--|{ ORDER_ITEM : contains
    PRODUCT ||--o{ ORDER_ITEM : includes
    CUSTOMER {
        string id PK
        string full_name
        string email
        string phone_number
    }
    ORDER {
        int order_number PK
        date created_at
        float total_amount
        string status
    }
    PRODUCT {
        string sku PK
        string title
        decimal price
        int stock_level
    }
```

### د. شجرة الفروع وتاريخ الإصدارات (Git Graph):
```mermaid
gitGraph
    commit id: "Initial Release" tag: "v1.0.0"
    branch develop
    checkout develop
    commit id: "feat: add katex math"
    commit id: "feat: add bidi arbitrator"
    branch feature/mermaid-studio
    checkout feature/mermaid-studio
    commit id: "feat: pan-zoom controls"
    commit id: "feat: arabic svg fonts"
    checkout develop
    merge feature/mermaid-studio
    checkout main
    merge develop tag: "v1.1.0"
```

### هـ. الخريطة الذهنية المعمارية (Mindmap):
```mermaid
mindmap
  root((محطة MDFull))
    المعمارية الأساسية
      محرك AST نقي
      محول BiDi
      محول KaTeX
      استوديو Mermaid
    أوضاع القراءة
      Dark OLED
      Light Paper
      Sepia Book
      Terminal Hacker
    إدارة المستندات
      Multi-Tab Strip
      Dynamic Outline
      Health Inspector
      Single-File Exporter
```

### و. خطة المهام الزمنية (Gantt Milestone Roadmap):
```mermaid
gantt
    title الخطة الزمنية للمشروع 2026
    dateFormat  YYYY-MM-DD
    section التأسيس
    العصف الذهني والوثائق       :done,    des1, 2026-11-01, 2026-11-03
    هيكلة المشروع والمكتبات   :done,    des2, 2026-11-03, 2026-11-08
    section المحركات الأساسية
    محرك KaTeX و Bidi         :active,  dev1, 2026-11-08, 2026-11-12
    استوديو المخططات التفاعلي :         dev2, 2026-11-12, 2026-11-16
    section الإطلاق
    تجهيز حزم سطح المكتب Tauri :        rel1, 2026-11-16, 2026-11-20
    الإطلاق الرسمي             :crit,    rel2, 2026-11-20, 2026-11-22
```

---

## 4. جداول المقارنة الفنية ومعايير الأداء (Benchmarking Tables) 📊

| المؤشر التقني | برامج الإلكترون (Obsidian / MarkText) | محررات الويب التقليدية | محطة MDFull الفائقة |
| :--- | :---: | :---: | :---: |
| **استهلاك الذاكرة (RAM Idle)** | 250MB - 450MB | 180MB - 300MB | **35MB - 55MB فقط** |
| **حجم الملف التنفيذي** | 120MB - 200MB | غير متاح أوفلاين | **أقل من 20MB** |
| **دعم RTL المضمن للأكواد** | ضعيف ويشوه الترقيم | جزئي | **عزل تام مع Punctuation Lock** |
| **تصدير HTML بدون إنترنت** | يحتاج Pandoc خارجي | غير متوفر | **ملف واحد مدمج بنقرة زر** |
| **وضع الطرفية (Terminal)** | يتطلب CSS Hacks | غير مدعوم | **مدمج مع توهج فوسفوري و Scanlines** |

---

## 5. نماذج الشيفرات البرمجية متعددة اللغات (Code Blocks) 💻

### شيفرة Rust (محرك معالجة الملفات عالي الأداء):
```rust
use std::fs::File;
use std::io::{self, Read};

pub fn read_markdown_document(path: &str) -> io::Result<String> {
    let mut file = File::open(path)?;
    let mut content = String::new();
    file.read_to_string(&mut content)?;
    println!("Successfully loaded {} bytes from {}", content.len(), path);
    Ok(content)
}
```

### شيفرة TypeScript (محول التوجيه الذكي BiDi Arbitrator):
```typescript
export class BiDiArbitrator {
  private static readonly ARABIC_REGEX = /[\u0600-\u06FF\u0750-\u077F]/g;

  public static detectDirection(text: string): 'rtl' | 'ltr' {
    const arabicMatches = text.match(this.ARABIC_REGEX);
    const count = arabicMatches ? arabicMatches.length : 0;
    return count / text.length >= 0.3 ? 'rtl' : 'ltr';
  }
}
```

### شيفرة استعلامات SQL (تحليل إحصائيات المستندات):
```sql
SELECT 
    d.document_id,
    d.title,
    COUNT(h.heading_id) AS total_headings,
    SUM(m.math_blocks_count) AS total_formulas,
    d.created_at
FROM documents d
LEFT JOIN headings h ON d.document_id = h.document_id
LEFT JOIN metrics m ON d.document_id = m.document_id
WHERE d.status = 'ACTIVE'
GROUP BY d.document_id, d.title, d.created_at
ORDER BY total_formulas DESC;
```

---

## 6. قائمة المهام التفاعلية والعناصر الموسعة (Checklists & Extensions) 📑

### حالة الإنجاز المعماري:
- [x] دعم التبويبات المتعددة المتزامنة (Multi-Tab Workspace)
- [x] محرك المعادلات الرياضية KaTeX مع الدعم الكامل لـ mhchem
- [x] التوجيه الذكي للنصوص العربية ومنع ارتباك الأقواس وعلامات الترقيم
- [x] أربعة أوضاع قراءة مميزة (Dark, Light, Sepia, Code Editor / VS Code)
- [x] استوديو مخططات Mermaid التفاعلي مع دعم الحروف العربية والـ Pan-Zoom
- [x] وضع العرض التقديمي الفوري بنقرة زر واحدة (Slide Deck Mode)
- [x] فاحص صحة المستند التلقائي وحساب الكلمات ومعدل القراءة
- [x] التصدير الاحترافي المتعدد (Word OMML Equations, Paginated PDF, Standalone HTML)
- [x] محرك الملاحة بالروابط الذكية والتمرير الانسيابي (Smart Links & Anchors)
- [x] استوديو التظليلات الحية والملاحظات المرجعية (Interactive Annotations Studio)

### عناصر التنسيق المتقدمة:
* **النصوص المحذوفة:** ~~هذه ميزة ملغاة من الإصدار السابق~~ وتم استبدالها بمحرك أسرع.
* **الرموز الكيميائية:** جزيء الماء $\text{H}_2\text{O}$ وغاز الميثان $\text{CH}_4$.
* **الهوامش السفلية:** تدعم المحطة الإحالات المرجعية التلقائية للمصادر الأكاديمية[^1].
* **الأقسام المطوية القابلة للتوسيع:**

<details>
<summary>🔍 اضغط هنا لعرض تفاصيل الإعدادات المتقدمة والتراخيص</summary>

هذا القسم يستخدم وسوم `details` و `summary` القياسية المدعومة بنسبة 100% في المحطة مع تأثير حركة ناعم يتناسب مع وضع القراءة المختار.
</details>

---

## 7. مختبر اختبار الروابط الذكية والملاحة التفاعلية (Hyperlinks & Navigation Lab) 🔗

تتكامل في هذا القسم كافة أنماط الروابط التشعبية المدعومة في محطة **MDFull** مع تمييز دقيق وتأمين كامل لكل نمط:

### أ. الروابط الداخلية للأقسام والمراسي (Internal Anchors with Smooth Scroll & Pulse):
انقر على أي من الروابط التالية لاختبار القفز التلقائي المنساب مع وميض الهبوط البصري (`Landing Attention Glow`):
* [الانتقال إلى قسم التناغم الذكي بين اللغتين](#1-التناغم-الذكي-بين-اللغتين-العربية-والإنجليزية-في-مستند-واحد-bilingual-coexistence-bidi-showcase)
* [الانتقال المباشر إلى الموسوعة الرياضية الشاملة](#2-الموسوعة-الرياضية-والعلمية-الشاملة-latex-katex-showcase)
* [الانتقال إلى استوديو المخططات الهندسية والبيانية](#3-استوديو-المخططات-الهندسية-والبيانية-mermaid-interactive-studio)
* [الانتقال إلى قائمة المهام والإنجاز](#6-قائمة-المهام-التفاعلية-والعناصر-الموسعة-checklists-extensions)
* [العودة السريعة إلى أعلى المستند ⬆](#محطة-mdfull-المختبر-التقني-والاستعراضي-الشامل)

---

### ب. الروابط الخارجية المعزولة أمنياً (External Links with Target Isolation & Badges):
تُفتح الروابط الخارجية تلقائياً في علامة تبويب جديدة مع عزل الحماية (`target="_blank"` و `rel="noopener noreferrer"`) وتزويدها بأيقونة توجيه تفاعلية:
* [الموقع الرسمي لمواصفات CommonMark القياسية](https://commonmark.org)
* [مستودع المشروع والتطوير على GitHub](https://github.com)
* [محرك الصيغ والمعادلات الرياضية السريع KaTeX](https://katex.org)
* [التوثيق البرمجي لمكتبة المخططات Mermaid.js](https://mermaid.js.org)
* [التواصل مع الإدارة الهندسية عبر البريد الإلكتروني](mailto:engineering@enterprise.sa)

---

### ج. روابط وثائق ومستندات مساحة العمل (Workspace Markdown Files):
عند النقر على روابط ملفات مساحة العمل، يتعرف عليها القارئ كملفات توثيقية ويفتحها كعلامة تبويب جديدة (`Tab`) في شريط التنقل:
* [مواصفات متطلبات النظام القياسية (SRS.md)](./SRS.md)
* [الدليل التشغيلي للمشروع (README.md)](./README.md)
* [سجل العمل المنجز والمراحل المعتمدة (COMPLETED_WORK.md)](./project_management/COMPLETED_WORK.md)

---

### د. اختبار كاشف الروابط المعطلة (Dead-Anchor Diagnostic Inspector):
* [رابط تجريبي لقسم غير موجود في المستند](#ghost-anchor-test-section)  
*(عند النقر على زر **"فحص صحة المستند"** 🩺 في الشريط العلوي، ستجد أن المحطة التقطت هذا الرابط فوراً وصنفته كـ `تحذير: رابط داخلي لقسم غير موجود`)*.

---

## 8. استوديو اختبار تظليلات النصوص والملاحظات المرجعية (Highlighting & Notes Studio) 🖍️

يوفر القارئ تجربة متقدمة لقراءة الأبحاث والوثائق التنفيذية مع إمكانية التفاعل الحي مع النصوص:

> [!TIP]
> **جرّب التظليل الآن:** قم بتحديد أي كلمة أو جملة من الفقرة التالية بالفأرة؛ سيظهر لك شريط أدوات عائم يتيح لك اختيار لون التظليل أو إضافة تعليق دراسي فوري!

### نص تجريبي مخصص للتظليل والتعليق:
تمثل منصة **MDFull** معياراً هندسياً رائداً لمحطات قراءة وتصدير المستندات التقنية. تتميز المنصة بالدقة العالية في معالجة الخطوط، وضبط التباين اللوني وفق أحدث معايير إمكانية الوصول العالمية **WCAG AAA**، وتوفير خمسة ألوان تظليل متناسقة دلالياً:
1. **الأصفر الكلاسيكي (Yellow):** للنقاط الجوهرية والتعريفات الأساسية.
2. **الأخضر الزمردي (Emerald):** للنتائج المؤكدة وقواعد النجاح المعتمدة.
3. **الأزرق السماوي (Sky):** للمراجع التقنية والمصطلحات البرمجية.
4. **الوردي الفاقع (Rose):** للتحذيرات والمخاطر التشغيلية.
5. **البنفسجي الملكي (Purple):** للأفكار الاستراتيجية والتوصيات المستقبلية.

يمكنك الضغط على اختصار <kbd>Ctrl</kbd> + <kbd>H</kbd> في أي وقت لفتح **درج الملاحظات المرجعية** للبحث في كافة تظليلاتك وتصديرها بضغطة زر واحدة.

---

[^1]: توثيق رسمي لمعايير CommonMark 0.31 و GitHub Flavored Markdown المعتمدة في هذا النظام.
