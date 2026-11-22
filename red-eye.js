"use strict";

const clinicalCase = {
  patient: "Sarah",
  opening: "My right eye keeps getting red. It feels gritty, and I’ve got a bump on my upper lid.",
  history: [
    {
      id: "onset",
      label: "Onset and laterality",
      priority: false,
      questions: [
        { id: "onset_when", question: "When did the redness and gritty feeling start?", reply: "It’s been going on for a few weeks.", note: "Redness and gritty feeling for a few weeks.", feedback: "The time course helps distinguish a sudden problem from a longer-running surface irritation." },
        { id: "onset_side", question: "Is it in one eye or both?", reply: "Mostly my right eye this time. I’ve had that gritty feeling in both eyes on and off before.", note: "Current symptoms mainly right-sided; intermittent prior bilateral grittiness.", feedback: "Laterality and prior bilateral symptoms help characterize the current episode." }
      ]
    },
    {
      id: "vision",
      label: "Vision change",
      priority: true,
      questions: [
        { id: "vision_change", question: "Has your vision changed at all?", reply: "No, I can see as usual.", note: "No subjective vision change.", feedback: "A new change in vision with a red eye needs prompt assessment." },
        { id: "vision_leading_review", kind: "review", question: "So the redness means you can’t see clearly, right?", reply: "No, I can see fine. It’s just red and gritty.", note: "Review: do not assume vision loss from redness alone.", feedback: "Ask openly about vision. Sarah reports no change, so do not record blurred vision." }
      ]
    },
    {
      id: "pain_light",
      label: "Pain and light sensitivity",
      priority: true,
      questions: [
        { id: "pain", question: "Does the eye hurt, or is it more irritated?", reply: "It’s irritated, but it doesn’t really hurt.", note: "Irritation without deep eye pain.", feedback: "Significant eye pain can point to a more urgent cause than mild surface irritation." },
        { id: "light_sensitivity", question: "Does bright light bother you?", reply: "No, bright light doesn’t bother me.", note: "No light sensitivity.", feedback: "Light sensitivity with a red eye can signal corneal or intraocular inflammation and raises urgency." }
      ]
    },
    {
      id: "contact_lenses",
      label: "Contact lens use",
      priority: true,
      questions: [
        { id: "contacts", question: "Do you wear contact lenses?", reply: "No, I wear glasses.", note: "Glasses; no contact lens use reported.", feedback: "Contact lens use increases concern for a corneal infection when redness or pain is present." }
      ]
    },
    {
      id: "exposure",
      label: "Injury, chemical exposure and procedures",
      priority: true,
      questions: [
        { id: "exposure_events", question: "Did anything hit or scratch your eye, or did any chemical splash into it?", reply: "No, nothing got in my eye and I haven’t hurt it.", note: "No reported eye injury or chemical splash.", feedback: "Trauma or chemical exposure can need immediate action, especially chemical irrigation." },
        { id: "recent_procedure", question: "Have you had an eye procedure recently?", reply: "No, I haven’t had any eye procedures.", note: "No recent eye procedure reported.", feedback: "Redness after a recent eye procedure can require prompt review." }
      ]
    },
    {
      id: "surface_symptoms",
      label: "Discharge and surface symptoms",
      priority: false,
      questions: [
        { id: "discharge_itch", question: "Any discharge or itching?", reply: "It isn’t especially itchy, and there’s no pus.", note: "No pus; little itch reported.", feedback: "Itch and discharge help distinguish common surface causes." },
        { id: "lash_crust", question: "Do your lashes get crusty?", reply: "There’s a little crust around them in the morning.", note: "Mild morning lash crusting.", feedback: "Lash crusting helps identify associated lid-margin irritation." },
        { id: "grit_timing", question: "When do you notice the gritty feeling most?", reply: "It comes and goes. I notice it more late in the day, especially after reading.", note: "Intermittent grittiness, worse late in the day and after reading.", feedback: "A fluctuating gritty sensation can fit surface irritation; it does not replace checking urgent symptoms." }
      ]
    },
    {
      id: "lid_bump",
      label: "Lid bump time course and tenderness",
      priority: false,
      questions: [
        { id: "bump_timing", question: "When did you first notice the bump?", reply: "About two weeks ago.", note: "Right upper lid bump noticed about two weeks ago.", feedback: "The bump’s time course helps distinguish a recent tender lesion from a longer-standing lump." },
        { id: "bump_tenderness", question: "Was it sore at first, and is it still sore now?", reply: "It was sore to touch at first, but now it’s mostly just a bump.", note: "Initially tender, now minimally tender by history.", feedback: "A bump that has become less tender supports a different lid process than one that remains acutely sore." },
        { id: "bump_location_follow", requires: "bump_timing", question: "Is the bump right at the lashes or a bit higher up?", reply: "It’s a little higher up, away from the lashes.", note: "Patient locates the bump above the lash line.", feedback: "The location helps connect the history with the lid examination." }
      ]
    },
    {
      id: "prior_episodes",
      label: "Previous episodes",
      priority: false,
      questions: [
        { id: "prior_grit", question: "Have you had this gritty feeling before?", reply: "Yes, I’ve had that feeling on and off before.", note: "Intermittent prior gritty feeling.", feedback: "Prior episodes help establish whether the surface symptom is recurrent." },
        { id: "prior_bump", requires: "prior_grit", question: "Have you had a lid bump like this before?", reply: "No, this is the first time I’ve noticed a lump.", note: "First noticed lid lump.", feedback: "A first or recurrent lid lump changes what follow-up history is useful." }
      ]
    },
    {
      id: "treatments",
      label: "Treatments tried",
      priority: false,
      questions: [
        { id: "treatments_used", question: "Have you tried any drops or other treatment for it?", reply: "No, I haven’t used any drops.", note: "No drops tried.", feedback: "Knowing what has already been tried helps guide the next step and avoids overlooking a prior treatment response." },
        { id: "treatment_review", kind: "review", question: "You’ve been using antibiotic drops, then?", reply: "No, I haven’t used any drops.", note: "Review: no eye drops used.", feedback: "Avoid leading assumptions about treatment. Sarah has not used drops." }
      ]
    }
  ],
  exam: [
    { id: "acuity", label: "Visual acuity", purpose: "Measure acuity in each eye and check for reduced vision.", reply: "Distance acuity is 20/20 in each eye with glasses." },
    { id: "pupils", label: "Pupils and motility", purpose: "Look for abnormal pupils, painful or limited eye movements, and proptosis.", reply: "Pupils are equal and reactive. Eye movements are full and painless, with no proptosis." },
    { id: "lids", label: "Lids and lashes", purpose: "Locate any bump and inspect the lash bases and gland openings.", reply: "There is a firm nodule within the right upper lid, away from the lash line. It is minimally tender. There are crusts at the lashes and plugged meibomian gland openings.",
      photos: [
        {
          alt: "Close-up of an eyelid with a localized raised area",
          label: "Lid contour",
          src: "https://webeye.ophth.uiowa.edu/eyeforum/atlas/photos/chalazion/Chalazion_01242005.jpg",
          source: "https://webeye.ophth.uiowa.edu/eyeforum/atlas/pages/Chalazion-2-.html",
          credit: "Jordan Graff, MD"
        },
        {
          alt: "Close-up of eyelashes with visible flakes at their bases",
          label: "Lash bases",
          src: "https://webeye.ophth.uiowa.edu/eyeforum/atlas/pages/blepharitis/Blepharitis.jpg",
          source: "https://webeye.ophth.uiowa.edu/eyeforum/atlas/pages/blepharitis/index.htm",
          credit: "Cindy Montague, CRA (photographer) and Jesse Vislisel, MD (contributor)"
        }
      ] },
    { id: "surface", label: "Cornea and anterior chamber", purpose: "Look for corneal staining, a focal infiltrate, or anterior chamber inflammation.", reply: "The conjunctiva is mildly injected. Fluorescein shows scattered superficial punctate staining. There is no focal corneal infiltrate or anterior chamber inflammation." }
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
