import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { Plus, Trash2, Package, Eye } from "lucide-react";
import { toast } from "sonner";

export default function Products() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [productLink, setProductLink] = useState("");
  const [emoji, setEmoji] = useState("🎁");
  const [isCreating, setIsCreating] = useState(false);

  const { data: products, isLoading, refetch } = trpc.products.list.useQuery();
  const createProductMutation = trpc.products.create.useMutation();
  const deleteProductMutation = trpc.products.delete.useMutation();

  const handleCreateProduct = async () => {
    if (!title.trim() || !productLink.trim()) {
      toast.error("Título e link são obrigatórios");
      return;
    }

    try {
      setIsCreating(true);
      await createProductMutation.mutateAsync({
        title,
        description: description || undefined,
        price: price || undefined,
        productLink,
        emoji,
      });
      toast.success("Produto criado com sucesso!");
      setTitle("");
      setDescription("");
      setPrice("");
      setProductLink("");
      setEmoji("🎁");
      refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao criar produto");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja deletar este produto?")) return;

    try {
      await deleteProductMutation.mutateAsync({ id });
      toast.success("Produto deletado");
      refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao deletar");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Gerenciar Produtos</h1>
          <p className="text-muted-foreground">Cadastre ofertas e produtos para enviar aos grupos</p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Novo Produto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Cadastrar Novo Produto</DialogTitle>
              <DialogDescription>Crie uma oferta para enviar aos seus grupos</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Emoji</label>
                <Input
                  placeholder="🎁"
                  value={emoji}
                  onChange={(e) => setEmoji(e.target.value)}
                  maxLength={2}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Título *</label>
                <Input
                  placeholder="Ex: Tênis Premium"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Descrição</label>
                <textarea
                  placeholder="Descreva a oferta..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  rows={3}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Preço</label>
                <Input
                  placeholder="R$ 199,90"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Link do Produto *</label>
                <Input
                  placeholder="https://..."
                  value={productLink}
                  onChange={(e) => setProductLink(e.target.value)}
                />
              </div>
              <Button onClick={handleCreateProduct} disabled={isCreating} className="w-full">
                {isCreating ? "Criando..." : "Criar Produto"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Carregando produtos...</div>
        ) : products && products.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product: any) => (
              <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{product.emoji}</span>
                      <div>
                        <CardTitle className="text-base line-clamp-2">{product.title}</CardTitle>
                        {product.price && <p className="text-sm font-bold text-green-600">{product.price}</p>}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {product.description && (
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{product.description}</p>
                  )}
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-2 flex-1">
                      <Eye className="w-4 h-4" />
                      Preview
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="gap-2"
                      onClick={() => handleDelete(product.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">Nenhum produto cadastrado</p>
              <p className="text-sm text-muted-foreground">Crie um novo produto para começar a enviar ofertas</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
