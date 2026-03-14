import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Plus, Trash2, Users } from "lucide-react";
import { toast } from "sonner";

export default function Groups() {
  const { user } = useAuth();
  const [groupName, setGroupName] = useState("");
  const [groupId, setGroupId] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const { data: groups, isLoading, refetch } = trpc.groups.list.useQuery();
  const { data: sessions } = trpc.whatsapp.listSessions.useQuery();
  const createGroupMutation = trpc.groups.create.useMutation();
  const deleteGroupMutation = trpc.groups.delete.useMutation();

  const handleCreateGroup = async () => {
    if (!groupName.trim() || !groupId.trim() || !sessionId) {
      toast.error("Preencha todos os campos");
      return;
    }

    try {
      setIsCreating(true);
      await createGroupMutation.mutateAsync({
        groupName,
        groupId,
        sessionId: parseInt(sessionId),
      });
      toast.success("Grupo criado com sucesso!");
      setGroupName("");
      setGroupId("");
      setSessionId("");
      refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao criar grupo");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja deletar este grupo?")) return;

    try {
      await deleteGroupMutation.mutateAsync({ id });
      toast.success("Grupo deletado");
      refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao deletar");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Gerenciar Grupos</h1>
          <p className="text-muted-foreground">Cadastre e gerencie os grupos para envio de ofertas</p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Novo Grupo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cadastrar Novo Grupo</DialogTitle>
              <DialogDescription>Adicione um grupo WhatsApp para receber ofertas</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nome do Grupo</label>
                <Input
                  placeholder="Ex: Clientes VIP"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">ID do Grupo WhatsApp</label>
                <Input
                  placeholder="Ex: 120363123456789@g.us"
                  value={groupId}
                  onChange={(e) => setGroupId(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Sessão WhatsApp</label>
                <select
                  value={sessionId}
                  onChange={(e) => setSessionId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="">Selecione uma sessão</option>
                  {sessions?.map((session) => (
                    <option key={session.id} value={session.id}>
                      {session.sessionName}
                    </option>
                  ))}
                </select>
              </div>
              <Button onClick={handleCreateGroup} disabled={isCreating} className="w-full">
                {isCreating ? "Criando..." : "Criar Grupo"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Carregando grupos...</div>
        ) : groups && groups.length > 0 ? (
          <div className="grid gap-4">            {groups?.map((group: any) => (
              <Card key={group.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <CardTitle className="text-lg">{group.groupName}</CardTitle>
                        <CardDescription className="text-xs font-mono">{group.groupId}</CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline">{group.sessionName}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button
                      variant="destructive"
                      size="sm"
                      className="gap-2"
                      onClick={() => handleDelete(group.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                      Deletar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">Nenhum grupo cadastrado</p>
              <p className="text-sm text-muted-foreground">Crie um novo grupo para começar a enviar ofertas</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
