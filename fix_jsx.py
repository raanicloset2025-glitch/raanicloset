import sys

with open('frontend/src/components/navbar/index.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Fix the PowerShell escaped backticks
code = code.replace("className={\x0cixed", "className={`fixed")

# Ensure the return block is wrapped in a React Fragment <> ... </>
# Look for: return (
#       {/* Absolute
if "return (\n      {/* Absolute" in code:
    code = code.replace("return (\n      {/* Absolute", "return (\n    <>\n      {/* Absolute")
    
    # We also need to add </> at the end. Find the last </nav>
    # Since there is a lot of code, the safest way is to find the final </nav>
    last_nav_idx = code.rfind("</nav>\n")
    if last_nav_idx != -1:
        # replace the last </nav>\n with </nav>\n    </>\n
        code = code[:last_nav_idx] + "</nav>\n    </>\n" + code[last_nav_idx+7:]

with open('frontend/src/components/navbar/index.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Fixed JSX Syntax")
