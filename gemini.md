# Space Realty Backend & Architectural Updates

## Knowledge & Regulation Learning Module
- **`/app/api/ai/explain-regulation/route.ts`**: A newly created API edge function designed to accept a POST request containing a learning module's raw text content and output an AI-simplified explanation of the real estate regulations, streamed back to the client. This handles the 'Explain Like I'm 5' feature in the dynamic learning pages (`/app/learn/[category]/[module-slug]/page.tsx`). Function uses a `ReadableStream` to simulate latency and chunked responses.

## Calculators Hub
- **`/app/calculators/page.tsx`**: Centralizes access to various financial planning tools (M-Value, Stamp Duty, MSR, TDSR, etc.). 

## Components Updated
- **`/components/layout/Navbar/NavMenu.tsx`**: Updated to replace the generic 'RESOURCES' link with a robust Dropdown Menu component. Refactored to ensure independent dropdown triggers for Residential, Commercial, and Resources, and reordered to place Resources after the News link.
- **`/components/learning/*`**: Created interactive client chunks `ModuleContent.tsx`, `ScenarioSimulator.tsx`, and `CommunityQA.tsx`.

## Bug Fixes & Lessons Learned

### Next.js Routing Conflict (Parallel Pages)
- **Issue**: Encountered a "parallel pages" error when using Route Groups `(learn)` and `(calculators)` with `page.tsx` directly inside them.
- **Cause**: Route groups are transparent in the URL structure. Putting a `page.tsx` at the top level of two different route groups caused them both to resolve to the root path (`/`), resulting in a build conflict.
- **Fix**: Replaced route groups with standard folders (`app/learn` and `app/calculators`). Standard folders ensure the path segment is included in the URL (e.g., `/learn`), avoiding root-level conflicts when multiple pages are needed.
- **Rule of Thumb**: Only use Route Groups for layout sharing or logical organization where no URL segment is desired. If the folder name should be part of the URL, use a standard folder.

### Navbar Dropdown Alignment
- **Issue**: Dropdown menus for Residential, Commercial, and Resources were all appearing in a fixed, shared position instead of under their respective buttons.
- **Cause**: The `NavigationMenu` component used a global `NavigationMenuViewport` which centers all dropdowns relative to the entire menu bar by default.
- **Fix**: Disabled the global viewport by setting `viewport={false}` on the `NavigationMenu`. Then, applied relative positioning and horizontal centering (`left-1/2 -translate-x-1/2`) to each `NavigationMenuContent`. This ensures each dropdown is decoupled and vertically aligned with the center of its parent button.

### Navbar Verification UI Refactor
- **Change**: Removed the static "Verified" badge and replaced it with a green ring around the user profile trigger and a dynamic "Verified" badge that appears next to the profile when the menu is open.
- **State Management**: Added `isUserMenuOpen` state using `useState` in `NavActions.tsx` and linked it to the `DropdownMenu`'s `onOpenChange` prop.
- **Logic**: The green border (`ring-2 ring-emerald-500`) is conditionally applied to the trigger based on the user's `isSingpassVerified` status. The "Verified" badge is conditionally rendered based on both `isSingpassVerified` and `isUserMenuOpen`.
- **Absolute Positioning Fix**: To prevent the navbar from shifting when the badge appears, the parent container was set to `relative` and the badge itself was set to `absolute left-full`. This allows the badge to "pop up" to the right of the profile button without affecting the position of neighboring elements like the Dashboard button or Notification bell.
- **Reasoning**: This provides a cleaner primary navigation while maintaining high visibility for trusted users upon interaction, without jarring layout shifts.
