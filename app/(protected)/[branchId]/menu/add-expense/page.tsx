import ExpensesClient from "./components/ExpensesClient";
import { getExpenses } from "@/lib/expense-actions";

export default async function AddExpensePage({
  params,
}: {
  params: Promise<{ branchId: string }>;
}) {
  const { branchId } = await params;
  const date = new Date().toISOString().split("T")[0];
  const initialExpensesPromise = getExpenses(branchId, date);

  return (
    <ExpensesClient
      branchId={branchId}
      initialExpensesPromise={initialExpensesPromise}
    />
  );
}
