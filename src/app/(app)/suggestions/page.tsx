
"use client";

import { useState } from "react";
import { SuggestionForm, SuggestionFormValues } from "@/components/suggestions/suggestion-form";
import { SuggestionResults } from "@/components/suggestions/suggestion-results";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";
import { suggestOptimalAppointmentTimes, type SuggestOptimalAppointmentTimesOutput } from "@/ai/flows/suggest-optimal-appointment-times";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";

export default function SuggestionsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [suggestionResults, setSuggestionResults] = useState<SuggestOptimalAppointmentTimesOutput | null>(null);

  const handleSuggestionSubmit = async (values: SuggestionFormValues) => {
    if (!user) {
      toast({ title: "Erro de Autenticação", description: "Usuário não encontrado.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    setSuggestionResults(null); // Clear previous results

    const inputForAI = {
      userId: user.id,
      appointmentDate: format(values.appointmentDate, "yyyy-MM-dd"),
      appointmentDurationMinutes: values.appointmentDurationMinutes,
      userPreferences: values.userPreferences || "",
    };

    try {
      const results = await suggestOptimalAppointmentTimes(inputForAI);
      setSuggestionResults(results);
      if (results.suggestedTimes.length === 0) {
        toast({ title: "Nenhuma Sugestão", description: "A IA não encontrou horários ótimos com base nos critérios.", variant: "default" });
      } else {
        toast({ title: "Sugestões Encontradas!", description: "Veja abaixo os horários sugeridos pela IA.", variant: "default" });
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      toast({ title: "Erro ao buscar sugestões", description: "Ocorreu um problema ao contatar o serviço de IA. Tente novamente.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!user) {
      return (
        <div className="flex items-center justify-center min-h-[calc(100vh-theme(spacing.16))]">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      );
  }


  return (
    <div className="container mx-auto py-8">
      <Card className="w-full max-w-2xl mx-auto shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl">Sugestões Inteligentes de Agendamento</CardTitle>
          <CardDescription>
            Utilize a inteligência artificial para encontrar os melhores horários para seus novos compromissos.
            Informe os detalhes abaixo e veja as sugestões.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SuggestionForm onSubmit={handleSuggestionSubmit} isLoading={isLoading} />
        </CardContent>
      </Card>

      {isLoading && (
        <div className="flex justify-center items-center mt-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-2 text-muted-foreground">Analisando horários...</p>
        </div>
      )}
      
      {!isLoading && suggestionResults && (
        <SuggestionResults results={suggestionResults} />
      )}
    </div>
  );
}
