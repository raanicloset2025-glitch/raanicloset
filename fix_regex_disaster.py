import sys

with open("frontend/src/components/navbar/index.tsx", "r", encoding="utf-8") as f:
    code = f.read()

# The broken string that was injected:
broken_str = """    <>
      {/* Absolute Master Backgrounds for seamless transition without flickering */}
      <div className={`fixed inset-0 z-[-50] pointer-events-none transform-gpu transition-opacity duration-[1000ms] ease-in-out bg-[#F9F6F0] }></div>
      <div 
        className={`fixed inset-0 z-[-50] pointer-events-none transform-gpu transition-opacity duration-[1000ms] ease-in-out }
        style={{ background: 'radial-gradient(circle at 50% 20%, #1A090D 0%, #0D0406 55%, #050102 100%)' }}
      ></div>"""

# Let's fix the useEffect for rafId
if ") => cancelAnimationFrame(rafId);" in code:
    code = code.replace(broken_str + ") => cancelAnimationFrame(rafId);", "() => cancelAnimationFrame(rafId);")

# Let's fix the useEffect for keydown
if ") => window.removeEventListener('keydown', handleGlobalKeyDown);" in code:
    code = code.replace(broken_str + ") => window.removeEventListener('keydown', handleGlobalKeyDown);", "() => window.removeEventListener('keydown', handleGlobalKeyDown);")

# The component return also has the broken string, but that one was actually intended (sort of, but it has broken syntax because of my regex missing the `${!isJewelry...` parts)
# Wait, let's just find the main component return and replace it with a clean version!
# Let's clean the entire file manually using regex for the main return.
main_return_marker = "  return (\n" + broken_str
# Let's replace it with a properly formatted React fragment and background divs.
proper_bg = """  return (
    <>
      {/* Absolute Master Backgrounds for seamless transition without flickering */}
      <div className={`fixed inset-0 z-[-50] pointer-events-none transform-gpu transition-opacity duration-[1000ms] ease-in-out bg-[#F9F6F0] ${!isJewelry ? 'opacity-100' : 'opacity-0'}`}></div>
      <div 
        className={`fixed inset-0 z-[-50] pointer-events-none transform-gpu transition-opacity duration-[1000ms] ease-in-out ${isJewelry ? 'opacity-100' : 'opacity-0'}`}
        style={{ background: 'radial-gradient(circle at 50% 20%, #1A090D 0%, #0D0406 55%, #050102 100%)' }}
      ></div>
"""
if main_return_marker in code:
    code = code.replace(main_return_marker, proper_bg)

with open("frontend/src/components/navbar/index.tsx", "w", encoding="utf-8") as f:
    f.write(code)

print("Fixed the disastrous regex replacement.")
