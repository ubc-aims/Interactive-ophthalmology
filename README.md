# The Red Eye

Open [index.html](index.html) in a browser to run the case locally. The case uses plain HTML, CSS, and JavaScript and requires no installation. Responses and case notes reset when the learner restarts or reloads the page.

## Reuse the template

- Edit [red-eye.js](red-eye.js) to change the opening, interview topics, exam findings, checkpoints, and debrief. Each history topic has question objects with a case fact, suggested question, and coaching feedback. A question with `requires` becomes available after its prerequisite question is sent. A question marked `kind: "review"` provides corrective feedback and leaves the checklist open. Give each topic, question, and exam finding its own ID.
- Each checkpoint has answer choices with IDs and a list of correct IDs. One correct ID produces radio buttons. Multiple correct IDs produce checkboxes. Single-answer choices carry their own explanations. A multi-answer checkpoint uses one shared explanation.
- Edit [clinical-standard.js](clinical-standard.js) for learning objectives, references, feedback rubrics, and the three model instructions. Edit [red-eye.js](red-eye.js) for the interview checklist, the exam options and findings, and the case-specific teaching references. Update the title in [index.html](index.html) when starting a different case.

## Clinical basis

The supplied Sarah Thomas captures informed the lid and ocular surface presentation. The interview wording, exam values, learner choices, and teaching flow were written for this module. The acute contact lens vignette is a separate safety checkpoint.

- The AAO adult evaluation guideline lists “Chief complaint and history of present illness” under **History** and starts **Ocular Examination** with “Visual acuity with current correction.” These support the interview and acuity components. The module’s stage order is a teaching sequence. [AAO comprehensive adult eye evaluation, Care Process](https://www.aao.org/Assets/1560bf29-4499-41fc-8569-b5b18cd8d210/636125702218170000/comprehensive-adult-medical-eye-evaluation-ppp-pdf)
- The AAO bacterial keratitis benchmark lists “degree of pain, redness, discharge, blurred vision, photophobia” and separately calls for a contact lens history. These support the history prompts and the urgent corneal vignette. [AAO summary benchmarks, Bacterial Keratitis, Initial Exam History](https://www.aao.org/Assets/aef4cf4e-860e-42f9-927e-fd29d72bc610/636492185327430000/bc-2208-pppsummarybenchmarks-17-pdf#page=17)
- EyeWiki’s **Chemical Injuries** section directs clinicians to “begin copious irrigation immediately” for isolated chemical exposure and gives a separate exception for suspected open globe. The triage table lists bacterial keratitis, acute anterior uveitis, and acute angle closure as urgent. [EyeWiki on-call triage](https://eyewiki.aao.org/On_Call_Ophthalmology)
- The differential uses ocular itch and discharge patterns from **Physical Examination** in the conjunctivitis entry, plus pain, light sensitivity, and anterior chamber inflammation from **Disease** in the anterior uveitis entry. These are clues to localize disease. [EyeWiki on conjunctivitis](https://eyewiki.org/Conjunctivitis) · [EyeWiki on anterior uveitis](https://eyewiki.org/Acute_Anterior_Uveitis)
- The MSD Manual notes that a chalazion can become a “small nontender nodule in the eyelid center” and lists “Warm compresses” in **Treatment of Chalazion and Hordeolum**. Its **Diagnosis** section supports reassessment of a lesion that persists despite treatment. [MSD Manual on chalazion and hordeolum](https://www.msdmanuals.com/professional/eye-disorders/eyelid-and-lacrimal-disorders/chalazion-and-hordeolum-stye)

## Examination photos

The lid examination uses two original University of Iowa EyeRounds atlas images, shown at their original aspect ratios as teaching examples. The module links to the atlas if an image is unavailable. Both photos are licensed [CC BY-NC-ND 3.0](https://creativecommons.org/licenses/by-nc-nd/3.0/).

- Jordan Graff, MD. [Lid contour photograph](https://webeye.ophth.uiowa.edu/eyeforum/atlas/pages/Chalazion-2-.html)
- Cindy Montague, CRA (photographer), and Jesse Vislisel, MD (contributor). [Lash base photograph](https://webeye.ophth.uiowa.edu/eyeforum/atlas/pages/blepharitis/index.htm)

## Enable free-form chat

Run `node tools/encrypt-key.mjs` in this directory and enter the dedicated OpenRouter key and class passphrase at the hidden prompts. To use a private file, run `node tools/encrypt-key.mjs --input /absolute/path/to/credentials.json` with the fields `apiKey` and `passphrase`. Keep that input file outside the repository. Publish the generated `openrouter-key.enc.json` alongside `index.html`. The unlock uses browser Web Crypto over HTTPS or localhost. The case remains locked until the browser decrypts the published file. If you open the project page directly from disk, select `openrouter-key.enc.json` in the unlock form.

The vault uses AES-256-GCM and PBKDF2-HMAC-SHA-256. OWASP lists “600,000 iterations” for PBKDF2-HMAC-SHA-256 in **PBKDF2**. The browser holds the decrypted key for the interview. Anyone with the passphrase can recover it. [OWASP password storage guidance](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html#pbkdf2)

[DeepSeek V4 Flash 0731](https://openrouter.ai/deepseek/deepseek-v4-flash-0731) writes Sarah’s replies using the case facts and conversation. The fixed History greeting is displayed locally without an API call. [OpenRouter structured outputs](https://openrouter.ai/docs/guides/features/structured-outputs) keep reply text, disclosed fact IDs, and coaching metadata separate. The app validates IDs against the authored case before updating the checklist.

The introduction orients the learner and provides a history-taking guide. The four clinical stages are History, Examination, Preceptor, and Counselling. History includes checking for red flags. Students write notes in the side panel and can open Hints to tick their own checklist. Observed history and exam findings are recorded separately. The assessor receives the submitted presentation or counselling message, the stage objective and criteria, evidence gathered in the case, and the student checklist separately. It receives neither the student’s scratch notes nor the passphrase.

## OSCE feedback rubric

The history rubric in [assessor.js](assessor.js) assesses the opening, urgent symptoms, risk factors, symptom characterization, and questioning technique. The assessment runs when the learner chooses Request feedback. Feedback opens on its own screen and the learner can return to the station. DeepSeek receives the transcript and recorded evidence. Examination and counselling use their own criteria. Preceptor coaching takes place in the conversation.

The Harvard framework asks for feedback “based on observed behaviors” and “specific and actionable” (page 1, items 4 and 12). Its case-alignment and prioritization items inform the rubric structure. The AAO keratitis guideline lists “degree of pain, redness, discharge, blurred vision, photophobia” under History and includes contact lenses, prior trauma, and surgery. This supports those clinical checks in the red-eye interview. The other criteria reflect Sarah’s case and its learning objectives. [Harvard OSCE feedback framework](https://meded.hms.harvard.edu/files/hms-med-ed/files/osce_feedback_rubric_sf_9.30.18.pdf) · [AAO bacterial keratitis guideline, History](https://www.aao.org/Assets/6dd86c3a-c71f-44c8-aec1-fd833faca6d2/638434423305070000/bacterial-keratitis-ppp-pdf)

## Examination and presentation sources

The examination map uses an unmodified [CC0 eye photograph by Kookaaa](https://commons.wikimedia.org/wiki/File:Close_up_shot_of_the_human_eye,_9_August_2024.jpg). The fluorescein example is credited to Stefani Karakas, CRA, and Jesse Vislisel, MD. The EyeRounds photos are references alongside Sarah’s separately authored findings. [EyeRounds fluorescein example](https://eyerounds.org/atlas/pages/punctate-epithelial-erosions-3/index.htm)

The AAO adult evaluation guideline lists “Visual acuity with current correction” in **Ocular Examination**. This supports checking acuity early. The app records the selected order and leaves the rest flexible. The UW outpatient guide lists “Pertinent physical exam” and “Assessment/Plan” under **Basic structure**. The preceptor prompt follows that presentation structure and elicits missing information. AHRQ asks patients to state the plan “in their own words” under **Tool 5**, which informs the counselling rubric. [AAO adult eye evaluation](https://www.aao.org/Assets/1560bf29-4499-41fc-8569-b5b18cd8d210/636125702218170000/comprehensive-adult-medical-eye-evaluation-ppp-pdf) · [UW oral presentation guide](https://education.uwmedicine.org/somrural/wp-content/uploads/sites/3/2019/04/Outpatient_OralPresentationGuidelines.pdf) · [AHRQ teach-back](https://www.ahrq.gov/health-literacy/improve/precautions/tool5.html)

## Progress and report

The progress track includes Introduction, the four stations, feedback stops, and End. Request feedback previews the current station’s feedback. History, Examination, and Counselling open their feedback stops when finished. Finish Presentation goes directly to Counselling after confirmation. End displays and downloads the learner’s observations, exam record, and feedback. The report is generated in the browser.

The AOCLE red-eye pocket guide asks whether symptoms are “worse, better, or the same” under **Chief Complaint**. This supports a distinct progression question alongside onset, vision change, and light sensitivity. Live model trials check dialogue and rubric behavior when prompts or case facts change. Frontend-only edits can be verified with local interaction tests. [AOCLE red-eye pocket guide](https://aocle.org/wp-content/uploads/2022/09/Pocket-Guide-CL-related-red-eye.pdf)

The editable counselling agenda covers resolution, vision, first-line care, and follow-up. MedlinePlus says a chalazion “will often go away without treatment” under **Treatment**, and identifies warm compresses as the first treatment. The MSD Manual describes possible “slightly blurred vision” from a larger lesion in **Symptoms and Signs**. These topics inform Sarah’s questions, alongside the case findings and the taught plan. [MedlinePlus chalazion patient information](https://www.medlineplus.gov/ency/article/001006.htm) · [MSD Manual on chalazion](https://www.msdmanuals.com/professional/eye-disorders/eyelid-and-lacrimal-disorders/chalazion-and-hordeolum-stye)

### Examination media

Choose a named test or an eye hotspot. Image and video stations show the media before the learner records an interpretation. Written reference findings are available in feedback.

- The conjunctiva photograph shows the grade 1 panel from Sakamoto et al., Figure 5A. The original figure is displayed through a CSS crop to isolate that panel. [Source](https://pmc.ncbi.nlm.nih.gov/articles/PMC6403378/#Fig5) · [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
- The unmodified pupil light-test animation is by 01syhr. [Source](https://commons.wikimedia.org/wiki/File:Photopupillary_reflex.gif) · [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)
- The gaze test uses the publisher’s embedded video by Kathleen B. Digre, MD, and links to its source. [Moran CORE](https://morancore.utah.edu/section-05-neuro-ophthalmology/normal-eye-movements/)
- The anterior segment slit-beam reference is by Brice Critser, CRA, and Jesse Vislisel, MD, at EyeRounds. [Source and image permissions](https://eyerounds.org/atlas/pages/Normal-Cornea/)
