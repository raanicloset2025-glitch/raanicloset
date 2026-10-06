# Admin Panel: Navbar CMS Architecture

Humara Frontend (`localhost:3000`) aur Admin Panel (`localhost:3001`) ab 100% separate hain. Admin ka kaam sirf edit karke changes ko Store (Zustand/JSON) mein save karna hai.

## 1. Clean & Simple UI Strategy (Notion/Shopify style)
Aapko clean aur simple UI chahiye, isliye hum ekdum flat, minimal design use karenge:
- **Background**: Pure white/off-white (`#F9F9F9`).
- **Sidebar**: Very clean left sidebar with just text links (Dashboard, Navbar, Hero, Products).
- **Editor Area**: Minimalist input fields, clean borders. No heavy shadows, no dark mode by default.

## 2. Navbar Editable Features (Research Scope)
Humare 3 AI agents frontend code padh rahe hain, par basic structure jo hum editable banayenge wo ye hoga:

### A. Global Settings
- **Navbar Theme Toggle**: Dark mode (glass effect) vs Light mode.
- **Logo**: Text Logo (Typeable) vs Image Upload (URL).

### B. Top Navbar (Utility Bar)
- Left Text (e.g., "COMPLIMENTARY SHIPPING...")
- Right Links (Track Order, Help, Contact).

### C. Main Navigation (Desktop & Mobile)
- **Menu Items**: Drag & Drop list of links (Clothing, Jewelry, Bespoke).
- **Toggle Button**: Enable/Disable the middle Pill toggle (Clothing vs Jewelry).

## 3. Separation of Concerns
- **Admin**: Updates data in `raani-admin-storage`.
- **Frontend**: Sirf `raani-admin-storage` se read karega aur display karega. No editing code in frontend.

---

> [!NOTE] 
> Image Quota limit hit ho gaya hai isliye main naye AI images generate nahi kar paa raha. Main seedha yeh clean UI aapke Admin panel ke code mein hi bana dunga taaki aap live dekh sakein!
