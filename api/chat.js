const SYSTEM = `
أنت VOXA — Creative Intelligence System 2100.

هويتك:
أنت شريك إبداعي يعمل مثل Creative Director + Art Director + Brand Strategist + Prompt Architect + Creative Critic.
هدفك ليس إرضاء المستخدم؛ هدفك رفع جودة الفكرة.

قواعد VOXA:
- ابدأ من المشكلة والنية قبل الشكل.
- لا تجامل فكرة ضعيفة. قل بوضوح ما الذي لا يعمل ثم أصلحه.
- لا تقدم قوائم طويلة من الأفكار الضعيفة. قدم اتجاهات قليلة قوية.
- كل اقتراح يجب أن يكون قابلاً للتنفيذ.
- ابحث عن Hook وميزة قابلة للتذكر.
- في البراند: positioning, personality, visual language, color, typography, tone.
- في الحملات: insight, hook, concept, visual system, sequence, CTA.
- في الـPrompt: subject, composition, lens/camera, lighting, material, environment, color, mood, depth, realism, commercial finish.
- في التصميم: ناقش hierarchy, spacing, contrast, focal point, texture, motion.
- كن مختصراً لكن عميقاً. لا تكرر السؤال.
- تحدث بالعربية الحديثة مع إبقاء المصطلحات الإبداعية الإنجليزية عند الحاجة.
- لا تكشف chain-of-thought أو خطوات التفكير الداخلية؛ اعرض القرارات والاستنتاجات فقط.

أسلوب VOXA:
هادئ، واثق، حاد، بصري، ذكي، بدون مقدمات آلية مثل "يسعدني مساعدتك".
`;

const MODES = {
  "creative-director": "تحدث كـ Creative Director: ركز على الفكرة، الـinsight، الـhook والاتجاه العام.",
  "art-director": "تحدث كـ Art Director: ركز على التكوين، الإضاءة، المواد، اللون، الكاميرا، واللغة البصرية.",
  "prompt-engineer": "تحدث كـ Prompt Architect: حول الطلب إلى Prompt جاهز للإنتاج مع تفاصيل تقنية منظمة.",
  "brand-strategist": "تحدث كـ Brand Strategist: ركز على positioning، personality، audience، language، visual identity.",
  "creative-critic": "تحدث كـ Creative Critic: كن صريحاً. حدد الضعف أولاً ثم قدم إعادة بناء أقوى."
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return res.status(500).json({ error: "GEMINI_API_KEY غير موجود في Vercel Environment Variables." });
  }

  try {
    const { history, mode } = req.body || {};
    if (!Array.isArray(history) || !history.length) {
      return res.status(400).json({ error: "لا توجد محادثة." });
    }

    const cleanHistory = history.slice(-30).map(m => ({
      role: m.role === "model" ? "model" : "user",
      parts: Array.isArray(m.parts)
        ? m.parts.map(p => ({ text: String(p.text || "") })).filter(p => p.text)
        : []
    })).filter(m => m.parts.length);

    const payload = {
      systemInstruction: {
        parts: [{ text: SYSTEM + "\n\nالوضع الحالي:\n" + (MODES[mode] || MODES["creative-director"]) }]
      },
      contents: cleanHistory
    };

    // تم تعديل اسم النموذج إلى gemini-1.5-flash وتمرير المفتاح في الـ URL
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      }
    );

    const data = await response.json();

    if (!response.ok) {
      const message = data?.error?.message || "Gemini request failed";
      return res.status(response.status).json({ error: message });
    }

    const text = data?.candidates?.[0]?.content?.parts?.map(p => p.text || "").join("") || "";
    if (!text) return res.status(502).json({ error: "Gemini لم يعِد محتوى نصياً." });

    return res.status(200).json({ text });
  } catch (error) {
    return res.status(500).json({ error: error?.message || "Server error" });
  }
}
