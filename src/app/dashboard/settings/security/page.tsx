
import { Wrench } from 'lucide-react';

const PlaceholderContent = ({ title }: { title: string }) => (
    <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-8 border border-dashed rounded-lg h-full min-h-[200px]">
        <Wrench className="h-12 w-12 mb-4" />
        <h3 className="text-lg font-semibold text-foreground">Em Construção</h3>
        <p>A área de <span className="font-semibold text-foreground/90">{title}</span> está sendo desenvolvida.</p>
        <p>Volte em breve para novidades!</p>
    </div>
);

export default function SecuritySettingsPage() {
  return (
    <PlaceholderContent title="Configurações de Segurança" />
  );
}
