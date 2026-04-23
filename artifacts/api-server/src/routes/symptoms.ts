import { Router, type IRouter } from "express";
import { CheckSymptomsBody, CheckSymptomsResponse } from "@workspace/api-zod";
import { requireAuth } from "../lib/auth";

const router: IRouter = Router();

interface Rule {
  name: string;
  triggers: string[];
  weight: number;
  advice: string;
  emergency?: boolean;
}

const RULES: Rule[] = [
  {
    name: "Common Cold",
    triggers: ["cough", "sore throat", "fatigue", "headache"],
    weight: 1,
    advice: "Rest, drink warm fluids, and monitor for 3-5 days.",
  },
  {
    name: "Influenza (Flu)",
    triggers: ["fever", "body ache", "fatigue", "cough", "headache"],
    weight: 1.2,
    advice: "Rest, hydrate, paracetamol for fever. See a doctor if it worsens.",
  },
  {
    name: "Gastroenteritis",
    triggers: ["diarrhea", "vomiting", "fever", "fatigue"],
    weight: 1.2,
    advice: "Drink ORS frequently. Seek care if dehydration signs appear.",
  },
  {
    name: "Migraine",
    triggers: ["headache", "dizziness", "fatigue"],
    weight: 1,
    advice: "Rest in a dark, quiet room. Consult a doctor for repeated attacks.",
  },
  {
    name: "Possible Pneumonia",
    triggers: ["fever", "cough", "shortness of breath", "fatigue"],
    weight: 1.4,
    advice: "Consult a doctor as soon as possible.",
  },
  {
    name: "Possible Cardiac Event",
    triggers: ["chest pain", "shortness of breath", "dizziness"],
    weight: 2,
    advice: "Seek emergency care immediately.",
    emergency: true,
  },
  {
    name: "Allergic Reaction",
    triggers: ["rash", "shortness of breath"],
    weight: 1.2,
    advice: "Avoid triggers. Seek urgent care if breathing is affected.",
  },
  {
    name: "Heat Exhaustion",
    triggers: ["dizziness", "fatigue", "headache", "vomiting"],
    weight: 1,
    advice: "Move to shade, drink fluids, rest.",
  },
];

router.post("/symptoms/check", requireAuth, async (req, res): Promise<void> => {
  const parsed = CheckSymptomsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const symptoms = parsed.data.symptoms.map((s) => s.toLowerCase().trim());
  const set = new Set(symptoms);

  const scored = RULES.map((rule) => {
    const matches = rule.triggers.filter((t) => set.has(t)).length;
    const ratio = matches / rule.triggers.length;
    const confidence = Math.min(
      99,
      Math.round(ratio * rule.weight * 80 + (matches > 0 ? 5 : 0)),
    );
    return {
      name: rule.name,
      confidence,
      advice: rule.advice,
      emergency: rule.emergency ?? false,
    };
  })
    .filter((r) => r.confidence > 0)
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 5);

  let urgency: "low" | "moderate" | "high" | "emergency" = "low";
  if (
    scored.some((s) => s.emergency && s.confidence >= 30) ||
    set.has("chest pain")
  )
    urgency = "emergency";
  else if (scored[0]?.confidence >= 60) urgency = "high";
  else if (scored[0]?.confidence >= 30) urgency = "moderate";

  res.json(
    CheckSymptomsResponse.parse({
      conditions: scored.map(({ emergency: _e, ...rest }) => rest),
      urgency,
      disclaimer:
        "This is not a medical diagnosis. Please consult a qualified doctor.",
    }),
  );
});

export default router;
