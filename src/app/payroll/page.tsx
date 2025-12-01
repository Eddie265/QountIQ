import { StatusBadge } from "@/components/StatusBadge";
import {
  mockPayrollEmployees,
  mockPayrollRuns,
} from "@/data/mockData";
import { formatCurrency } from "@/lib/format";

export default function PayrollPage() {
  const annualRunRate = mockPayrollEmployees.reduce(
    (sum, employee) => sum + employee.salary,
    0
  );

  const activeHeadcount = mockPayrollEmployees.filter(
    (employee) => employee.status === "active"
  ).length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <p className="text-sm text-[var(--text-muted)] mb-1">Headcount</p>
          <p className="text-2xl font-bold">{activeHeadcount}</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Employees actively on payroll
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-[var(--text-muted)] mb-1">
            Annual run rate
          </p>
          <p className="text-2xl font-bold">
            {formatCurrency(annualRunRate)}
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Base comp excluding bonus programs
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-[var(--text-muted)] mb-1">Next pay date</p>
          <p className="text-2xl font-bold">{mockPayrollRuns[0].payDate}</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Coverage {mockPayrollRuns[0].periodStart} →{" "}
            {mockPayrollRuns[0].periodEnd}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold">Upcoming payroll run</h2>
              <p className="text-sm text-[var(--text-muted)]">
                Preview deductions, funding needs, and statuses
              </p>
            </div>
            <div className="flex gap-3">
              <button className="btn-secondary text-sm px-3 py-1">
                Download summary
              </button>
              <button className="btn-primary text-sm px-4 py-2">
                Process payroll
              </button>
            </div>
          </div>
          <div className="overflow-x-auto table-container">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-[var(--text-muted)] border-b border-[var(--border-color)]">
                  <th className="py-2">Employee</th>
                  <th className="py-2">Role</th>
                  <th className="py-2">Schedule</th>
                  <th className="py-2">Base salary</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-[var(--border-color)]">
                {mockPayrollEmployees.map((employee) => (
                  <tr key={employee.id}>
                    <td className="py-3 font-medium">{employee.name}</td>
                    <td className="py-3">{employee.role}</td>
                    <td className="py-3 capitalize">{employee.paySchedule}</td>
                    <td className="py-3">
                      {formatCurrency(employee.salary)}
                    </td>
                    <td className="py-3">
                      <StatusBadge
                        status={
                          employee.status === "active" ? "completed" : "pending"
                        }
                      >
                        {employee.status}
                      </StatusBadge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card space-y-3">
          <h2 className="font-semibold">History</h2>
          {mockPayrollRuns.map((run) => (
            <div
              key={run.id}
              className="border border-[var(--border-color)] rounded-lg px-3 py-3 flex items-center justify-between"
            >
              <div>
                <p className="font-medium">
                  {run.periodStart} → {run.periodEnd}
                </p>
                <p className="text-xs text-[var(--text-muted)]">
                  Pay date {run.payDate}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold">{formatCurrency(run.netPay)}</p>
                <StatusBadge status={run.status}>
                  {run.status}
                </StatusBadge>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


