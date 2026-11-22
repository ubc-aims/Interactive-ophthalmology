# The Red Eye

Open [index.html](index.html) in a browser to run the case locally. The case uses plain HTML, CSS, and JavaScript and requires no installation. Responses and case notes reset when the learner restarts or reloads the page.

## Reuse the template

- Edit [red-eye.js](red-eye.js) to change the opening, interview topics, exam findings, checkpoints, and debrief. An interview topic can have a `follow` question, which appears after that topic is selected. Give each topic and exam finding its own ID.
- Each checkpoint has answer choices with IDs and a list of correct IDs. One correct ID produces radio buttons. Multiple correct IDs produce checkboxes. Single-answer choices carry their own explanations. A multi-answer checkpoint uses one shared explanation.
- Edit the stage list in [case.js](case.js) to change when a checkpoint appears. Update the title and introduction in [index.html](index.html) when starting a different case.

## Clinical basis

The supplied Sarah Thomas captures informed the lid and ocular surface presentation. The interview wording, exam values, learner choices, and teaching flow were written for this module. The acute contact lens vignette is a separate safety checkpoint.

- The AAO adult evaluation guideline lists “Chief complaint and history of present illness” under **History** and starts **Ocular Examination** with “Visual acuity with current correction.” These support the interview and acuity components. The module’s stage order is a teaching sequence. [AAO comprehensive adult eye evaluation, Care Process](https://www.aao.org/Assets/1560bf29-4499-41fc-8569-b5b18cd8d210/636125702218170000/comprehensive-adult-medical-eye-evaluation-ppp-pdf)
- The AAO bacterial keratitis benchmark lists “degree of pain, redness, discharge, blurred vision, photophobia” and separately calls for a contact lens history. These support the history prompts and the urgent corneal vignette. [AAO summary benchmarks, Bacterial Keratitis, Initial Exam History](https://www.aao.org/Assets/aef4cf4e-860e-42f9-927e-fd29d72bc610/636492185327430000/bc-2208-pppsummarybenchmarks-17-pdf#page=17)
- EyeWiki’s **Chemical Injuries** section directs clinicians to “begin copious irrigation immediately” for isolated chemical exposure and gives a separate exception for suspected open globe. The triage table lists bacterial keratitis, acute anterior uveitis, and acute angle closure as urgent. [EyeWiki on-call triage](https://eyewiki.aao.org/On_Call_Ophthalmology)
- The differential uses ocular itch and discharge patterns from **Physical Examination** in the conjunctivitis entry, plus pain, light sensitivity, and anterior chamber inflammation from **Disease** in the anterior uveitis entry. These are clues to localize disease. [EyeWiki on conjunctivitis](https://eyewiki.org/Conjunctivitis) · [EyeWiki on anterior uveitis](https://eyewiki.org/Acute_Anterior_Uveitis)
- The MSD Manual notes that a chalazion can become a “small nontender nodule in the eyelid center” and lists “Warm compresses” in **Treatment of Chalazion and Hordeolum**. Its **Diagnosis** section supports reassessment of a lesion that persists despite treatment. [MSD Manual on chalazion and hordeolum](https://www.msdmanuals.com/professional/eye-disorders/eyelid-and-lacrimal-disorders/chalazion-and-hordeolum-stye)
