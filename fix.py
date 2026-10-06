import sys

with open('frontend/src/components/navbar/index.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Fix 1: Clothing Wordmark
code = code.replace(
    'antialiased style={{ textShadow: "0 2px 6px rgba(224,162,156,0.25)" }} ${',
    'antialiased ${'
)
code = code.replace(
    '<span className={`font-painter text-[36px] bg-gradient-to-r from-[#2A1E1E] to-[#603D3D] text-transparent bg-clip-text leading-[0.8] tracking-wide antialiased ${!isJewelry ? \'animate-ink-sweep\' : \'\'}`}>',
    '<span className={`font-painter text-[36px] bg-gradient-to-r from-[#2A1E1E] to-[#603D3D] text-transparent bg-clip-text leading-[0.8] tracking-wide antialiased ${!isJewelry ? \'animate-ink-sweep\' : \'\'}`} style={{ textShadow: "0 2px 6px rgba(224,162,156,0.25)"}}>'
)

# Fix 2: Jewelry Wordmark
code = code.replace(
    'antialiased style={{ textShadow: "0 0 8px rgba(255,255,255,0.3)" }} relative',
    'antialiased relative'
)
code = code.replace(
    '<span className="font-painter text-[36px] bg-gradient-to-r from-slate-300 via-white to-slate-400 text-transparent bg-clip-text leading-[0.8] tracking-wide antialiased relative">',
    '<span className="font-painter text-[36px] bg-gradient-to-r from-slate-300 via-white to-slate-400 text-transparent bg-clip-text leading-[0.8] tracking-wide antialiased relative" style={{ textShadow: "0 0 8px rgba(255,255,255,0.3)"}}>'
)

# Fix 3: High Jewels Text
code = code.replace(
    'uppercase style={{ textShadow: "0 2px 4px rgba(0,0,0,0.9)" }} backdrop-blur',
    'uppercase backdrop-blur'
)
code = code.replace(
    '<span className="font-royal italic text-[11px] tracking-[0.25em] text-slate-300/95 mt-1.5 uppercase backdrop-blur-[1px]">High Jewels</span>',
    '<span className="font-royal italic text-[11px] tracking-[0.25em] text-slate-300/95 mt-1.5 uppercase backdrop-blur-[1px]" style={{ textShadow: "0 2px 4px rgba(0,0,0,0.9)"}}>High Jewels</span>'
)

with open('frontend/src/components/navbar/index.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
print('Done!')
