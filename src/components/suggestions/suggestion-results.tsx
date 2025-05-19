
"use client";

import type { SuggestOptimalAppointmentTimesOutput } from "@/ai/flows/suggest-optimal-appointment-times";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Clock } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

interface SuggestionResultsProps {
  results: SuggestOptimalAppointmentTimesOutput | null;
}

export function SuggestionResults({ results }: SuggestionResultsProps) {
  if (!results) {
    return null;
  }

  return (
    <Card className="mt-8 shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Lightbulb className="h-6 w-6 text-primary" />
          <CardTitle>Sugestões de Horários Otimizados</CardTitle>
        </div>
        <CardDescription>Baseado em seus dados e preferências, aqui estão alguns horários sugeridos:</CardDescription>
      </CardHeader>
      <CardContent>
        {results.suggestedTimes.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">Nenhuma sugestão disponível para os critérios informados.</p>
        ) : (
          <div className="space-y-4">
            {results.suggestedTimes.map((time, index) => (
              <div key={index} className="p-3 border rounded-md flex items-center justify-between hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <span className="font-medium text-lg">
                    {format(parseISO(time), "HH:mm", { locale: ptBR })}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    ({format(parseISO(time), "eeee, dd 'de' MMMM", { locale: ptBR })})
                  </span>
                </div>
                <Badge variant="outline">Sugestão #{index + 1}</Badge>
              </div>
            ))}
          </div>
        )}
        {results.reasoning && (
          <div className="mt-6 pt-4 border-t">
            <h4 className="font-semibold mb-2 text-primary">Raciocínio da IA:</h4>
            <p className="text-sm text-muted-foreground whitespace-pre-line">{results.reasoning}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
