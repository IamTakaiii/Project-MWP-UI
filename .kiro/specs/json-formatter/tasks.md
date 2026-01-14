# Implementation Plan: JSON Formatter

## Overview

สร้าง JSON Formatter page สำหรับ My Workspace application โดยใช้ React 19, TypeScript, Tailwind CSS 4 และ shadcn/ui components ตาม tech stack ที่มีอยู่

## Tasks

- [x] 1. Setup page และ routing
  - [x] 1.1 สร้าง `src/pages/json-formatter.tsx` พร้อม basic layout
    - สร้าง JsonFormatterPage component
    - เพิ่ม mode selector tabs (Format, Diff, Query)
    - _Requirements: 1.1, 12.1, 12.2_
  - [x] 1.2 เพิ่ม route ใน `src/router.tsx`
    - เพิ่ม `/json-formatter` route
    - _Requirements: 1.1_
  - [x] 1.3 เพิ่ม card ใน `src/pages/home.tsx`
    - เพิ่ม JSON Formatter app card
    - _Requirements: 1.1_

- [x] 2. สร้าง core utilities และ hook
  - [x] 2.1 สร้าง `src/lib/json-utils.ts`
    - สร้าง validateJson function
    - สร้าง prettifyJson function
    - สร้าง minifyJson function
    - _Requirements: 2.1, 2.2, 3.1, 3.2, 4.1_
  - [ ]* 2.2 Write property test for format round trip
    - **Property 1: Format Round Trip Preservation**
    - **Validates: Requirements 3.3, 4.2**
  - [ ]* 2.3 Write property test for validation consistency
    - **Property 2: Validation Consistency**
    - **Validates: Requirements 2.1, 2.2, 2.3**
  - [ ]* 2.4 Write property test for invalid JSON error handling
    - **Property 3: Invalid JSON Error Handling**
    - **Validates: Requirements 3.4, 4.3**
  - [x] 2.5 สร้าง `src/hooks/use-json-formatter.ts`
    - สร้าง useJsonFormatter hook
    - จัดการ state สำหรับ input, output, errors
    - implement prettify, minify, clear, loadSample actions
    - _Requirements: 1.2, 1.3, 3.1, 4.1, 6.1, 6.2, 7.1, 7.2_

- [ ] 3. Checkpoint - ตรวจสอบ core functionality
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Implement Format Mode UI
  - [x] 4.1 สร้าง JsonInput component
    - Textarea พร้อม error display
    - Placeholder hint เมื่อว่าง
    - _Requirements: 1.1, 1.4, 2.4_
  - [x] 4.2 สร้าง ActionButtons component
    - ปุ่ม Prettify, Minify, Copy, Download, Clear, Sample
    - _Requirements: 3.1, 4.1, 5.1, 6.1, 7.1, 10.1_
  - [x] 4.3 Implement copy to clipboard
    - ใช้ navigator.clipboard API
    - แสดง toast notification
    - _Requirements: 5.1, 5.2, 5.3_
  - [x] 4.4 Implement download JSON
    - สร้าง blob และ download link
    - ใช้ filename "formatted.json"
    - _Requirements: 10.1, 10.2, 10.3_

- [x] 5. Implement Tree View
  - [x] 5.1 สร้าง `src/components/json-tree-view.tsx`
    - Recursive TreeNode component
    - Expand/collapse functionality
    - Data type indicators (icons/colors)
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_
  - [x] 5.2 Implement JSONPath display on hover
    - คำนวณ path สำหรับแต่ละ node
    - แสดง tooltip เมื่อ hover
    - _Requirements: 11.6_
  - [ ]* 5.3 Write property test for tree view path correctness
    - **Property 7: Tree View Path Correctness**
    - **Validates: Requirements 11.4, 11.5, 11.6**

- [ ] 6. Checkpoint - ตรวจสอบ Format Mode
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Implement JSONPath Query Mode
  - [x] 7.1 เพิ่ม JSONPath query logic ใน json-utils
    - ใช้ jsonpath-plus library
    - Handle invalid path errors
    - _Requirements: 8.2, 8.3, 8.4, 8.5_
  - [ ]* 7.2 Write property test for JSONPath query
    - **Property 4: JSONPath Query Subset**
    - **Validates: Requirements 8.2, 8.5**
  - [x] 7.3 สร้าง Query Mode UI
    - JSONPath input field
    - Query result display
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [ ] 8. Implement Diff Mode
  - [ ] 8.1 เพิ่ม diff logic ใน json-utils
    - Deep comparison algorithm
    - Return diff results with types
    - _Requirements: 9.2, 9.4, 9.5_
  - [ ]* 8.2 Write property test for diff identity
    - **Property 5: Diff Identity**
    - **Validates: Requirements 9.5**
  - [ ]* 8.3 Write property test for diff symmetry
    - **Property 6: Diff Symmetry**
    - **Validates: Requirements 9.2**
  - [ ] 8.4 สร้าง Diff Mode UI
    - Two input areas (left/right)
    - Compare button
    - Diff output with color coding
    - _Requirements: 9.1, 9.2, 9.3, 9.5_

- [ ] 9. Final checkpoint
  - Ensure all tests pass, ask the user if questions arise.
  - ทดสอบ responsive layout บน mobile

## Notes

- Tasks marked with `*` are optional property-based tests
- ใช้ Vitest + fast-check สำหรับ property testing
- UI ใช้ภาษาไทยตาม product convention
- ใช้ shadcn/ui components: Button, Textarea, Tabs, Card, Tooltip
