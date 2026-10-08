import os
import glob
import re

components_dir = "admin/src/components"
files = glob.glob(os.path.join(components_dir, "*.tsx"))

pattern = r"(const store = useAdminStore\(\);)"
pattern_destruct = r"(const \{[\s\S]*?\} = useAdminStore\(\);)"

replacement = """  const [store, setStore] = React.useState<any>({});
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    setStore(useAdminStore.getState());
    
    useAdminStore.getState().fetchFromServer?.().then(() => {
      setStore(useAdminStore.getState());
    });

    const unsub = useAdminStore.subscribe((state: any) => {
      setStore(state);
    });
    return unsub;
  }, []);

  if (!mounted || !store.setBrandName) return null;"""

for file_path in files:
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    original = content
    if "const store = useAdminStore();" in content:
        content = content.replace("const store = useAdminStore();", replacement)
    else:
        # Check for destructured version
        match = re.search(pattern_destruct, content)
        if match:
            # this is harder, let's just do simple replacements manually
            continue
            
    if content != original:
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Fixed {file_path}")
