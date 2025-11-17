# Design Guidelines: Metamorfose Vital Landing Page

## Design Approach
**Reference-Based Exact Replication**: This project requires pixel-perfect recreation of the provided Metamorfose Vital design. Every visual element, spacing, and component must match the reference images precisely.

## Typography System
- **Headlines**: Bold, high-impact typography with generous letter spacing
- **Primary Headline**: Extra bold weight, large scale (4-5rem desktop)
- **Section Titles**: Bold weight, medium-large scale (2.5-3rem)
- **Body Text**: Regular weight, comfortable reading size (1-1.125rem)
- **Buttons**: Bold uppercase text (0.875-1rem)
- Use Google Fonts: Montserrat (bold weights) for headlines, Open Sans for body

## Spacing System
Use Tailwind spacing units: **4, 6, 8, 12, 16, 24** for consistent rhythm
- Section padding: py-16 to py-24
- Component gaps: gap-6 to gap-8
- Card padding: p-6 to p-8
- Button padding: px-8 py-4

## Layout Structure

### 1. Hero Section
- Full-width background image (kitchen/healthy food scene)
- Logo positioned top-left: butterfly icon + "Metamorfose Vital" text
- Center-aligned content with headline emphasizing "5 kg em 3 semanas"
- Right-aligned image: nutritionist holding green apple (circular crop)
- Primary CTA button (blurred background overlay)
- Infinite logo ticker at bottom (seamless horizontal scroll)

### 2. Target Audience Section
- Two-column layout (md:grid-cols-2)
- Left: 2x2 grid of before/after transformation photos
- Right: List with butterfly icons, numbered items on semi-transparent background

### 3. Four Pillars Section
- Grid of 4 horizontal cards (lg:grid-cols-2)
- Each card: left-aligned image + text content
- Decorative kale leaf graphics in background
- Centered CTA button below grid

### 4. Modules Section
- Two-column layout (md:grid-cols-2)
- Left: Vertical accordion list (6 modules, expandable)
- Right: Laptop mockup displaying course interface
- Purple accent for highlighted text

### 5. Bonus Section
- Horizontal scrollable carousel
- Cards with professional headshots (circular), name, credentials
- Arrow navigation buttons
- CTA button centered below

### 6. How It Works Section
- 2x4 grid layout (md:grid-cols-4, sm:grid-cols-2)
- Icon + number + benefit text for each cell
- Decorative orange slice graphics
- Key features: 21 aulas, 3 mentorias, 10 bônus, etc.

### 7. Testimonials Section
- Horizontal carousel with testimonial cards
- Profile photo, name, star ratings, quote
- Arrow navigation
- Orange slice decorative elements
- CTA button below

### 8. Pricing Section
- Central white card with prominent pricing
- "12x R$29,56" or "À vista R$297,00"
- Countdown timer (purple background)
- Right column: checklist with butterfly icons
- Payment method badges below
- Primary CTA button

### 9. Guarantee Section
- Two-column layout
- Right: Large guarantee badge graphic
- Left: Explanatory text
- CTA button
- Payment badges
- Kale leaf decorative element

### 10. Instructor Section
- Two-column layout (reversed)
- Right: Large professional photo with smaller overlapping photo
- Left: Biography text, credentials
- Decorative kale leaf element

### 11. FAQ Section
- Two-column layout
- Right: Accordion with Q&A items
- Left: Contact cards (WhatsApp, Email) with icons

## Component Library

**Buttons**: Rounded corners (rounded-lg), bold text, generous padding, blurred background when over images

**Cards**: Subtle shadows, rounded corners (rounded-xl), consistent padding

**Icons**: Butterfly icons (brand mark), circular photo crops, payment badges, social icons

**Accordion**: Expandable sections with + icons, smooth transitions

**Carousel**: Horizontal scroll with arrow navigation, snap-scroll behavior

**Ticker**: Infinite horizontal scroll animation (seamless loop)

## Images

**Hero Background**: Kitchen scene with fresh vegetables, bright and inviting
**Instructor Photo**: Professional portrait holding green apple, circular crop
**Transformation Grid**: 4 before/after body transformation images
**Pillar Images**: Food/nutrition, exercise, rest, mindset visuals
**Laptop Mockup**: Course interface screenshot in device frame
**Professional Headshots**: Nutritionists/experts, circular crops
**Guarantee Badge**: 7-day seal/badge graphic
**Decorative Elements**: Kale leaves, orange slices as accents
**Payment Badges**: Credit card logos, security badges

## Special Elements

**Infinite Ticker**: Seamless horizontal scroll of logo repetitions at hero bottom
**Countdown Timer**: Urgency element with hours:minutes:seconds
**Star Ratings**: 5-star display in testimonials
**Butterfly Icons**: Consistent brand mark throughout checklists
**Accordion Interactions**: Smooth expand/collapse with rotation indicators

## Animations
Minimal and purposeful:
- Ticker: smooth infinite horizontal scroll
- Carousel: snap-scroll with arrow controls
- Accordion: expand/collapse transitions
- Hover states: subtle scale on cards/buttons