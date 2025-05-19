
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { SuggestOptimalAppointmentTimesInput } from "@/ai/flows/suggest-optimal-appointment-times";

const suggestionFormSchema = z.object({
  appointmentDate: z.date({ required_error: "Data é obrigatória." }),
  appointmentDurationMinutes: z.coerce.number().min(15, "Duração mínima de 15 minutos.").max(240, "Duração máxima de 4 horas."),
  userPreferences: z.string().optional(),
});

export type SuggestionFormValues = z.infer<typeof suggestionFormSchema>;

interface SuggestionFormProps {
  onSubmit: (values: SuggestionFormValues) => void;
  isLoading?: boolean;
}

export function SuggestionForm({ onSubmit, isLoading }: SuggestionFormProps) {
  const form = useForm<SuggestionFormValues>({
    resolver: zodResolver(suggestionFormSchema),
    defaultValues: {
      appointmentDate: new Date(),
      appointmentDurationMinutes: 60,
      userPreferences: "",
    },
  });

  const handleSubmit = (values: SuggestionFormValues) => {
    onSubmit(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="appointmentDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Data do Compromisso</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP", { locale: ptBR })
                      ) : (
                        <span>Escolha uma data</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() -1))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormDescription>
                Selecione a data para a qual deseja sugestões de horários.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="appointmentDurationMinutes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Duração do Compromisso (minutos)</FormLabel>
              <FormControl>
                <Input type="number" placeholder="Ex: 60" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="userPreferences"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Preferências (Opcional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Ex: Prefiro horários pela manhã, evitar horários de almoço..." {...field} />
              </FormControl>
              <FormDescription>
                Qualquer preferência que ajude a IA a sugerir melhores horários.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Buscando Sugestões..." : "Obter Sugestões de Horários"}
        </Button>
      </form>
    </Form>
  );
}
