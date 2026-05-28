import { useQuery } from "@tanstack/react-query";
import { Users, Building2, Target, FileText, AlertTriangle } from "lucide-react";
import { userRepository } from "../../repositories/ApiUserRepository";
import { organizationRepository } from "../../repositories/ApiOrganizationRepository";
import { reportRepository } from "../../repositories/ApiReportRepository";
import { Skeleton } from "../ui/skeleton";

export function OverviewStats() {
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ["users"],
    queryFn: () => userRepository.list(),
  });

  const { data: organizations, isLoading: orgsLoading } = useQuery({
    queryKey: ["organizations"],
    queryFn: () => organizationRepository.list(),
  });

  const { data: reports, isLoading: reportsLoading } = useQuery({
    queryKey: ["reports"],
    queryFn: () => reportRepository.list(),
  });

  const openReports = reports?.filter(
    (r) => !["Closed", "Duplicate"].includes(r.status)
  ).length ?? 0;

  const criticalIssues = reports?.filter(
    (r) => r.severity === "critical" && !["Closed", "Duplicate"].includes(r.status)
  ).length ?? 0;

  const stats = [
    {
      title: "Total Users",
      value: users?.length ?? 0,
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      loading: usersLoading,
    },
    {
      title: "Organizations",
      value: organizations?.length ?? 0,
      icon: Building2,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      loading: orgsLoading,
    },
    {
      title: "Active Programs",
      value: 0,
      icon: Target,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      loading: false,
    },
    {
      title: "Open Reports",
      value: openReports,
      icon: FileText,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
      loading: reportsLoading,
    },
    {
      title: "Critical Issues",
      value: criticalIssues,
      icon: AlertTriangle,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
      loading: reportsLoading,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.title}
          className="bg-card border border-border rounded-lg p-6 hover:border-purple-500/50 transition-colors"
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`${stat.bgColor} p-2 rounded-lg`}>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
          </div>
          <div>
            {stat.loading ? (
              <Skeleton className="h-8 w-16 mb-1" />
            ) : (
              <div className="text-3xl font-bold text-foreground mb-1">
                {stat.value}
              </div>
            )}
            <div className="text-sm text-muted-foreground">{stat.title}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
