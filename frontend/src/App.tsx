import { Route, Routes } from 'react-router';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { BudgetDetailPage } from './pages/BudgetDetailPage';
import { BudgetsPage } from './pages/BudgetsPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { DashboardPage } from './pages/DashboardPage';
import { ExpensesPage } from './pages/ExpensesPage';
import { LoginPage } from './pages/LoginPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { SignUpPage } from './pages/SignUpPage';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<DashboardPage />} />
        <Route path="/budgets" element={<BudgetsPage />} />
        <Route path="/budgets/:id" element={<BudgetDetailPage />} />
        <Route path="/expenses" element={<ExpensesPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
