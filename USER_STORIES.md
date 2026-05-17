# Mama Budget - New Feature User Stories

## Overview

This document outlines new features to enhance the Mama Budget application, organized by priority and complexity.

---

## 1. Recurring Expenses

**As a** user
**I want to** set up recurring expenses (daily, weekly, monthly, yearly)
**So that** I don't have to manually enter repetitive expenses like rent, subscriptions, and utilities

### Acceptance Criteria
- User can mark an expense as recurring when creating it
- Recurrence options: daily, weekly, bi-weekly, monthly, yearly
- User can set an optional end date for recurrence
- Recurring expenses are auto-generated on schedule
- User can edit or stop a recurring expense series
- Dashboard shows upcoming recurring expenses

---

## 2. Budget Alerts & Notifications

**As a** user
**I want to** receive alerts when I'm approaching or exceeding my budget limits
**So that** I can adjust my spending before it's too late

### Acceptance Criteria
- User can set alert thresholds (e.g., 50%, 75%, 90%, 100%)
- Visual indicators on budget cards (yellow at 75%, red at 90%+)
- In-app notification banner when thresholds are crossed
- Budget progress bar changes color based on spending percentage

---

## 3. Export Data (CSV/PDF)

**As a** user
**I want to** export my expenses and budgets as CSV or PDF
**So that** I can keep offline records, share with an accountant, or analyze data externally

### Acceptance Criteria
- Export expenses to CSV with filters applied
- Export budget summary to PDF with charts
- Export options accessible from expenses and budgets pages
- Filename includes date range and export type

---

## 4. Expense Tags/Notes

**As a** user
**I want to** add tags and notes to my expenses
**So that** I can add extra context and search/filter by tags later

### Acceptance Criteria
- User can add multiple tags to an expense
- Tags are user-defined and reusable
- Expenses can be filtered by tags
- Tags are displayed as chips on expense items
- Notes field supports multi-line text

---

## 5. Monthly Spending Comparison

**As a** user
**I want to** compare my spending across different months
**So that** I can identify spending trends and seasonality

### Acceptance Criteria
- Bar chart comparing total spending month-over-month
- Category breakdown comparison between months
- Percentage change indicators (up/down from previous month)
- Selectable date range for comparison (last 3, 6, 12 months)
- Accessible from the dashboard

---

## 6. Savings Goals

**As a** user
**I want to** set savings goals with target amounts and deadlines
**So that** I can track my progress toward financial objectives

### Acceptance Criteria
- Create savings goals with name, target amount, deadline
- Track contributions toward each goal
- Visual progress indicator (progress bar + percentage)
- Dashboard widget showing active savings goals
- Ability to mark goals as achieved

---

## 7. Expense Split

**As a** user
**I want to** split an expense with other people
**So that** I can track shared costs (roommates, group dinners, trips)

### Acceptance Criteria
- Split an expense equally or by custom amounts
- Track who owes what
- Mark splits as settled/unsettled
- Summary view of all unsettled splits
- Accessible from expense detail

---

## 8. Dark Mode

**As a** user
**I want to** switch between light and dark themes
**So that** I can use the app comfortably in low-light environments

### Acceptance Criteria
- Toggle between light/dark mode
- Preference persisted in localStorage
- Respects system preference by default
- All components properly styled in both modes
- Smooth transition between modes

---

## 9. Search & Advanced Filtering

**As a** user
**I want to** search expenses by description, amount range, or date
**So that** I can quickly find specific transactions

### Acceptance Criteria
- Full-text search on expense descriptions
- Filter by amount range (min/max)
- Combined filters (text + category + date + amount)
- Search results highlighted
- Search accessible from navigation

---

## 10. Expense Receipts/Attachments

**As a** user
**I want to** attach photos of receipts to my expenses
**So that** I have proof of purchase and better record-keeping

### Acceptance Criteria
- Upload image files (JPG, PNG) or PDFs to an expense
- Preview attached files in expense detail view
- Multiple attachments per expense
- File size limit (5MB per file)
- Delete attachments

---

## Implementation Priority

| Priority | Feature | Complexity |
|----------|---------|------------|
| 1 | Budget Alerts & Notifications | Low |
| 2 | Dark Mode | Low |
| 3 | Search & Advanced Filtering | Medium |
| 4 | Monthly Spending Comparison | Medium |
| 5 | Export Data (CSV/PDF) | Medium |
| 6 | Expense Tags/Notes | Medium |
| 7 | Recurring Expenses | High |
| 8 | Savings Goals | High |
| 9 | Expense Split | High |
| 10 | Expense Receipts/Attachments | High |

---

## Features Selected for Implementation

Based on impact vs. effort analysis, the following features will be implemented:

1. **Budget Alerts & Notifications** - High impact, low effort
2. **Dark Mode** - High user experience impact, low effort
3. **Search & Advanced Filtering** - High usability impact, medium effort
4. **Monthly Spending Comparison** - High analytics value, medium effort
5. **Export Data (CSV)** - High utility, medium effort
