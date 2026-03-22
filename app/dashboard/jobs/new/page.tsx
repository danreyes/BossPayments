import { DashboardBackLink } from "@/components/dashboard/back-link";
import { NewJobForm } from "@/components/new-job-form";

export default function NewJobPage() {
  return (
    <div className="space-y-4">
      <DashboardBackLink />
      <NewJobForm />
    </div>
  );
}