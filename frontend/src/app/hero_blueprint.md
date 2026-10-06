# 10-AI Blueprint: Cinematic Hero Section

## 1. The Core Vision (Brand Storyteller)
Aapne jo image bheji hai, uski vibe bahut deep, moody aur emotional hai (Dark floral aesthetics). Aap chahte ho ki text ek hi sentence ho, lamba choda paragraph na ho.
**Chosen Core Sentence:** *"Bringing stories of love & emotion to real life."* (Ya phir *"Building communities. Crafting magic."*)
Yeh ek sentence aapke brand ka soul define karega.

## 2. Visual Vibe (Cinematographer)
Background mein hum ek **Cinematic Dark Floral** theme use karenge. Yeh ekdum pitch black nahi hoga, balki deep charcoal aur rich burgundy black ka gradient hoga. Iske upar ek subtle, slow-moving texture ya parallax effect hoga jisse lage ki screen ke peeche depth hai.

## 3. Typography Architect
Font ka combination bahut zaroori hai.
- Base font: **Royal (Cinzel)** - Sharp, luxury, uppercase.
- Accent font: **Painter (Great Vibes)** - Fluid, emotional, cursive.
*Example:* "BRINGING STORIES OF" (Royal) + *"love & emotion"* (Painter) + "TO REAL LIFE." (Royal).

## 4. The "Rotate" Animation (Motion Director)
Aapne kaha "rotate kar ke aya". Isko hum sasta 2D spin nahi banayenge. Hum **3D Spatial Rotation** use karenge.
- **The Spiral Unfold (Petal Effect):** Har letter peeche se (Z-axis se) gol ghumte hue (3D barrel roll) aage aayega aur apni jagah par lock hoga. 
- **The Cylinder Spin:** Aisa lagega jaise ek invisible cylinder ghum raha hai aur text uske upar chipka hua hai. Jab wo front face par aayega, tabhi padhne mein aayega.
- Yeh CSS `perspective: 1000px`, `rotateX`, aur `translateZ` ko combine karke banaya jayega, jisse ekdum Hollywood movie title jaisa feel aayega.

## 5. Lighting & Glint (Lighting Designer)
Jaise hi text ghum kar aage aayega, uske upar ek **Golden/Rose-Gold shimmer** sweep karega. (Kyunki dark background par text ko stand out karna hai). Hum `mix-blend-mode: overlay` aur text-clipping ka use karenge.

## 6. Scroll Interaction (UX Psychologist)
Hero section sirf ek static animation nahi hoga. Jab user apna phone (ya mouse) scroll karega, toh wo ek sentence wapas 3D mein piche ki taraf rotate hoke gayab ho jayega, aur neeche ka actual clothing/jewelry content upar slide hoga. Yeh user ko engage karke rakhega.

## 7. Performance (The Engineer)
Itne heavy 3D rotation animations mobile ki battery pee jate hain agar sahi se na likhe jayein. Isliye hum:
- JavaScript (setInterval) ka use bilkul nahi karenge.
- 100% **Hardware-Accelerated CSS Animations** (`transform-gpu`, `will-change: transform`) ka use karenge taaki 120Hz display wale phones par makkhan jaisa smooth chale.

## 8. Theme Sync (The Architect)
Jaise humne Navbar mein `isJewelry` toggle banaya tha, Hero section bhi uske hisaab se react karega.
- **Clothing Mode:** Background thoda Deep Rose/Burgundy touch mein hoga.
- **Jewelry Mode:** Background ekdum Midnight Black / Sapphire touch mein chala jayega, aur text silver/platinum jaisa glow karega.

---

### Do you approve this blueprint?
Agar aapko yeh idea aur 3D rotation wala concept pasand hai, toh main iska code likhna shuru karu aur `page.tsx` mein jo "Dummy Placeholder" tha, uski jagah yeh Cinematic Hero Section daal du?
