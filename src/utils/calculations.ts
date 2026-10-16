import { Transaction, Budget, BudgetStatusRow, HealthAssessment, RecurringRule, NewTransaction } from '../types';
import { formatRupiah, getNextMonth, getTodayDate, padZero } from './formatters';

export function calculateSurplusCarryOver(
  transactions: Transaction[],
  budget: Budget,
  targetMonth: string,
  categoryFilter?: (t: Transaction) => boolean
): number {
  if (!budget.carry_over_surplus || budget.total_limit <= 0 || transactions.length === 0) {
    return 0;
  }

  // Cari transaksi tertua
  const earliestDate = transactions.reduce((min, t) => (t.date < min ? t.date : min), '9999-99-99');
  if (earliestDate === '9999-99-99') return 0;

  let currentMonth = earliestDate.slice(0, 7);
  let accumulatedCarry = 0;
  let safetyLoop = 0;

  const baseLimit = categoryFilter ? 0 : budget.total_limit;

  while (currentMonth < targetMonth && safetyLoop++ < 360) {
    const monthlyExpenses = transactions
      .filter((t) => t.type === 'out' && t.date.startsWith(currentMonth))
      .filter(categoryFilter || (() => true))
      .reduce((acc, t) => acc + Number(t.amount), 0);

    // Surplus = (Batas + sisa sebelumnya) - pengeluaran bulan tersebut
    accumulatedCarry = Math.max(0, baseLimit + accumulatedCarry - monthlyExpenses);
    currentMonth = getNextMonth(currentMonth);
  }

  return accumulatedCarry;
}

export function getBudgetStatusRows(
  transactions: Transaction[],
  budget: Budget,
  targetMonth: string,
  multiplier: number = 1 // 1 untuk bulanan, 12 untuk tahunan
): BudgetStatusRow[] {
  const currentMonthExpenses = transactions.filter(
    (t) => t.type === 'out' && t.date.startsWith(targetMonth)
  );

  const rows: BudgetStatusRow[] = [];
  const th = budget.threshold_percent || 80;

  // Total limit row
  if (budget.total_limit > 0) {
    const totalSpent = currentMonthExpenses.reduce((sum, t) => sum + Number(t.amount), 0);
    const carry = multiplier === 1 ? calculateSurplusCarryOver(transactions, budget, targetMonth) : 0;
    const effectiveLimit = budget.total_limit * multiplier + carry;
    const status =
      totalSpent >= effectiveLimit
        ? 'over'
        : totalSpent >= (effectiveLimit * th) / 100
        ? 'warn'
        : 'ok';

    rows.push({
      name: 'Total Pengeluaran',
      spent: totalSpent,
      limit: effectiveLimit,
      carryOver: carry,
      status,
    });
  }

  // Category limit rows
  if (budget.category_limits && typeof budget.category_limits === 'object') {
    Object.entries(budget.category_limits).forEach(([cat, catLimit]) => {
      const limitNum = Number(catLimit);
      if (limitNum > 0) {
        const spent = currentMonthExpenses
          .filter((t) => t.goal === cat)
          .reduce((sum, t) => sum + Number(t.amount), 0);

        const effectiveLimit = limitNum * multiplier;
        const status =
          spent >= effectiveLimit
            ? 'over'
            : spent >= (effectiveLimit * th) / 100
            ? 'warn'
            : 'ok';

        rows.push({
          name: cat,
          spent,
          limit: effectiveLimit,
          carryOver: 0,
          status,
        });
      }
    });
  }

  return rows;
}

export function assessFinancialHealth(transactions: Transaction[], budget: Budget): HealthAssessment {
  const today = getTodayDate();
  const currentMonth = today.slice(0, 7);

  // Ambil 3 bulan terakhir
  const months: string[] = [];
  let mCursor = currentMonth;
  for (let i = 0; i < 3; i++) {
    months.unshift(mCursor);
    const [y, m] = mCursor.split('-').map(Number);
    const prevDate = new Date(y, m - 2, 1);
    mCursor = `${prevDate.getFullYear()}-${padZero(prevDate.getMonth() + 1)}`;
  }

  const monthStats = months.map((m) => {
    const list = transactions.filter((t) => t.date.startsWith(m));
    const inc = list.filter((t) => t.type === 'in').reduce((s, t) => s + Number(t.amount), 0);
    const out = list.filter((t) => t.type === 'out').reduce((s, t) => s + Number(t.amount), 0);
    const sv = list.filter((t) => t.type === 'sv').reduce((s, t) => s + Number(t.amount), 0);
    return { month: m, inc, out, sv, count: list.length };
  }).filter((x) => x.count > 0);

  const count = monthStats.length || 1;
  const avgIncome = monthStats.reduce((s, x) => s + x.inc, 0) / count;
  const avgExpense = monthStats.reduce((s, x) => s + x.out, 0) / count;
  const avgSavings = monthStats.reduce((s, x) => s + x.sv, 0) / count;

  if (monthStats.length === 0 || avgIncome <= 0) {
    return {
      score: 50,
      statusLabel: 'Belum Cukup Data',
      statusColor: '#8b95a5',
      verdict: 'Catat pemasukan dan pengeluaran secara konsisten untuk melihat analisis kesehatan keuangan lengkap.',
      needsWantsRate: 0,
      savingsRate: 0,
      emergencyMonths: 0,
      deficitMonths: 0,
      unallocatedRate: 0,
      recommendations: [
        'Mulai catat seluruh pemasukan dan pengeluaran rutin kamu.',
        'Buat anggaran bulanan pertama melalui menu Anggaran.',
      ],
      proposedBudget: { total: 0, categories: {} },
    };
  }

  const expenseRate = (avgExpense / avgIncome) * 100;
  const savingsRate = (avgSavings / avgIncome) * 100;

  // Dana darurat
  const emergencyFundTotal = transactions
    .filter((t) => t.type === 'sv' && /darurat/i.test(t.goal))
    .reduce((s, t) => s + Number(t.amount), 0);
  const emergencyMonths = avgExpense > 0 ? emergencyFundTotal / avgExpense : 0;

  // Defisit
  const deficitMonths = monthStats.filter((x) => x.out + x.sv > x.inc).length;

  // Evaluasi disiplin anggaran
  const budgetRows = getBudgetStatusRows(transactions, budget, currentMonth, 1);
  const overBudgets = budgetRows.filter((r) => r.status === 'over');
  const warnBudgets = budgetRows.filter((r) => r.status === 'warn');

  // Skor komponen (maks total 100)
  const sSavings = savingsRate >= 20 ? 30 : savingsRate >= 10 ? 20 : savingsRate > 0 ? 10 : 0;
  const sExpense =
    expenseRate <= 50 ? 30 : expenseRate <= 70 ? 24 : expenseRate <= 80 ? 18 : expenseRate <= 90 ? 10 : 0;
  const sEmergency = emergencyMonths >= 6 ? 20 : emergencyMonths >= 3 ? 14 : emergencyMonths >= 1 ? 7 : 0;
  const sBudget =
    budgetRows.length === 0
      ? 10
      : overBudgets.length > 0
      ? 4
      : warnBudgets.length > 0
      ? 14
      : 20;

  const rawScore = Math.max(0, Math.min(100, sSavings + sExpense + sEmergency + sBudget - deficitMonths * 6));
  const statusColor = rawScore >= 75 ? '#34d399' : rawScore >= 50 ? '#fbbf24' : '#f87171';
  const statusLabel =
    rawScore >= 75 ? 'Sehat ✅' : rawScore >= 50 ? 'Cukup, Perlu Perhatian ⚠️' : 'Perlu Perbaikan 🚨';

  // Usulan Anggaran Otomatis (Rule of thumb: <= 80% pemasukan)
  const round1000 = (n: number) => Math.round(n / 1000) * 1000;
  const proposedTotal = round1000(Math.min(avgExpense * 0.95, avgIncome * 0.8));

  // Top spending categories
  const catSums: Record<string, number> = {};
  transactions
    .filter((t) => t.type === 'out' && monthStats.some((ms) => t.date.startsWith(ms.month)))
    .forEach((t) => {
      catSums[t.goal] = (catSums[t.goal] || 0) + Number(t.amount);
    });

  const sortedCats = Object.entries(catSums)
    .map(([k, v]) => [k, v / count] as [string, number])
    .sort((a, b) => b[1] - a[1]);

  const factor = expenseRate > 80 ? Math.max(0.7, (avgIncome * 0.8) / avgExpense) : 1;
  const proposedCats: Record<string, number> = {};
  sortedCats.slice(0, 4).forEach(([cat, val]) => {
    const limit = round1000(val * factor);
    if (limit > 0) proposedCats[cat] = limit;
  });

  // Tips & rekomendasi
  const recommendations: string[] = [];
  if (expenseRate > 80) {
    recommendations.push(
      `Pengeluaran rata-rata (${Math.round(expenseRate)}%) melebihi batas aman 80%. Hemat sekitar ${formatRupiah(
        avgExpense - avgIncome * 0.8
      )}/bulan dengan memprioritaskan kategori terbesar (${sortedCats[0]?.[0] || 'kebutuhan harian'}).`
    );
  }
  if (savingsRate < 20) {
    recommendations.push(
      `Tingkatkan alokasi tabungan & investasi menuju target 20% (${formatRupiah(
        avgIncome * 0.2
      )}/bulan). Sisihkan di awal bulan dengan otomatisasi rutin.`
    );
  }
  if (emergencyMonths < 3) {
    const target3m = avgExpense * 3;
    recommendations.push(
      `Dana darurat saat ini setara ${emergencyMonths.toFixed(1)} bulan pengeluaran. Target aman adalah 3–6 bulan (${formatRupiah(
        target3m
      )}).`
    );
  }
  if (overBudgets.length > 0) {
    recommendations.push(
      `Bulan ini ada anggaran yang melampaui batas: ${overBudgets.map((b) => b.name).join(', ')}. Hindari pengeluaran non-esensial.`
    );
  }
  if (deficitMonths > 0) {
    recommendations.push(
      `Terdapat ${deficitMonths} bulan dengan pengeluaran + tabungan melampaui pemasukan. Evaluasi pos belanja tidak terduga.`
    );
  }
  if (recommendations.length < 3) {
    recommendations.push(
      'Kondisi arus kas kamu stabil! Pertahankan konsistensi menabung dan tinjau performa portofolio investasi secara berkala.'
    );
  }

  const verdict = `Kondisi keuanganmu ${
    rawScore >= 75 ? 'sangat sehat dan terkontrol' : rawScore >= 50 ? 'cukup stabil tetapi memerlukan evaluasi pos pengeluaran' : 'memerlukan perhatian khusus untuk memangkas pengeluaran'
  }. Alokasi belanja rata-rata ${Math.round(expenseRate)}% dari pemasukan, dan rasio tabungan ${Math.round(savingsRate)}%.`;

  return {
    score: rawScore,
    statusLabel,
    statusColor,
    verdict,
    needsWantsRate: expenseRate,
    savingsRate,
    emergencyMonths,
    deficitMonths,
    unallocatedRate: Math.max(0, 100 - expenseRate - savingsRate),
    recommendations,
    proposedBudget: {
      total: proposedTotal,
      categories: proposedCats,
    },
  };
}

export function executeRecurringRules(
  rules: RecurringRule[],
  onTrigger: (newTx: Omit<NewTransaction, 'user_id'>, ruleId: string, processedMonth: string) => void
): number {
  const today = getTodayDate();
  const currentMonth = today.slice(0, 7);
  let count = 0;

  rules.forEach((rule) => {
    if (!rule.is_active) return;

    let m = rule.last_processed_month ? getNextMonth(rule.last_processed_month) : rule.start_month;

    while (m <= currentMonth) {
      const [y, mon] = m.split('-').map(Number);
      const daysInM = new Date(y, mon, 0).getDate();
      const targetDay = Math.min(rule.day_of_month, daysInM);
      const scheduledDate = `${m}-${padZero(targetDay)}`;

      // Jika tanggal terjadwal sudah lewat atau hari ini, catat transaksi
      if (scheduledDate <= today) {
        onTrigger(
          {
            type: rule.type,
            date: scheduledDate,
            amount: Number(rule.amount),
            goal: rule.goal,
            note: (rule.note ? rule.note + ' ' : '') + '(otomatis)',
            recurring_rule_id: rule.id,
          },
          rule.id,
          m
        );
        count++;
      } else {
        break;
      }

      m = getNextMonth(m);
    }
  });

  return count;
}
