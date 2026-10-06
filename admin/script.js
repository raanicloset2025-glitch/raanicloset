const fs = require('fs');
let code = fs.readFileSync('src/components/BespokeEditor.tsx', 'utf-8');

code = code.replace(/HeroEditor/g, 'BespokeEditor');
code = code.replace(/HERO CANVAS/g, 'BESPOKE ATELIER');

code = code.replace(/clothing: \{[\s\S]*?\}/, \clothing: {
      videoVp9: '',
      imageAvif: '',
      eyebrow: 'THE ATELIER',
      title: 'Custom Tailoring',
      subtitle: 'Commission Your Custom Design',
      btnText: 'Begin Your Journey',
    }\);

code = code.replace(/jewelry: \{[\s\S]*?\}/, \jewelry: {
      videoVp9: '',
      imageAvif: '',
      eyebrow: 'THE ATELIER',
      title: 'Custom Jewelry',
      subtitle: 'Commission Your Heritage Piece',
      btnText: 'Begin Your Journey',
    }\);

code = code.replace(/fetch\('http:\/\/localhost:3000\/api\/store'\)[\s\S]*?\.catch\(console\.error\);/, \etch('http://localhost:3000/api/store')
      .then(res => res.json())
      .then(d => {
        if (!d) return;
        setData({
          clothing: {
            videoVp9: d.clothingBespokeVideo || '',
            imageAvif: d.clothingBespokeFallbackImage || d.clothingBespokeBg || '',
            eyebrow: d.bespokeEyebrow || 'The Atelier',
            title: d.clothingBespokeTitle || 'Custom Tailoring',
            subtitle: d.clothingBespokeSubtitle || 'Commission Your Custom Design',
            btnText: d.bespokeButtonText || 'Begin Your Journey',
          },
          jewelry: {
            videoVp9: d.jewelryBespokeVideo || '',
            imageAvif: d.jewelryBespokeFallbackImage || d.jewelryBespokeBg || '',
            eyebrow: d.bespokeEyebrow || 'The Atelier',
            title: d.jewelryBespokeTitle || 'Custom Jewelry',
            subtitle: d.jewelryBespokeSubtitle || 'Commission Your Heritage Piece',
            btnText: d.bespokeButtonText || 'Begin Your Journey',
          }
        });
      })
      .catch(console.error);\);

code = code.replace(/const payload = \{[\s\S]*?\};/g, \const payload = {
        ...existingData,
        clothingBespokeVideo: data.clothing.videoVp9,
        clothingBespokeFallbackImage: data.clothing.imageAvif,
        clothingBespokeBg: data.clothing.imageAvif,
        bespokeEyebrow: data.clothing.eyebrow,
        clothingBespokeTitle: data.clothing.title,
        clothingBespokeSubtitle: data.clothing.subtitle,
        bespokeButtonText: data.clothing.btnText,
        
        jewelryBespokeVideo: data.jewelry.videoVp9,
        jewelryBespokeFallbackImage: data.jewelry.imageAvif,
        jewelryBespokeBg: data.jewelry.imageAvif,
        jewelryBespokeTitle: data.jewelry.title,
        jewelryBespokeSubtitle: data.jewelry.subtitle,
      };\);

code = code.replace(/value=\{current\.line1\}/g, 'value={current.eyebrow}');
code = code.replace(/onChange=\{\(v\) => updateField\(\"line1\", v\)\}/g, 'onChange={(v) => updateField(\"eyebrow\", v)}');
code = code.replace(/label=\"Main Headline /g, 'label=\"Eyebrow Tag ');

code = code.replace(/value=\{current\.cursive\}/g, 'value={current.title}');
code = code.replace(/onChange=\{\(v\) => updateField\(\"cursive\", v\)\}/g, 'onChange={(v) => updateField(\"title\", v)}');
code = code.replace(/label=\"Cursive Subhead /g, 'label=\"Main Headline ');

code = code.replace(/value=\{current\.line3\}/g, 'value={current.subtitle}');
code = code.replace(/onChange=\{\(v\) => updateField\(\"line3\", v\)\}/g, 'onChange={(v) => updateField(\"subtitle\", v)}');
code = code.replace(/label=\"Body Text /g, 'label=\"Italic Subtitle ');

fs.writeFileSync('src/components/BespokeEditor.tsx', code);
