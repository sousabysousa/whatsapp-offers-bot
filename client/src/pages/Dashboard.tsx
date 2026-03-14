import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { MessageSquare, Package, Users, Clock, TrendingUp, AlertCircle } from "lucide-react";
import { useLocation } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { data: stats, isLoading } = trpc.dashboard.getStats.useQuery();

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-lg" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const statCards = [
    {
      title: "Grupos Cadastrados",
      value: stats?.totalGroups || 0,
      icon: Users,
      color: "bg-blue-500",
      description: "Grupos ativos para envio",
    },
    {
      title: "Produtos",
      value: stats?.totalProducts || 0,
      icon: Package,
      color: "bg-purple-500",
      description: "Ofertas disponíveis",
    },
    {
      title: "Agendamentos",
      value: stats?.totalOffers || 0,
      icon: Clock,
      color: "bg-orange-500",
      description: "Total de ofertas",
    },
    {
      title: "Enviadas Hoje",
      value: stats?.messagesTodaySent || 0,
      icon: MessageSquare,
      color: "bg-green-500",
      description: "Mensagens enviadas",
    },
    {
      title: "Agendadas",
      value: stats?.messagesScheduled || 0,
      icon: Clock,
      color: "bg-indigo-500",
      description: "Próximos envios",
    },
    {
      title: "Taxa de Sucesso",
      value: `${stats?.successRate || 0}%`,
      icon: TrendingUp,
      color: "bg-emerald-500",
      description: "Mensagens bem-sucedidas",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Bem-vindo, {user?.name}! Aqui está um resumo da sua atividade.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                    <div className={`${stat.color} p-2 rounded-lg`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>Acesse as funcionalidades principais da plataforma</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <Button
                variant="outline"
                className="h-20 flex flex-col items-center justify-center gap-2"
                onClick={() => navigate("/whatsapp")}
              >
                <MessageSquare className="w-5 h-5" />
                <span className="text-xs">Sessões WhatsApp</span>
              </Button>
              <Button
                variant="outline"
                className="h-20 flex flex-col items-center justify-center gap-2"
                onClick={() => navigate("/groups")}
              >
                <Users className="w-5 h-5" />
                <span className="text-xs">Gerenciar Grupos</span>
              </Button>
              <Button
                variant="outline"
                className="h-20 flex flex-col items-center justify-center gap-2"
                onClick={() => navigate("/products")}
              >
                <Package className="w-5 h-5" />
                <span className="text-xs">Produtos</span>
              </Button>
              <Button
                variant="outline"
                className="h-20 flex flex-col items-center justify-center gap-2"
                onClick={() => navigate("/offers")}
              >
                <TrendingUp className="w-5 h-5" />
                <span className="text-xs">Agendamentos</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Info Alert */}
        {stats?.successRate === 0 && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <CardTitle className="text-yellow-900">Comece Agora</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-sm text-yellow-800">
              <p>
                Você ainda não enviou nenhuma mensagem. Comece conectando uma sessão WhatsApp, cadastrando grupos e
                produtos, e agendando suas primeiras ofertas!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
