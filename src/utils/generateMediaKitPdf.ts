import { jsPDF } from 'jspdf'

export function generateMediaKitPdf() {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  })

  const pageWidth = 210
  const pageHeight = 297
  const margin = 16
  const contentWidth = pageWidth - margin * 2

  // ═══════════════════════════════════════════════════════════════════════════
  // PAGE 1: COVER, COMPANY FACT SHEET & PLATFORM CAPABILITIES
  // ═══════════════════════════════════════════════════════════════════════════

  // Header Banner Background
  doc.setFillColor(27, 42, 74) // Midnight Navy #1B2A4A
  doc.rect(0, 0, pageWidth, 42, 'F')

  // Accent Strip
  doc.setFillColor(252, 108, 38) // ExpeditionX Orange #FC6C26
  doc.rect(0, 40, pageWidth, 2.5, 'F')

  // Compass Icon Badge
  doc.setFillColor(252, 108, 38)
  doc.roundedRect(margin, 11, 14, 14, 3, 3, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.text('X', margin + 7, 21, { align: 'center' })

  // Brand Name in Header
  doc.setFontSize(22)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(255, 255, 255)
  doc.text('EXPEDITION', margin + 18, 20)
  const expWidth = doc.getTextWidth('EXPEDITION')
  doc.setTextColor(252, 108, 38)
  doc.text('X', margin + 18 + expWidth, 20)
  doc.setTextColor(255, 255, 255)
  doc.text(' AI', margin + 18 + expWidth + 4, 20)

  // Subheader Tagline
  doc.setFontSize(8.5)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(190, 200, 215)
  doc.text('OFFICIAL MEDIA KIT & CORPORATE FACT SHEET • 2026 EDITION', margin + 18, 27)

  // Document Title Badge
  doc.setFillColor(255, 255, 255, 0.1)
  doc.roundedRect(pageWidth - margin - 48, 12, 48, 12, 2, 2, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(7.5)
  doc.setFont('helvetica', 'bold')
  doc.text('PRESS & MEDIA RESOURCE', pageWidth - margin - 24, 19, { align: 'center' })

  // ── SECTION 1: ABOUT EXPEDITIONX AI ──
  let curY = 52
  doc.setTextColor(27, 42, 74)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('1. COMPANY OVERVIEW & MISSION', margin, curY)

  curY += 5
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(60, 60, 60)
  const introText =
    'ExpeditionX AI is an intelligent end-to-end travel platform engineered to unify the fragmented travel planning experience. Combining hyper-personalized AI itineraries, live multi-source cost estimation, offline route navigation, and integrated hotel/flight bookings, ExpeditionX transforms complex holiday planning from days into effortless seconds.'
  const splitIntro = doc.splitTextToSize(introText, contentWidth)
  doc.text(splitIntro, margin, curY)
  curY += splitIntro.length * 4.2 + 4

  // ── KEY METRICS / FACT SHEET GRID ──
  doc.setDrawColor(226, 232, 240)
  doc.setFillColor(248, 250, 252)
  doc.roundedRect(margin, curY, contentWidth, 38, 3, 3, 'FD')

  const colW = contentWidth / 4
  const stats = [
    { label: 'ACTIVE EXPLORERS', value: '100,000+', sub: 'Globally Distributed' },
    { label: 'ITINERARIES BUILT', value: '500,000+', sub: 'AI Optimized' },
    { label: 'GLOBAL COVERAGE', value: '40+ Countries', sub: '1,500+ Top Cities' },
    { label: 'COST ACCURACY', value: '98.6%', sub: 'Machine Learning Model' }
  ]

  stats.forEach((st, idx) => {
    const startX = margin + idx * colW
    if (idx > 0) {
      doc.setDrawColor(226, 232, 240)
      doc.line(startX, curY + 6, startX, curY + 32)
    }
    doc.setTextColor(100, 116, 139)
    doc.setFontSize(7)
    doc.setFont('helvetica', 'bold')
    doc.text(st.label, startX + colW / 2, curY + 11, { align: 'center' })

    doc.setTextColor(252, 108, 38)
    doc.setFontSize(13)
    doc.setFont('helvetica', 'bold')
    doc.text(st.value, startX + colW / 2, curY + 22, { align: 'center' })

    doc.setTextColor(71, 85, 105)
    doc.setFontSize(7.5)
    doc.setFont('helvetica', 'normal')
    doc.text(st.sub, startX + colW / 2, curY + 30, { align: 'center' })
  })

  curY += 46

  // ── SECTION 2: CORE PLATFORM PILLARS ──
  doc.setTextColor(27, 42, 74)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('2. CORE PRODUCT PILLARS', margin, curY)

  curY += 6
  const pillarW = (contentWidth - 8) / 3
  const pillars = [
    {
      title: 'AI Trip Wizard',
      tag: 'Proprietary ML',
      desc: 'Day-by-day autonomous scheduling factoring in traffic, operating hours, travel fatigue, and personalized interest weighting.'
    },
    {
      title: 'Live Cost Predictor',
      tag: 'Multi-Currency',
      desc: 'Real-time multi-variable pricing forecast covering stays, local transit, food, and entry passes with 98%+ historical accuracy.'
    },
    {
      title: 'Offline Navigator',
      tag: 'Dead-Zone Ready',
      desc: 'Zero-signal cached topographic navigation, crowd forecast heatmaps, and emergency SOS medical dispatch.'
    }
  ]

  pillars.forEach((p, i) => {
    const x = margin + i * (pillarW + 4)
    doc.setDrawColor(226, 232, 240)
    doc.setFillColor(255, 255, 255)
    doc.roundedRect(x, curY, pillarW, 46, 3, 3, 'FD')

    // Pillar Header Strip
    doc.setFillColor(252, 108, 38)
    doc.rect(x + 4, curY + 4, 3, 10, 'F')

    doc.setTextColor(27, 42, 74)
    doc.setFontSize(9.5)
    doc.setFont('helvetica', 'bold')
    doc.text(p.title, x + 10, curY + 11)

    // Tag
    doc.setFillColor(254, 243, 199)
    doc.roundedRect(x + 10, curY + 14, pillarW - 20, 5, 1, 1, 'F')
    doc.setTextColor(180, 83, 9)
    doc.setFontSize(6.5)
    doc.setFont('helvetica', 'bold')
    doc.text(p.tag.toUpperCase(), x + 12, curY + 17.5)

    // Description
    doc.setTextColor(71, 85, 105)
    doc.setFontSize(7.5)
    doc.setFont('helvetica', 'normal')
    const splitDesc = doc.splitTextToSize(p.desc, pillarW - 12)
    doc.text(splitDesc, x + 6, curY + 24)
  })

  curY += 54

  // ── SECTION 3: LEADERSHIP & PRESS CONTACT ──
  doc.setTextColor(27, 42, 74)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('3. LEADERSHIP & MEDIA CONTACT', margin, curY)

  curY += 6
  const boxW = (contentWidth - 6) / 2

  // Leadership Box
  doc.setDrawColor(226, 232, 240)
  doc.setFillColor(248, 250, 252)
  doc.roundedRect(margin, curY, boxW, 40, 3, 3, 'FD')

  doc.setTextColor(27, 42, 74)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text('Executive Leadership', margin + 6, curY + 8)

  doc.setTextColor(252, 108, 38)
  doc.setFontSize(8.5)
  doc.setFont('helvetica', 'bold')
  doc.text('Abhay Pratap', margin + 6, curY + 16)

  doc.setTextColor(71, 85, 105)
  doc.setFontSize(7.5)
  doc.setFont('helvetica', 'normal')
  doc.text('Founder & Chief Architect', margin + 6, curY + 21)
  doc.text('ExpeditionX AI Technologies', margin + 6, curY + 26)
  doc.text('HQ: Bangalore, India • Global Team', margin + 6, curY + 31)

  // Press Inquiries Box
  const rightX = margin + boxW + 6
  doc.setDrawColor(226, 232, 240)
  doc.setFillColor(248, 250, 252)
  doc.roundedRect(rightX, curY, boxW, 40, 3, 3, 'FD')

  doc.setTextColor(27, 42, 74)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text('Direct Press Contacts', rightX + 6, curY + 8)

  doc.setTextColor(71, 85, 105)
  doc.setFontSize(7.5)
  doc.setFont('helvetica', 'normal')
  doc.text('Email (Press): press@expeditionx.ai', rightX + 6, curY + 16)
  doc.text('Email (Partners): media@expeditionx.ai', rightX + 6, curY + 21)
  doc.text('Website: https://expeditionx.ai', rightX + 6, curY + 26)
  doc.text('Response SLA: Within 24 business hours', rightX + 6, curY + 31)

  // Page 1 Footer
  doc.setDrawColor(226, 232, 240)
  doc.line(margin, 280, pageWidth - margin, 280)
  doc.setTextColor(148, 163, 184)
  doc.setFontSize(7)
  doc.setFont('helvetica', 'normal')
  doc.text('ExpeditionX AI Media Kit • Confidential for Journalist & Media Use', margin, 285)
  doc.text('Page 1 of 2', pageWidth - margin, 285, { align: 'right' })

  // ═══════════════════════════════════════════════════════════════════════════
  // PAGE 2: BRAND ASSETS, COLOR PALETTE, TYPOGRAPHY & ASSET MANIFEST
  // ═══════════════════════════════════════════════════════════════════════════
  doc.addPage()

  // Header Banner Page 2
  doc.setFillColor(27, 42, 74)
  doc.rect(0, 0, pageWidth, 28, 'F')
  doc.setFillColor(252, 108, 38)
  doc.rect(0, 26, pageWidth, 2, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('EXPEDITIONX AI — BRAND IDENTITY & DESIGN TOKENS', margin, 17)

  let p2Y = 36

  // ── SECTION 4: COLOR PALETTE ──
  doc.setTextColor(27, 42, 74)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('4. OFFICIAL BRAND COLOR PALETTE', margin, p2Y)

  p2Y += 5
  const swatches = [
    { name: 'Expedition Orange', hex: '#FC6C26', rgb: '252, 108, 38', r: 252, g: 108, b: 38, role: 'Primary Accent' },
    { name: 'Midnight Navy', hex: '#1B2A4A', rgb: '27, 42, 74', r: 27, g: 42, b: 74, role: 'Brand Contrast' },
    { name: 'Onyx Black', hex: '#000000', rgb: '0, 0, 0', r: 0, g: 0, b: 0, role: 'Primary Type' },
    { name: 'Warm Canvas', hex: '#FFFBF7', rgb: '255, 251, 247', r: 255, g: 251, b: 247, role: 'Primary Background' },
    { name: 'Card Surface', hex: '#FFFFFF', rgb: '255, 255, 255', r: 255, g: 255, b: 255, role: 'Elevated Surface' }
  ]

  const swatchW = (contentWidth - 16) / 5
  swatches.forEach((sw, idx) => {
    const swX = margin + idx * (swatchW + 4)
    // Swatch box
    doc.setFillColor(sw.r, sw.g, sw.b)
    doc.setDrawColor(203, 213, 225)
    doc.roundedRect(swX, p2Y, swatchW, 20, 2, 2, 'FD')

    // Labels
    doc.setTextColor(27, 42, 74)
    doc.setFontSize(7.5)
    doc.setFont('helvetica', 'bold')
    doc.text(sw.name, swX, p2Y + 25)

    doc.setTextColor(100, 116, 139)
    doc.setFontSize(6.5)
    doc.setFont('helvetica', 'normal')
    doc.text(sw.hex, swX, p2Y + 29)
    doc.text(sw.role, swX, p2Y + 33)
  })

  p2Y += 41

  // ── SECTION 5: TYPOGRAPHY HIERARCHY ──
  doc.setTextColor(27, 42, 74)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('5. TYPOGRAPHY & FONT SPECIFICATIONS', margin, p2Y)

  p2Y += 5
  doc.setDrawColor(226, 232, 240)
  doc.setFillColor(248, 250, 252)
  doc.roundedRect(margin, p2Y, contentWidth, 36, 3, 3, 'FD')

  const typeRules = [
    { role: 'DISPLAY & HERO', font: 'Plus Jakarta Sans & Outfit (Bold 700 / Black 900)', usage: 'H1, H2, Key Metrics, Pricing' },
    { role: 'USER INTERFACE', font: 'Inter (SemiBold 600 / Medium 500)', usage: 'Buttons, Tabs, Navigation, Labels' },
    { role: 'EDITORIAL & BODY', font: 'Inter (Regular 400 / Medium 500)', usage: 'Guides, Reviews, Itinerary details' },
    { role: 'METADATA & CODE', font: 'JetBrains Mono (Regular 400)', usage: 'API endpoints, Timestamps, Flight numbers' }
  ]

  typeRules.forEach((tr, i) => {
    const rowY = p2Y + 8 + i * 7
    doc.setTextColor(252, 108, 38)
    doc.setFontSize(7)
    doc.setFont('helvetica', 'bold')
    doc.text(tr.role, margin + 6, rowY)

    doc.setTextColor(27, 42, 74)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.text(tr.font, margin + 40, rowY)

    doc.setTextColor(100, 116, 139)
    doc.setFontSize(7.5)
    doc.setFont('helvetica', 'normal')
    doc.text(tr.usage, margin + 125, rowY)
  })

  p2Y += 44

  // ── SECTION 6: LOGO USAGE & INTEGRITY ──
  doc.setTextColor(27, 42, 74)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('6. BRAND USAGE & LOGO GUIDELINES', margin, p2Y)

  p2Y += 5
  const halfW = (contentWidth - 6) / 2

  // Approved
  doc.setDrawColor(187, 247, 208)
  doc.setFillColor(240, 253, 244)
  doc.roundedRect(margin, p2Y, halfW, 36, 2, 2, 'FD')
  doc.setTextColor(22, 101, 52)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.text('APPROVED USAGE (DO)', margin + 6, p2Y + 7)

  doc.setTextColor(51, 65, 85)
  doc.setFontSize(7)
  doc.setFont('helvetica', 'normal')
  const dos = [
    '• Maintain minimum 16px clear space around wordmark',
    '• Use the full-color lockup on light backgrounds',
    '• Use white lockup with orange X on dark surfaces',
    '• Keep icon proportions 1:1 without vertical compression'
  ]
  dos.forEach((d, i) => doc.text(d, margin + 6, p2Y + 14 + i * 5))

  // Prohibited
  doc.setDrawColor(254, 202, 202)
  doc.setFillColor(254, 242, 242)
  doc.roundedRect(margin + halfW + 6, p2Y, halfW, 36, 2, 2, 'FD')
  doc.setTextColor(153, 27, 27)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.text('PROHIBITED USAGE (DON\'T)', margin + halfW + 12, p2Y + 7)

  doc.setTextColor(51, 65, 85)
  doc.setFontSize(7)
  doc.setFont('helvetica', 'normal')
  const donts = [
    '• Do not rotate or slant the compass symbol',
    '• Do not alter official hex codes or apply drop shadows',
    '• Do not place on busy un-dimmed photographic backgrounds',
    '• Do not abbreviate name to "ExpX" or "Exped"'
  ]
  donts.forEach((d, i) => doc.text(d, margin + halfW + 12, p2Y + 14 + i * 5))

  p2Y += 44

  // ── SECTION 7: MEDIA ASSETS PACKAGE MANIFEST ──
  doc.setTextColor(27, 42, 74)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('7. DOWNLOADABLE ASSETS INCLUDED', margin, p2Y)

  p2Y += 5
  doc.setDrawColor(226, 232, 240)
  doc.setFillColor(248, 250, 252)
  doc.roundedRect(margin, p2Y, contentWidth, 34, 3, 3, 'FD')

  const assetList = [
    { item: 'Vector Logos', format: 'SVG, PDF, EPS (CMYK & RGB)', size: 'Vector' },
    { item: 'High-Res App Screenshots', format: '4K Ultra PNG (Desktop & Mobile HUD)', size: '3840 x 2160' },
    { item: 'Leadership Headshots', format: 'Studio Portrait Photography (High DPI)', size: 'Print Ready' },
    { item: 'Product Architecture Deck', format: 'Interactive Slides & Benchmark Data', size: 'PDF / Slides' }
  ]

  assetList.forEach((al, i) => {
    const ay = p2Y + 7 + i * 6.5
    doc.setTextColor(252, 108, 38)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.text(`[FILE] ${al.item}`, margin + 6, ay)

    doc.setTextColor(71, 85, 105)
    doc.setFontSize(7.5)
    doc.setFont('helvetica', 'normal')
    doc.text(al.format, margin + 70, ay)

    doc.setTextColor(148, 163, 184)
    doc.setFontSize(7)
    doc.text(al.size, pageWidth - margin - 8, ay, { align: 'right' })
  })

  // Page 2 Footer
  doc.setDrawColor(226, 232, 240)
  doc.line(margin, 280, pageWidth - margin, 280)
  doc.setTextColor(148, 163, 184)
  doc.setFontSize(7)
  doc.setFont('helvetica', 'normal')
  doc.text('ExpeditionX AI Brand Guidelines • All Rights Reserved © 2026', margin, 285)
  doc.text('Page 2 of 2', pageWidth - margin, 285, { align: 'right' })

  // Trigger Save
  doc.save('ExpeditionX_AI_Media_Brand_Kit.pdf')
}
