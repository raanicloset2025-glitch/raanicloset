import sys

with open('admin/src/app/page.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace('JSON.parse(authData).session.access_token', 'JSON.parse(authData).access_token || JSON.parse(authData).session?.access_token')

old_err = 'setPublishMessage("\u26A0 Failed to publish changes.");'
new_err = 'res.json().catch(()=>({})).then(errData => setPublishMessage(`\u26A0 Failed: ${errData.error || res.statusText}`));'

if old_err in c:
    c = c.replace(old_err, new_err)
else:
    print("Old error not found!")

with open('admin/src/app/page.tsx', 'w', encoding='utf-8') as f:
    f.write(c)
