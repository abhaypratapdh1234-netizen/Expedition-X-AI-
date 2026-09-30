import React, { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Download, Printer, Trash2, ShieldCheck, CheckCircle2, QrCode, FileText, ExternalLink, Calendar, MapPin, Building, Plane, Clock, User, AlertTriangle, Check, Loader2 } from 'lucide-react'
import { jsPDF } from 'jspdf'

export interface TripDocItem {
  id: string
  name: string
  icon: string
  status: 'required' | 'uploaded'
  category: 'government_id' | 'ticket' | 'hotel' | 'other'
  fileName?: string
  fileType?: string
  fileSize?: string
  fileData?: string
  uploadedAt?: string
  isSystemDefault?: boolean
}

interface TripDocumentViewerModalProps {
  isOpen: boolean
  onClose: () => void
  doc: TripDocItem | null
  onDelete: (docId: string) => void
  passengerName?: string
  tripTitle?: string
  tripDestination?: string
}

// ── PDF Helper: Authentic QR Matrix ──────────────────────────────────────────
function drawVectorQr(doc: jsPDF, startX: number, startY: number, size: number) {
  const cells = 21
  const cell = size / cells

  // Background white box
  doc.setFillColor(255, 255, 255)
  doc.rect(startX, startY, size, size, 'F')

  // Dark pattern color
  doc.setFillColor(15, 23, 42)

  // 3 Corner Finder Patterns (7x7 outer, 5x5 inner white, 3x3 inner dark)
  const drawFinder = (ox: number, oy: number) => {
    doc.setFillColor(15, 23, 42)
    doc.rect(ox, oy, cell * 7, cell * 7, 'F')
    doc.setFillColor(255, 255, 255)
    doc.rect(ox + cell, oy + cell, cell * 5, cell * 5, 'F')
    doc.setFillColor(15, 23, 42)
    doc.rect(ox + cell * 2, oy + cell * 2, cell * 3, cell * 3, 'F')
  }

  drawFinder(startX, startY)
  drawFinder(startX + cell * 14, startY)
  drawFinder(startX, startY + cell * 14)

  // Timing lines
  doc.setFillColor(15, 23, 42)
  for (let i = 8; i < 13; i += 2) {
    doc.rect(startX + cell * i, startY + cell * 6, cell, cell, 'F')
    doc.rect(startX + cell * 6, startY + cell * i, cell, cell, 'F')
  }

  // Realistic QR data dots
  const seed = [
    [8, 2], [9, 3], [10, 2], [11, 4], [12, 1], [13, 3],
    [2, 8], [3, 9], [4, 10], [5, 12], [6, 13],
    [8, 8], [9, 9], [10, 10], [11, 11], [12, 12],
    [8, 14], [9, 15], [10, 17], [11, 18], [12, 20],
    [14, 8], [15, 9], [16, 11], [17, 12], [19, 8], [20, 9],
    [14, 14], [15, 15], [16, 14], [17, 16], [18, 17], [19, 18], [20, 20],
    [15, 2], [17, 3], [19, 4], [2, 15], [3, 17], [4, 19],
    [14, 2], [16, 4], [18, 1], [20, 3], [14, 18], [16, 20], [18, 15], [20, 17]
  ]
  seed.forEach(([cx, cy]) => {
    doc.rect(startX + cell * cx, startY + cell * cy, cell, cell, 'F')
  })
}

// ── PDF Helper: Aviation Barcode ──────────────────────────────────────────────
function drawBarcode(doc: jsPDF, startX: number, startY: number, width: number, height: number) {
  doc.setFillColor(15, 23, 42)
  const pattern = [2, 1, 3, 1, 1, 2, 4, 1, 2, 3, 1, 2, 1, 3, 2, 1, 4, 1, 2, 1, 3, 2, 1, 1, 3, 2, 1, 4, 2, 1, 3, 1, 2, 1, 2]
  let cur = startX
  const sum = pattern.reduce((a, b) => a + b, 0)
  const scale = width / sum
  pattern.forEach((w, idx) => {
    if (idx % 2 === 0) {
      doc.rect(cur, startY, w * scale, height, 'F')
    }
    cur += w * scale
  })
}

// ── PDF Generator: Official Hotel Booking Voucher ─────────────────────────────
function generateHotelVoucherPdf(passengerName: string, tripTitle: string, fileName?: string) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  })

  const pageWidth = 210
  const margin = 15
  const cardW = 180

  // Outer Card
  doc.setDrawColor(226, 232, 240)
  doc.setFillColor(255, 255, 255)
  doc.roundedRect(margin, 16, cardW, 262, 5, 5, 'FD')

  // Top Orange Accent Bar
  doc.setFillColor(252, 108, 38)
  doc.roundedRect(margin, 16, cardW, 3.5, 2, 2, 'F')

  // Brand Header
  doc.setFillColor(252, 108, 38)
  doc.roundedRect(24, 26, 11, 11, 2.5, 2.5, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text('EX', 29.5, 33.5, { align: 'center' })

  doc.setTextColor(252, 108, 38)
  doc.setFontSize(7.5)
  doc.setFont('helvetica', 'bold')
  doc.text('EXPEDITIONX STAYS', 38, 29)

  doc.setTextColor(15, 23, 42)
  doc.setFontSize(15)
  doc.setFont('helvetica', 'bold')
  doc.text('Official Hotel Booking Voucher', 38, 36)

  // Status Badge: Confirmed & Paid (Black pill)
  doc.setFillColor(0, 0, 0)
  doc.roundedRect(138, 25, 46, 7.5, 3.5, 3.5, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(7.5)
  doc.setFont('helvetica', 'bold')
  doc.text('CONFIRMED & PAID', 161, 30, { align: 'center' })

  // Booking Ref
  doc.setTextColor(100, 116, 139)
  doc.setFontSize(8)
  doc.setFont('courier', 'bold')
  doc.text('Ref: #EX-HYATT-882194', 184, 38, { align: 'right' })

  // Top Section Divider
  doc.setDrawColor(241, 245, 249)
  doc.line(24, 43, 186, 43)

  // Accommodation Card Box
  doc.setFillColor(248, 250, 252)
  doc.setDrawColor(226, 232, 240)
  doc.roundedRect(24, 48, 162, 36, 3, 3, 'FD')

  // Hotel Name & Address
  doc.setTextColor(15, 23, 42)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('Grand Hyatt Resort & Residences', 30, 58)

  doc.setTextColor(71, 85, 105)
  doc.setFontSize(8.5)
  doc.setFont('helvetica', 'normal')
  doc.text('Bambolim Beach, North Goa, 403206, India', 30, 66)

  doc.setTextColor(100, 116, 139)
  doc.setFontSize(8)
  doc.text('Front Desk Hotline: +91 832 664 1234', 30, 74)

  // Right Side Accommodation Meta
  doc.setTextColor(100, 116, 139)
  doc.setFontSize(7.5)
  doc.setFont('helvetica', 'bold')
  doc.text('ACCOMMODATION', 180, 56, { align: 'right' })

  doc.setTextColor(15, 23, 42)
  doc.setFontSize(9.5)
  doc.setFont('helvetica', 'bold')
  doc.text('Ocean View Suite (King Bed)', 180, 64, { align: 'right' })

  doc.setTextColor(15, 23, 42)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text('Complimentary Breakfast Included', 180, 72, { align: 'right' })

  // 4-Column Grid
  doc.setDrawColor(226, 232, 240)
  doc.line(24, 91, 186, 91)

  // Col 1: Lead Guest
  doc.setTextColor(100, 116, 139)
  doc.setFontSize(7)
  doc.setFont('helvetica', 'bold')
  doc.text('LEAD GUEST', 26, 98)
  doc.setTextColor(15, 23, 42)
  doc.setFontSize(9.5)
  doc.setFont('helvetica', 'bold')
  doc.text(passengerName, 26, 105)
  doc.setTextColor(100, 116, 139)
  doc.setFontSize(7.5)
  doc.setFont('helvetica', 'normal')
  doc.text('Adult (Primary)', 26, 111)

  // Col 2: Check-in
  doc.setTextColor(100, 116, 139)
  doc.setFontSize(7)
  doc.setFont('helvetica', 'bold')
  doc.text('CHECK-IN', 68, 98)
  doc.setTextColor(15, 23, 42)
  doc.setFontSize(9.5)
  doc.setFont('helvetica', 'bold')
  doc.text('Oct 24, 2026', 68, 105)
  doc.setTextColor(100, 116, 139)
  doc.setFontSize(7.5)
  doc.setFont('helvetica', 'normal')
  doc.text('From 14:00 hrs', 68, 111)

  // Col 3: Check-out
  doc.setTextColor(100, 116, 139)
  doc.setFontSize(7)
  doc.setFont('helvetica', 'bold')
  doc.text('CHECK-OUT', 110, 98)
  doc.setTextColor(15, 23, 42)
  doc.setFontSize(9.5)
  doc.setFont('helvetica', 'bold')
  doc.text('Oct 27, 2026', 110, 105)
  doc.setTextColor(100, 116, 139)
  doc.setFontSize(7.5)
  doc.setFont('helvetica', 'normal')
  doc.text('Until 11:00 hrs', 110, 111)

  // Col 4: Stay Duration
  doc.setTextColor(100, 116, 139)
  doc.setFontSize(7)
  doc.setFont('helvetica', 'bold')
  doc.text('STAY DURATION', 150, 98)
  doc.setTextColor(15, 23, 42)
  doc.setFontSize(9.5)
  doc.setFont('helvetica', 'bold')
  doc.text('3 Nights', 150, 105)
  doc.setTextColor(15, 23, 42)
  doc.setFontSize(7.5)
  doc.setFont('helvetica', 'bold')
  doc.text('1 Room • 2 Guests', 150, 111)

  doc.line(24, 117, 186, 117)

  // Package Inclusions
  doc.setTextColor(51, 65, 85)
  doc.setFontSize(8.5)
  doc.setFont('helvetica', 'bold')
  doc.text('PACKAGE INCLUSIONS & BENEFITS:', 26, 126)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(71, 85, 105)

  const inclusions = [
    '• Welcome Drink on Arrival & Daily Gourmet Buffet Breakfast for all registered guests.',
    '• Complimentary high-speed Wi-Fi & access to Infinity Pool and 24/7 Fitness Center.',
    '• Complimentary Airport Chauffeur transfer to and from Manohar International Airport (MOPA).',
    '• All Government Luxury and Goods & Services Taxes (GST) are fully paid and settled in advance.'
  ]

  let incY = 134
  inclusions.forEach(inc => {
    doc.text(inc, 26, incY)
    incY += 7
  })

  // Important Guest Instructions
  doc.setFillColor(254, 242, 242)
  doc.setDrawColor(254, 202, 202)
  doc.roundedRect(24, 166, 162, 17, 2, 2, 'FD')
  doc.setTextColor(153, 27, 27)
  doc.setFontSize(7.5)
  doc.setFont('helvetica', 'bold')
  doc.text('CHECK-IN INSTRUCTIONS:', 28, 172)
  doc.setFont('helvetica', 'normal')
  doc.text('Please present this official PDF voucher along with original government photo ID (Passport / Aadhaar) at the reception desk.', 28, 178)

  // Security Seal & Total Settlement Box
  doc.setFillColor(248, 250, 252)
  doc.setDrawColor(226, 232, 240)
  doc.roundedRect(24, 189, 162, 54, 3, 3, 'FD')

  // QR Code
  drawVectorQr(doc, 30, 195, 26)

  // Seal Info
  doc.setTextColor(15, 23, 42)
  doc.setFontSize(9.5)
  doc.setFont('helvetica', 'bold')
  doc.text('Instant Verification Seal', 62, 205)

  doc.setTextColor(100, 116, 139)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  const sealText = 'Scan at hotel reception or present valid Photo ID (Aadhaar/Passport) at check-in for instant biometric verification.'
  doc.text(doc.splitTextToSize(sealText, 64), 62, 212)

  // Total Settlement
  doc.setTextColor(100, 116, 139)
  doc.setFontSize(7.5)
  doc.setFont('helvetica', 'bold')
  doc.text('TOTAL AMOUNT PAID', 180, 205, { align: 'right' })

  doc.setTextColor(15, 23, 42)
  doc.setFontSize(21)
  doc.setFont('helvetica', 'bold')
  doc.text('Rs. 48,500', 180, 218, { align: 'right' })

  doc.setTextColor(15, 23, 42)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.text('100% FULLY SETTLED', 180, 226, { align: 'right' })

  // Footer Metadata
  doc.setTextColor(148, 163, 184)
  doc.setFontSize(7.5)
  doc.setFont('helvetica', 'normal')
  doc.text('Offline-Encrypted Vault Protocol • Persistent Account Storage', pageWidth / 2, 256, { align: 'center' })
  doc.text(`Official Travel Dispatch • Trip #${tripTitle}`, pageWidth / 2, 261, { align: 'center' })

  const outName = fileName?.endsWith('.pdf') ? fileName : 'Grand_Hyatt_Resort_Voucher.pdf'
  doc.save(outName)
}

// ── PDF Generator: Official Electronic Flight Ticket ──────────────────────────
function generateFlightTicketPdf(passengerName: string, tripTitle: string, fileName?: string) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  })

  const pageWidth = 210
  const margin = 15
  const cardW = 180

  // Outer Card
  doc.setDrawColor(226, 232, 240)
  doc.setFillColor(255, 255, 255)
  doc.roundedRect(margin, 16, cardW, 262, 5, 5, 'FD')

  // Navy Header Banner
  doc.setFillColor(15, 23, 42)
  doc.roundedRect(margin, 16, cardW, 76, 5, 5, 'F')
  // Fill square corners where header meets divider
  doc.rect(margin, 80, cardW, 12, 'F')

  // Flight Tag & Title
  doc.setTextColor(147, 197, 253)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.text('INDIGO AIRLINES • 6E-204', 24, 27)

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('Electronic Flight Ticket', 24, 35)

  // PNR & Confirmed Badge (Black pill)
  doc.setTextColor(191, 219, 254)
  doc.setFontSize(8.5)
  doc.setFont('courier', 'bold')
  doc.text('PNR: EXP982X', 186, 27, { align: 'right' })

  doc.setFillColor(0, 0, 0)
  doc.setDrawColor(255, 255, 255)
  doc.roundedRect(154, 31, 32, 6.5, 3, 3, 'FD')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(7.5)
  doc.setFont('helvetica', 'bold')
  doc.text('CONFIRMED', 170, 35.5, { align: 'center' })

  // Route Section: BOM -> GOI
  // Left: BOM
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(24)
  doc.setFont('courier', 'bold')
  doc.text('BOM', 26, 57)

  doc.setTextColor(191, 219, 254)
  doc.setFontSize(8.5)
  doc.setFont('helvetica', 'normal')
  doc.text('Mumbai (T2)', 26, 64)

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('10:15 AM', 26, 73)

  // Center: Flight Path
  doc.setTextColor(147, 197, 253)
  doc.setFontSize(7.5)
  doc.setFont('helvetica', 'bold')
  doc.text('1H 20M NON-STOP', 105, 52, { align: 'center' })

  // Route Dotted Line
  doc.setDrawColor(147, 197, 253)
  doc.setLineDashPattern([1.5, 1.5], 0)
  doc.line(64, 62, 146, 62)
  doc.setLineDashPattern([], 0)

  // Center Airplane Node
  doc.setFillColor(255, 255, 255)
  doc.circle(105, 62, 3.5, 'F')
  doc.setTextColor(15, 23, 42)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.text('>', 105, 64, { align: 'center' })

  doc.setTextColor(147, 197, 253)
  doc.setFontSize(7.5)
  doc.setFont('helvetica', 'normal')
  doc.text('Airbus A321neo', 105, 73, { align: 'center' })

  // Right: GOI
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(24)
  doc.setFont('courier', 'bold')
  doc.text('GOI', 184, 57, { align: 'right' })

  doc.setTextColor(191, 219, 254)
  doc.setFontSize(8.5)
  doc.setFont('helvetica', 'normal')
  doc.text('Goa Dabolim', 184, 64, { align: 'right' })

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('11:35 AM', 184, 73, { align: 'right' })

  // Perforated Divider
  doc.setFillColor(248, 250, 252)
  doc.rect(margin, 92, cardW, 8, 'F')
  doc.setDrawColor(203, 213, 225)
  doc.setLineDashPattern([2, 2], 0)
  doc.line(margin + 4, 96, margin + cardW - 4, 96)
  doc.setLineDashPattern([], 0)

  // 4-Column Boarding Details
  // Col 1: Passenger
  doc.setTextColor(100, 116, 139)
  doc.setFontSize(7)
  doc.setFont('helvetica', 'bold')
  doc.text('PASSENGER', 24, 110)
  doc.setTextColor(15, 23, 42)
  doc.setFontSize(9.5)
  doc.setFont('helvetica', 'bold')
  doc.text(passengerName.toUpperCase(), 24, 117)
  doc.setTextColor(100, 116, 139)
  doc.setFontSize(7.5)
  doc.setFont('helvetica', 'normal')
  doc.text('Seat 4A • Window', 24, 123)

  // Col 2: Date
  doc.setTextColor(100, 116, 139)
  doc.setFontSize(7)
  doc.setFont('helvetica', 'bold')
  doc.text('DATE', 68, 110)
  doc.setTextColor(15, 23, 42)
  doc.setFontSize(9.5)
  doc.setFont('helvetica', 'bold')
  doc.text('Oct 24, 2026', 68, 117)
  doc.setTextColor(100, 116, 139)
  doc.setFontSize(7.5)
  doc.setFont('helvetica', 'normal')
  doc.text('Saturday', 68, 123)

  // Col 3: Boarding Time (Orange bold standout)
  doc.setTextColor(100, 116, 139)
  doc.setFontSize(7)
  doc.setFont('helvetica', 'bold')
  doc.text('BOARDING TIME', 110, 110)
  doc.setTextColor(252, 108, 38)
  doc.setFontSize(10.5)
  doc.setFont('helvetica', 'bold')
  doc.text('09:30 AM', 110, 117)
  doc.setTextColor(100, 116, 139)
  doc.setFontSize(7.5)
  doc.setFont('helvetica', 'normal')
  doc.text('Gate Closes 09:55 AM', 110, 123)

  // Col 4: Gate / Terminal
  doc.setTextColor(100, 116, 139)
  doc.setFontSize(7)
  doc.setFont('helvetica', 'bold')
  doc.text('GATE / TERMINAL', 150, 110)
  doc.setTextColor(15, 23, 42)
  doc.setFontSize(9.5)
  doc.setFont('helvetica', 'bold')
  doc.text('Gate B12', 150, 117)
  doc.setTextColor(100, 116, 139)
  doc.setFontSize(7.5)
  doc.setFont('helvetica', 'normal')
  doc.text('Terminal 2', 150, 123)

  // Baggage & Amenities Bar
  doc.setFillColor(248, 250, 252)
  doc.setDrawColor(226, 232, 240)
  doc.roundedRect(24, 132, 162, 18, 3, 3, 'FD')

  doc.setTextColor(15, 23, 42)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.text('Baggage Allowance:', 28, 143)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(71, 85, 105)
  doc.text('Cabin 7 Kg • Check-in 25 Kg', 59, 143)

  doc.setTextColor(15, 23, 42)
  doc.setFont('helvetica', 'bold')
  doc.text('Class:', 108, 143)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(71, 85, 105)
  doc.text('Business / Comfort Plus', 118, 143)

  doc.setTextColor(15, 23, 42)
  doc.setFont('helvetica', 'bold')
  doc.text('Meal: Complimentary Warm Meal', 182, 143, { align: 'right' })

  // Security & Aviation Barcode Strip
  doc.setFillColor(248, 250, 252)
  doc.setDrawColor(226, 232, 240)
  doc.roundedRect(24, 158, 162, 54, 3, 3, 'FD')

  // QR Code
  drawVectorQr(doc, 30, 164, 24)

  // Passenger Aviation String
  doc.setTextColor(15, 23, 42)
  doc.setFontSize(8)
  doc.setFont('courier', 'bold')
  doc.text(`M1${passengerName.toUpperCase().replace(/\s+/g, '/')} EEXP982X BOMGOI6E`, 58, 174)

  doc.setTextColor(100, 116, 139)
  doc.setFontSize(7.5)
  doc.setFont('courier', 'normal')
  doc.text('E-Ticket: 098-2419842109 • SEQ 042', 58, 182)

  // Full High-Resolution Barcode
  drawBarcode(doc, 118, 167, 62, 18)

  // Boarding Notice
  doc.setTextColor(100, 116, 139)
  doc.setFontSize(7.5)
  doc.setFont('helvetica', 'normal')
  doc.text('Baggage drop closes 45 minutes before departure. Please be present at gate B12 by 09:30 AM.', 58, 202)

  // Security Footer
  doc.setTextColor(148, 163, 184)
  doc.setFontSize(7.5)
  doc.setFont('helvetica', 'normal')
  doc.text('Offline-Encrypted Vault Protocol • Persistent Account Storage', pageWidth / 2, 256, { align: 'center' })
  doc.text(`Official Flight Boarding Pass • Trip #${tripTitle}`, pageWidth / 2, 261, { align: 'center' })

  const outName = fileName?.endsWith('.pdf') ? fileName : 'IndiGo_Flight_BoardingPass_6E204.pdf'
  doc.save(outName)
}

// ── PDF Generator: User Uploaded Image -> PDF ─────────────────────────────────
async function generateImageDocPdf(docItem: TripDocItem, passengerName: string, tripTitle: string) {
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pageWidth = 210
  const margin = 15

  // Header Banner
  pdf.setFillColor(15, 23, 42)
  pdf.rect(0, 0, pageWidth, 28, 'F')
  pdf.setFillColor(252, 108, 38)
  pdf.rect(0, 28, pageWidth, 2, 'F')

  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(16)
  pdf.setTextColor(255, 255, 255)
  pdf.text('EXPEDITION X AI • TRAVEL VAULT', margin, 14)

  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(8.5)
  pdf.setTextColor(203, 213, 225)
  pdf.text(`OFFICIAL VERIFIED DOCUMENT: ${docItem.name.toUpperCase()}`, margin, 21)

  pdf.setFontSize(8)
  pdf.text(`Passenger: ${passengerName}`, pageWidth - margin, 14, { align: 'right' })
  pdf.text(`Trip: ${tripTitle}`, pageWidth - margin, 21, { align: 'right' })

  // Document Details Box
  pdf.setFillColor(248, 250, 252)
  pdf.setDrawColor(226, 232, 240)
  pdf.roundedRect(margin, 36, pageWidth - margin * 2, 16, 2, 2, 'FD')
  pdf.setTextColor(15, 23, 42)
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(9)
  pdf.text(`Document Name: ${docItem.name}`, margin + 5, 43)
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(8)
  pdf.setTextColor(100, 116, 139)
  pdf.text(`Status: Verified Traveler Document • Size: ${docItem.fileSize || 'Standard'} • Storage: Encrypted Vault`, margin + 5, 48)

  // Embed Image into PDF
  if (docItem.fileData) {
    try {
      const img = new Image()
      img.src = docItem.fileData
      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
      })

      const maxW = pageWidth - margin * 2
      const maxH = 190
      let w = img.width
      let h = img.height

      const ratio = Math.min(maxW / w, maxH / h)
      w = w * ratio
      h = h * ratio

      const x = margin + (maxW - w) / 2
      const y = 58 + (maxH - h) / 2

      // Add image background
      pdf.setDrawColor(226, 232, 240)
      pdf.setFillColor(255, 255, 255)
      pdf.roundedRect(x - 2, y - 2, w + 4, h + 4, 2, 2, 'FD')

      pdf.addImage(img, 'JPEG', x, y, w, h, undefined, 'FAST')
    } catch (e) {
      console.error('Failed to embed image in PDF', e)
      pdf.setTextColor(239, 68, 68)
      pdf.setFontSize(10)
      pdf.text('Unable to render image into PDF canvas', margin, 70)
    }
  }

  // Footer
  pdf.setFont('helvetica', 'normal')
  pdf.setTextColor(148, 163, 184)
  pdf.setFontSize(7.5)
  pdf.text('Offline-Encrypted Vault Protocol • Persistent Account Storage', pageWidth / 2, 282, { align: 'center' })

  const outName = docItem.fileName?.replace(/\.[^/.]+$/, '') || docItem.name.replace(/\s+/g, '_')
  pdf.save(`${outName}.pdf`)
}

// ── PDF Generator: Generic Travel Document ────────────────────────────────────
function generateGenericDocPdf(docItem: TripDocItem, passengerName: string, tripTitle: string) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pageWidth = 210
  const margin = 15

  // Header
  doc.setFillColor(15, 23, 42)
  doc.rect(0, 0, pageWidth, 28, 'F')
  doc.setFillColor(252, 108, 38)
  doc.rect(0, 28, pageWidth, 2, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.setTextColor(255, 255, 255)
  doc.text('EXPEDITION X AI • TRAVEL VAULT', margin, 14)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(203, 213, 225)
  doc.text('OFFICIAL VERIFIED TRAVEL RECORD', margin, 21)

  // Card Content
  doc.setFillColor(248, 250, 252)
  doc.setDrawColor(226, 232, 240)
  doc.roundedRect(margin, 40, pageWidth - margin * 2, 90, 4, 4, 'FD')

  doc.setTextColor(15, 23, 42)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text(docItem.name, margin + 10, 56)

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100, 116, 139)
  doc.text(`Category: ${docItem.category.toUpperCase()}`, margin + 10, 66)
  doc.text(`Passenger: ${passengerName}`, margin + 10, 74)
  doc.text(`Trip Title: ${tripTitle}`, margin + 10, 82)
  doc.text(`File Size: ${docItem.fileSize || 'Standard'}`, margin + 10, 90)
  doc.text(`Verified Status: 100% Confirmed in Account Vault`, margin + 10, 98)
  doc.text(`Uploaded Timestamp: ${docItem.uploadedAt || 'Official Storage'}`, margin + 10, 106)

  // QR Code
  drawVectorQr(doc, pageWidth - margin - 35, 52, 25)

  // Footer
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(148, 163, 184)
  doc.setFontSize(7.5)
  doc.text('Offline-Encrypted Vault Protocol • Persistent Account Storage', pageWidth / 2, 282, { align: 'center' })

  const outName = docItem.fileName?.endsWith('.pdf') ? docItem.fileName : `${docItem.name.replace(/\s+/g, '_')}.pdf`
  doc.save(outName)
}

// ── PDF Helper: Download existing PDF data URL ────────────────────────────────
function downloadPdfDataUrl(fileData: string, fileName: string) {
  try {
    const base64 = fileData.split(',')[1] || fileData
    const byteCharacters = atob(base64)
    const byteNumbers = new Array(byteCharacters.length)
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i)
    }
    const byteArray = new Uint8Array(byteNumbers)
    const blob = new Blob([byteArray], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  } catch (err) {
    console.error('Failed to download PDF data URL:', err)
  }
}

export const TripDocumentViewerModal: React.FC<TripDocumentViewerModalProps> = ({
  isOpen,
  onClose,
  doc,
  onDelete,
  passengerName = 'Anant Ambani',
  tripTitle = 'Goa Coastal Odyssey',
  tripDestination = 'Goa, India'
}) => {
  const printableRef = useRef<HTMLDivElement>(null)
  const [downloading, setDownloading] = useState(false)

  if (!isOpen || !doc) return null

  const isHotel = doc.id === 'hotel_voucher' || doc.fileType === 'system/hotel' || doc.category === 'hotel'
  const isFlight = doc.id === 'eticket' || doc.fileType === 'system/flight' || doc.category === 'ticket'
  const isUserImage = Boolean(doc.fileData && (doc.fileType?.startsWith('image/') || doc.fileData.startsWith('data:image/')))
  const isUserPdf = Boolean(doc.fileData && (doc.fileType === 'application/pdf' || doc.fileData.startsWith('data:application/pdf')))

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = async () => {
    setDownloading(true)
    try {
      if (isHotel) {
        generateHotelVoucherPdf(passengerName, tripTitle, doc.fileName)
        return
      }

      if (isFlight) {
        generateFlightTicketPdf(passengerName, tripTitle, doc.fileName)
        return
      }

      if (isUserPdf && doc.fileData) {
        downloadPdfDataUrl(doc.fileData, doc.fileName || `${doc.name}.pdf`)
        return
      }

      if (isUserImage && doc.fileData) {
        await generateImageDocPdf(doc, passengerName, tripTitle)
        return
      }

      // Generic fallback - always exports real PDF
      generateGenericDocPdf(doc, passengerName, tripTitle)
    } catch (err) {
      console.error('PDF generation error:', err)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
        />

        {/* Modal Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ type: 'spring', damping: 28, stiffness: 340 }}
          className="relative w-full max-w-4xl bg-white rounded-[32px] shadow-2xl overflow-hidden border border-slate-200 z-10 font-sans my-auto flex flex-col max-h-[92vh]"
        >
          {/* Top Bar with actions */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/90 shrink-0">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{doc.icon}</span>
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg leading-tight flex items-center gap-2">
                  <span>{doc.name}</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-black text-white border border-black shadow-sm">
                    Verified
                  </span>
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {doc.fileName ? `${doc.fileName} • ` : ''}{doc.fileSize || 'Official PDF Document'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDownload}
                disabled={downloading}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 shadow-sm transition-all hover:scale-105 cursor-pointer disabled:opacity-60"
                title="Download PDF"
              >
                {downloading ? (
                  <Loader2 size={14} className="text-[#FC6C26] animate-spin" />
                ) : (
                  <Download size={14} className="text-[#FC6C26]" />
                )}
                <span className="hidden sm:inline">{downloading ? 'Downloading...' : 'Download PDF'}</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 shadow-sm transition-all hover:scale-105 cursor-pointer"
                title="Print Document"
              >
                <Printer size={14} className="text-slate-600" />
                <span className="hidden sm:inline">Print</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`Are you sure you want to delete "${doc.name}"? It will be removed from your saved storage.`)) {
                    onDelete(doc.id)
                    onClose()
                  }
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold border border-red-200 shadow-sm transition-all hover:scale-105 cursor-pointer"
                title="Delete this document"
              >
                <Trash2 size={14} />
                <span className="hidden sm:inline">Delete</span>
              </button>

              <div className="w-[1px] h-6 bg-slate-200 mx-1" />

              <button
                type="button"
                onClick={onClose}
                className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-slate-200/60 transition-colors cursor-pointer"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Modal Content / Preview Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-100/60" ref={printableRef}>
            
            {/* 1. HOTEL VOUCHER */}
            {isHotel && (
              <div className="max-w-2xl mx-auto bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-200 relative overflow-hidden">
                {/* Decorative luxury gradient top accent */}
                <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-[#FC6C26] via-amber-500 to-[#FC6C26]" />

                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#FC6C26]/10 flex items-center justify-center text-2xl">
                      🏨
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FC6C26]">ExpeditionX Stays</span>
                      <h2 className="text-2xl font-black text-slate-900 tracking-tight">Official Hotel Booking Voucher</h2>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-black text-white border border-black text-xs font-black uppercase tracking-wider shadow-sm">
                      <CheckCircle2 size={12} className="text-white" /> Confirmed & Paid
                    </span>
                    <p className="text-[11px] text-slate-400 font-mono mt-1">Ref: #EX-HYATT-882194</p>
                  </div>
                </div>

                {/* Hotel Details Card */}
                <div className="my-6 p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                      <Building size={18} className="text-[#FC6C26]" />
                      <span>Grand Hyatt Resort & Residences</span>
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 flex items-center gap-1.5">
                      <MapPin size={13} className="text-slate-400 shrink-0" />
                      <span>Bambolim Beach, North Goa, 403206, India</span>
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Front Desk Hotline: <strong className="text-slate-700">+91 832 664 1234</strong>
                    </p>
                  </div>
                  <div className="text-left sm:text-right shrink-0">
                    <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold block">Accommodation</span>
                    <span className="text-sm font-extrabold text-slate-800 block">Ocean View Suite (King Bed)</span>
                    <span className="text-xs text-slate-800 font-semibold block mt-0.5">Complimentary Breakfast Included</span>
                  </div>
                </div>

                {/* Guest & Dates Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-y border-slate-100">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Lead Guest</span>
                    <span className="text-sm font-bold text-slate-900 block">{passengerName}</span>
                    <span className="text-[11px] text-slate-500">Adult (Primary)</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Check-in</span>
                    <span className="text-sm font-bold text-slate-900 block">Oct 24, 2026</span>
                    <span className="text-[11px] text-slate-500">From 14:00 hrs</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Check-out</span>
                    <span className="text-sm font-bold text-slate-900 block">Oct 27, 2026</span>
                    <span className="text-[11px] text-slate-500">Until 11:00 hrs</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Stay Duration</span>
                    <span className="text-sm font-bold text-slate-900 block">3 Nights</span>
                    <span className="text-[11px] text-slate-900 font-bold">1 Room • 2 Guests</span>
                  </div>
                </div>

                {/* Important Inclusions & Policies */}
                <div className="my-6 space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-600">Package Inclusions & Benefits:</h4>
                  <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
                    <li>Welcome Drink on Arrival & Daily Gourmet Buffet Breakfast for all guests.</li>
                    <li>Complimentary high-speed Wi-Fi & access to Infinity Pool and 24/7 Fitness Center.</li>
                    <li>Complimentary Airport Chauffeur transfer to and from Manohar International Airport (MOPA).</li>
                    <li>All Government Luxury and Goods & Services Taxes (GST) are fully paid.</li>
                  </ul>
                </div>

                {/* Security Verification & QR Footer */}
                <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 -mx-6 sm:-mx-10 -mb-6 sm:-mb-10 p-6 sm:p-8 rounded-b-3xl">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 bg-white p-2 rounded-xl border border-slate-200 flex items-center justify-center shadow-sm">
                      <QrCode size={48} className="text-slate-800" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <ShieldCheck size={14} className="text-slate-900" />
                        <span>Instant Verification Seal</span>
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5 max-w-xs">
                        Scan at hotel reception or present valid Photo ID (Aadhaar/Passport) at check-in.
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest block">Total Amount Paid</span>
                    <span className="text-2xl font-black text-slate-900 tracking-tight">₹48,500</span>
                    <span className="text-[10px] text-slate-900 font-bold uppercase tracking-wider block">100% Fully Settled</span>
                  </div>
                </div>
              </div>
            )}

            {/* 2. FLIGHT E-TICKET & BOARDING PASS */}
            {isFlight && (
              <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
                {/* Header Strip */}
                <div className="bg-gradient-to-r from-[#1e3a8a] to-[#0f172a] text-white p-6 sm:p-8 relative">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-2xl border border-white/20">
                        ✈️
                      </div>
                      <div>
                        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-300">IndiGo Airlines • 6E-204</span>
                        <h2 className="text-2xl font-black tracking-tight text-white">Electronic Flight Ticket</h2>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono font-black text-blue-200 block">PNR: EXP982X</span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-black text-white border border-white/40 inline-block mt-1 shadow-sm">
                        Confirmed
                      </span>
                    </div>
                  </div>

                  {/* Flight Route Visual */}
                  <div className="mt-8 flex items-center justify-between px-2 sm:px-6">
                    <div>
                      <span className="text-3xl font-black font-mono">BOM</span>
                      <p className="text-xs text-blue-200 font-semibold mt-0.5">Mumbai (T2)</p>
                      <p className="text-sm font-bold text-white mt-1">10:15 AM</p>
                    </div>

                    <div className="flex-1 flex flex-col items-center px-4">
                      <span className="text-[10px] font-black tracking-widest uppercase text-blue-300 mb-1">1h 20m Non-stop</span>
                      <div className="w-full flex items-center">
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-300" />
                        <div className="flex-1 border-t-2 border-dashed border-blue-300/60" />
                        <Plane size={18} className="text-white mx-2 rotate-90" />
                        <div className="flex-1 border-t-2 border-dashed border-blue-300/60" />
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-300" />
                      </div>
                      <span className="text-[10px] text-blue-300 font-medium mt-1">Airbus A321neo</span>
                    </div>

                    <div className="text-right">
                      <span className="text-3xl font-black font-mono">GOI</span>
                      <p className="text-xs text-blue-200 font-semibold mt-0.5">Goa Dabolim</p>
                      <p className="text-sm font-bold text-white mt-1">11:35 AM</p>
                    </div>
                  </div>
                </div>

                {/* Perforated divider look */}
                <div className="relative h-6 bg-slate-50 flex items-center justify-between px-4 overflow-hidden border-y border-slate-200">
                  <div className="absolute -left-3 w-6 h-6 rounded-full bg-slate-100 border-r border-slate-200" />
                  <div className="w-full border-t-2 border-dashed border-slate-300 mx-4" />
                  <div className="absolute -right-3 w-6 h-6 rounded-full bg-slate-100 border-l border-slate-200" />
                </div>

                {/* Boarding Details Body */}
                <div className="p-6 sm:p-8 bg-white space-y-6">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Passenger</span>
                      <span className="text-sm font-extrabold text-slate-900 block uppercase">{passengerName}</span>
                      <span className="text-[11px] text-slate-500">Seat 4A • Window</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Date</span>
                      <span className="text-sm font-bold text-slate-900 block">Oct 24, 2026</span>
                      <span className="text-[11px] text-slate-500">Saturday</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Boarding Time</span>
                      <span className="text-sm font-extrabold text-[#FC6C26] block">09:30 AM</span>
                      <span className="text-[11px] text-slate-500">Gate Closes 09:55 AM</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Gate / Terminal</span>
                      <span className="text-sm font-extrabold text-slate-900 block">Gate B12</span>
                      <span className="text-[11px] text-slate-500">Terminal 2</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="font-bold text-slate-800">Baggage Allowance:</span>{' '}
                      <span className="text-slate-600">Cabin 7 Kg • Check-in 25 Kg</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-800">Class:</span>{' '}
                      <span className="text-slate-600">Business / Comfort Plus</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-800">Meal:</span>{' '}
                      <span className="text-slate-900 font-bold">Complimentary Warm Meal</span>
                    </div>
                  </div>

                  {/* Aviation Barcode & QR Code */}
                  <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 bg-slate-50 p-2 rounded-xl border border-slate-200 flex items-center justify-center">
                        <QrCode size={48} className="text-slate-800" />
                      </div>
                      <div className="text-left font-mono">
                        <p className="text-xs font-bold text-slate-800">M1{passengerName.toUpperCase().replace(/\s+/g, '/')} EEXP982X BOMGOI6E</p>
                        <p className="text-[10px] text-slate-400 mt-1">E-Ticket: 098-2419842109 • SEQ 042</p>
                      </div>
                    </div>
                    <div className="h-10 w-44 bg-[repeating-linear-gradient(90deg,#0f172a_0px,#0f172a_2px,transparent_2px,transparent_5px,#0f172a_5px,#0f172a_8px,transparent_8px,transparent_11px)] opacity-85" />
                  </div>
                </div>
              </div>
            )}

            {/* 3. USER UPLOADED IMAGE (Aadhaar / PAN / etc.) */}
            {isUserImage && (
              <div className="max-w-3xl mx-auto flex flex-col items-center justify-center">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-slate-900 group">
                  <img
                    src={doc.fileData}
                    alt={doc.name}
                    className="max-h-[65vh] w-auto object-contain rounded-2xl"
                  />
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 text-white flex justify-between items-center">
                    <div>
                      <p className="font-bold text-sm">{doc.fileName || doc.name}</p>
                      <p className="text-xs text-white/70">Uploaded: {doc.uploadedAt || 'Recently'}</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleDownload}
                      disabled={downloading}
                      className="px-3 py-1.5 rounded-lg bg-[#FC6C26] hover:bg-[#E5591A] text-white text-xs font-bold transition-transform hover:scale-105 cursor-pointer disabled:opacity-60 flex items-center gap-1.5"
                    >
                      {downloading ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
                      <span>Download PDF</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 4. USER UPLOADED PDF */}
            {isUserPdf && (
              <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
                <iframe
                  src={doc.fileData}
                  title={doc.name}
                  className="w-full h-[65vh] border-0"
                />
              </div>
            )}

            {/* 5. GENERIC FILE FALLBACK */}
            {!isHotel && !isFlight && !isUserImage && !isUserPdf && (
              <div className="max-w-md mx-auto bg-white rounded-3xl p-8 text-center shadow-lg border border-slate-200">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4 text-3xl">
                  {doc.icon}
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2">{doc.name}</h3>
                <p className="text-xs text-slate-500 mb-6">
                  {doc.fileName ? `File: ${doc.fileName} (${doc.fileSize})` : 'Document saved securely in your offline vault.'}
                </p>
                <div className="flex justify-center gap-3">
                  <button
                    type="button"
                    onClick={handleDownload}
                    disabled={downloading}
                    className="px-5 py-2.5 rounded-xl bg-[#FC6C26] hover:bg-[#E5591A] text-white text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-60 flex items-center gap-1.5"
                  >
                    {downloading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                    <span>Download PDF</span>
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* Modal Footer Security Badge */}
          <div className="px-6 py-3 bg-white border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 shrink-0">
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-slate-700" />
              <span>Offline-Encrypted Vault Protocol • Persistent Account Storage</span>
            </span>
            <span className="text-[11px] text-slate-400">
              Trip #{tripTitle.slice(0, 10)}
            </span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
