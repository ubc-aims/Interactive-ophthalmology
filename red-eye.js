"use strict";

const clinicalCase = {
  opening: "My right eye keeps getting red. It feels as if there’s grit in it, and now there’s a bump on my upper lid.",
  history: [
    { id: "onset", label: "Onset and laterality", question: "When did this start? Which eye is affected?", reply: "Both eyes have felt gritty on and off before. This time it’s mainly the right eye and it’s been going on for weeks.", follow: { question: "When did the lid bump appear?", reply: "About two weeks ago. It was sore to touch at first and now it’s mostly just a bump." } },
    { id: "vision", label: "Vision, pain and light sensitivity", question: "Has your vision changed? Any pain in the eye or sensitivity to light?", reply: "I can see as usual. There’s some irritation, but no deep pain and bright light doesn’t bother me." },
    { id: "risks", label: "Lenses, injury and recent procedures", question: "Do you wear contacts? Any injury, chemical splash, or recent eye procedure?", reply: "I wear glasses. I haven’t had an injury, splash, or eye procedure." },
    { id: "surface", label: "Discharge, itch and lid symptoms", question: "Any discharge, itching, or crusting around the lashes?", reply: "There’s a little crust around the lashes in the morning. It isn’t especially itchy and there’s no pus.", follow: { question: "Does the gritty feeling come and go?", reply: "Yes. I notice it more late in the day, especially after I’ve been reading." } },
    { id: "background", label: "Prior episodes and treatments", question: "Has this happened before? Have you used anything for it?", reply: "I’ve had the gritty feeling before, but this is the first time I’ve noticed a lump. I haven’t used any drops." }
  ],
  exam: [
    { id: "acuity", label: "Visual acuity", reply: "Distance acuity is 20/20 in each eye with glasses." },
    { id: "pupils", label: "Pupils and motility", reply: "Pupils are equal and reactive. Eye movements are full and painless, with no proptosis." },
    { id: "lids", label: "Lids and lashes", reply: "There is a firm nodule within the right upper lid, away from the lash line. It is minimally tender. There are crusts at the lashes and plugged meibomian gland openings." },
    { id: "surface", label: "Cornea and anterior chamber", reply: "The conjunctiva is mildly injected. Fluorescein shows scattered superficial punctate staining. There is no focal corneal infiltrate or anterior chamber inflammation." }
  ],
  checkpoints: {
    safety: {
      title: "Which new finding changes the urgency?",
      prompt: "You have another patient with a red eye. Which history most strongly suggests an urgent corneal problem?",
      choices: [
        ["itch", "Itching and watery eyes every spring", "The seasonal itching pattern fits allergy. New pain, light sensitivity, and blurred vision in a contact lens wearer raise concern for keratitis."],
        ["lens", "Contact lens wear with new pain, light sensitivity, and blurred vision", "This combination raises concern for microbial keratitis and warrants urgent assessment."],
        ["lump", "A painless lid bump with unchanged vision", "A focal painless lid bump points toward a lid lesion. Pain, light sensitivity, and blurred vision in a contact lens wearer change the urgency."]
      ],
      correct: ["lens"]
    },
    findings: {
      title: "Which findings localize the problem?",
      prompt: "Select the positive findings that support an eyelid and tear-film source.",
      choices: [
        ["acuity", "20/20 vision with glasses"],
        ["nodule", "Firm nodule away from the lash line"],
        ["glands", "Lash crusts and plugged gland openings"],
        ["pupils", "Equal, reactive pupils"],
        ["stain", "Scattered punctate corneal staining"]
      ],
      correct: ["nodule", "glands", "stain"],
      feedback: "The nodule localizes to the lid. Plugged glands, lash crusts, and scattered staining support associated lid and surface disease. Acuity and pupils help with safety assessment."
    },
    diagnosis: {
      title: "What best explains the lid nodule?",
      prompt: "Use the time course, tenderness, and position of the nodule.",
      choices: [
        ["stye", "External hordeolum", "An external hordeolum usually stays tender and forms at the lash line. This nodule is deep in the lid and has become less tender."],
        ["conj", "Bacterial conjunctivitis", "Conjunctivitis does not explain a discrete nodule within the lid. The lash and gland findings support associated blepharitis."],
        ["chalazion", "Chalazion", "A blocked meibomian gland explains the firm nodule within the lid that has become less tender. The lash crusts and plugged glands also support blepharitis with meibomian gland dysfunction."]
      ],
      correct: ["chalazion"]
    },
    plan: {
      title: "How would you counsel the patient?",
      prompt: "The patient asks whether the bump needs antibiotic drops. Choose the best initial plan for this presentation.",
      choices: [
        ["drops", "Prescribe antibiotic drops for the nodule", "A chalazion is caused by gland blockage. Warm compresses are first-line for this presentation."],
        ["heat", "Start warm compresses and discuss when to return", "Explain the gland blockage in plain language and reassess a persistent or recurrent lesion. New vision loss, significant eye pain, or light sensitivity changes the urgency."],
        ["wait", "Reassure and end the visit without follow-up advice", "Give a plan for reassessment if the lesion persists or recurs and explain which new symptoms need urgent assessment."]
      ],
      correct: ["heat"],
      modelResponse: "The bump looks like a blocked oil gland in your eyelid. A warm compress can help it settle. Let’s recheck it if it stays or comes back. Get urgent help if your vision changes, you develop significant eye pain, or bright light starts to hurt."
    }
  },
  guide: [
    ["Screen for urgency", "Ask about chemical exposure or trauma, visual change, pain, light sensitivity, contact lens wear, and recent surgery. Chemical injury may require immediate irrigation before routine assessment. Suspected open globe needs immediate specialist assessment and protection from pressure."],
    ["Characterize the redness", "Ask about onset, one or both eyes, discharge, itch, foreign-body sensation, prior episodes, and treatments."],
    ["Examine and localize", "Check acuity in each eye early when safe. Examine pupils, eye movements, lids, conjunctiva, cornea, and anterior chamber. Use fluorescein when indicated. Avoid tonometry if open globe is suspected."],
    ["Use the findings to narrow the differential", "A focal lid nodule suggests a lid process. Prominent itch suggests allergy, and discharge can point toward conjunctivitis. A corneal infiltrate raises concern for microbial keratitis. Anterior chamber cells with pain and photophobia suggest anterior uveitis. Acute blurred vision with nausea, a hazy cornea, and a fixed mid-dilated pupil suggests acute angle closure."],
    ["Choose disposition", "Explain the likely cause and the plan. Escalate promptly when concerning symptoms or signs suggest a corneal or intraocular process."]
  ],
  references: [
    ["AAO adult eye evaluation", "https://www.aao.org/Assets/1560bf29-4499-41fc-8569-b5b18cd8d210/636125702218170000/comprehensive-adult-medical-eye-evaluation-ppp-pdf"],
    ["AAO bacterial keratitis evaluation", "https://www.aao.org/Assets/aef4cf4e-860e-42f9-927e-fd29d72bc610/636492185327430000/bc-2208-pppsummarybenchmarks-17-pdf#page=17"],
    ["AAO EyeWiki on-call triage", "https://eyewiki.aao.org/On_Call_Ophthalmology"],
    ["AAO EyeWiki on conjunctivitis", "https://eyewiki.org/Conjunctivitis"],
    ["AAO EyeWiki on anterior uveitis", "https://eyewiki.org/Acute_Anterior_Uveitis"],
    ["MSD Manual on chalazion and hordeolum", "https://www.msdmanuals.com/professional/eye-disorders/eyelid-and-lacrimal-disorders/chalazion-and-hordeolum-stye"]
  ]
};
