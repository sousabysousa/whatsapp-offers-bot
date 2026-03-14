import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { CheckCircle2, XCircle, Clock, MessageSquare } from "lucide-react";

export default function History() {
  const { user } = useAuth();
  const { data: history, isLoading } = trpc.dashboard.getRecentHistory.useQuery();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sent":
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case "failed":
        return <XCircle className="w-5 h-5 text-red-600" />;
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-600" />;
      default:
        return <MessageSquare className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "sent":
        return <Badge className="bg-green-600">Enviado</Badge>;
      case "failed":
        return <Badge variant="destructive">Falha</Badge>;
      case "pending":
        return <Badge variant="outline">Pendente</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "sent":
        return "Enviado com sucesso";
      case "failed":
        return "Falha no envio";
      case "pending":
        return "Pendente";
      default:
        return status;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Histórico de Mensagens</h1>
          <p className="text-muted-foreground">Acompanhe o status de todos os envios realizados</p>
        </div>

        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Carregando histórico...</div>
        ) : history && history.length > 0 ? (
          <div className="space-y-3">
            {history.map((item: any) => (
              <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      {getStatusIcon(item.status)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">Oferta #{item.offerId}</h3>
                          {getStatusBadge(item.status)}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{getStatusLabel(item.status)}</p>
                        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                          <div>
                            <span className="font-medium">Grupo:</span> {item.groupId}
                          </div>
                          <div>
                            <span className="font-medium">Data:</span>{" "}
                            {new Date(item.createdAt).toLocaleString("pt-BR")}
                          </div>
                        </div>
                        {item.errorMessage && (
                          <div className="mt-2 p-2 bg-red-50 rounded text-xs text-red-700">
                            <strong>Erro:</strong> {item.errorMessage}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">Nenhuma mensagem enviada ainda</p>
              <p className="text-sm text-muted-foreground">
                O histórico de mensagens aparecerá aqui após seus primeiros envios
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
