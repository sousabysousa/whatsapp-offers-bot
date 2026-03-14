import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Plus, Trash2, RefreshCw, QrCode, Smartphone } from "lucide-react";
import { toast } from "sonner";

export default function WhatsAppSessions() {
  const { user } = useAuth();
  const [sessionName, setSessionName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const { data: sessions, isLoading, refetch } = trpc.whatsapp.listSessions.useQuery();
  const createSessionMutation = trpc.whatsapp.createSession.useMutation();
  const disconnectMutation = trpc.whatsapp.disconnectSession.useMutation();

  const handleCreateSession = async () => {
    if (!sessionName.trim()) {
      toast.error("Digite um nome para a sessão");
      return;
    }

    try {
      setIsCreating(true);
      await createSessionMutation.mutateAsync({ sessionName });
      toast.success("Sessão criada com sucesso!");
      setSessionName("");
      refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao criar sessão");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDisconnect = async (sessionId: number) => {
    try {
      await disconnectMutation.mutateAsync({ sessionId });
      toast.success("Sessão desconectada");
      refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao desconectar");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "connected":
        return "bg-green-100 text-green-800";
      case "connecting":
        return "bg-yellow-100 text-yellow-800";
      case "disconnected":
        return "bg-gray-100 text-gray-800";
      case "error":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "connected":
        return "Conectado";
      case "connecting":
        return "Conectando...";
      case "disconnected":
        return "Desconectado";
      case "error":
        return "Erro";
      default:
        return status;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Sessões WhatsApp</h1>
          <p className="text-muted-foreground">Gerencie suas conexões com WhatsApp</p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Nova Sessão
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Nova Sessão</DialogTitle>
              <DialogDescription>Digite um nome único para identificar esta sessão WhatsApp</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Ex: Minha Conta Principal"
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
              />
              <Button onClick={handleCreateSession} disabled={isCreating} className="w-full">
                {isCreating ? "Criando..." : "Criar Sessão"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Carregando sessões...</div>
        ) : sessions && sessions.length > 0 ? (
          <div className="grid gap-4">
            {sessions.map((session) => (
              <Card key={session.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Smartphone className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <CardTitle className="text-lg">{session.sessionName}</CardTitle>
                        <CardDescription>
                          {session.phoneNumber ? `📱 ${session.phoneNumber}` : "Não conectado"}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge className={getStatusColor(session.status)}>
                      {getStatusLabel(session.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    {session.status === "disconnected" && (
                      <Button variant="outline" size="sm" className="gap-2">
                        <QrCode className="w-4 h-4" />
                        Conectar com QR Code
                      </Button>
                    )}
                    {session.status === "connected" && (
                      <Button
                        variant="destructive"
                        size="sm"
                        className="gap-2"
                        onClick={() => handleDisconnect(session.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                        Desconectar
                      </Button>
                    )}
                    <Button variant="outline" size="sm" className="gap-2">
                      <RefreshCw className="w-4 h-4" />
                      Atualizar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Smartphone className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">Nenhuma sessão criada ainda</p>
              <p className="text-sm text-muted-foreground">Crie uma nova sessão para começar a usar o WhatsApp</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
