import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Plus, Trash2, Calendar, Clock } from "lucide-react";
import { toast } from "sonner";

export default function Offers() {
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedGroups, setSelectedGroups] = useState<number[]>([]);
  const [scheduledAt, setScheduledAt] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const { data: products } = trpc.products.list.useQuery();
  const { data: groups } = trpc.groups.list.useQuery();
  const { data: offers, isLoading, refetch } = trpc.offers.list.useQuery();
  const createOfferMutation = trpc.offers.create.useMutation();
  const deleteOfferMutation = trpc.offers.delete.useMutation();

  const handleCreateOffer = async () => {
    if (!selectedProduct || selectedGroups.length === 0 || !scheduledAt) {
      toast.error("Preencha todos os campos");
      return;
    }

    try {
      setIsCreating(true);
      await createOfferMutation.mutateAsync({
        productId: parseInt(selectedProduct),
        groupIds: selectedGroups,
        scheduledAt: new Date(scheduledAt),
      });
      toast.success("Agendamento criado com sucesso!");
      setSelectedProduct("");
      setSelectedGroups([]);
      setScheduledAt("");
      refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao criar agendamento");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja deletar este agendamento?")) return;

    try {
      await deleteOfferMutation.mutateAsync({ id });
      toast.success("Agendamento deletado");
      refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao deletar");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline">Agendado</Badge>;
      case "sent":
        return <Badge className="bg-green-600">Enviado</Badge>;
      case "failed":
        return <Badge variant="destructive">Falha</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Agendamentos</h1>
          <p className="text-muted-foreground">Agende envios de ofertas para seus grupos</p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Novo Agendamento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Agendar Oferta</DialogTitle>
              <DialogDescription>Crie um novo agendamento de envio</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Produto *</label>
                <select
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="">Selecione um produto</option>
                  {products?.map((p: any) => (
                    <option key={p.id} value={p.id}>
                      {p.emoji} {p.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Grupos *</label>
                <div className="space-y-2 border rounded-md p-3 max-h-40 overflow-y-auto">
                  {groups?.map((g: any) => (
                    <label key={g.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedGroups.includes(g.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedGroups([...selectedGroups, g.id]);
                          } else {
                            setSelectedGroups(selectedGroups.filter((id) => id !== g.id));
                          }
                        }}
                      />
                      <span className="text-sm">{g.groupName}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Data e Hora *</label>
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <Button onClick={handleCreateOffer} disabled={isCreating} className="w-full">
                {isCreating ? "Agendando..." : "Agendar"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Carregando agendamentos...</div>
        ) : offers && offers.length > 0 ? (
          <div className="grid gap-4">
            {offers.map((offer: any) => (
              <Card key={offer.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <CardTitle className="text-lg">{offer.productTitle}</CardTitle>
                        <CardDescription>
                          {new Date(offer.scheduledAt).toLocaleString("pt-BR")}
                        </CardDescription>
                      </div>
                    </div>
                    {getStatusBadge(offer.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-3">
                    <p className="text-sm text-muted-foreground">
                      <strong>{offer.groupCount}</strong> grupo(s) | <strong>{offer.sentCount || 0}</strong> enviadas |{" "}
                      <strong>{offer.failedCount || 0}</strong> falhas
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="destructive"
                      size="sm"
                      className="gap-2"
                      onClick={() => handleDelete(offer.id)}
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
              <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">Nenhum agendamento criado</p>
              <p className="text-sm text-muted-foreground">Crie um novo agendamento para enviar ofertas</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
