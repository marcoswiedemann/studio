
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
import { CalendarIcon, Users, Phone, Share2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox"; // Import Checkbox
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Appointment, User } from "@/types";
import { useAuth } from "@/contexts/auth-context";
import { USER_ROLES } from "@/lib/constants";
import React from "react"; // Import React for JSX

const appointmentFormSchema = z.object({
  title: z.string().min(1, "Título é obrigatório."),
  date: z.date({ required_error: "Data é obrigatória." }),
  time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Formato de hora inválido (HH:MM)."),
  assignedTo: z.string().min(1, "Responsável é obrigatório."),
  location: z.string().optional(),
  notes: z.string().optional(),
  contactPerson: z.string().optional(),
  participants: z.string().optional(),
  isShared: z.boolean().optional(), // Added isShared field
});

export type AppointmentFormValues = z.infer<typeof appointmentFormSchema>;

interface AppointmentFormProps {
  onSubmit: (values: AppointmentFormValues) => void;
  initialData?: Partial<Appointment> & { date?: Date };
  onCancel?: () => void;
  isLoading?: boolean;
}

export function AppointmentForm({ onSubmit, initialData, onCancel, isLoading }: AppointmentFormProps) {
  const { user, allUsers } = useAuth();

  const defaultAssignedTo = user?.role === USER_ROLES.ADMIN ? (initialData?.assignedTo || '') : user?.id || '';

  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      title: initialData?.title || "",
      date: initialData?.date instanceof Date ? initialData.date : new Date(),
      time: initialData?.time || "09:00",
      assignedTo: defaultAssignedTo,
      location: initialData?.location || "",
      notes: initialData?.notes || "",
      contactPerson: initialData?.contactPerson || "",
      participants: initialData?.participants || "",
      isShared: initialData?.isShared || false,
    },
  });
  
  const availableUsers = user?.role === USER_ROLES.ADMIN ? allUsers : allUsers.filter(u => u.id === user?.id);

  const handleSubmit = (values: AppointmentFormValues) => {
    onSubmit(values);
  };

  const showShareOption = user?.role === USER_ROLES.MAYOR || user?.role === USER_ROLES.VICE_MAYOR;
  let shareWithUserName = "";
  if (showShareOption) {
    const otherExecutiveRole = user?.role === USER_ROLES.MAYOR ? USER_ROLES.VICE_MAYOR : USER_ROLES.MAYOR;
    const otherExecutive = allUsers.find(u => u.role === otherExecutiveRole);
    shareWithUserName = otherExecutive ? otherExecutive.name : otherExecutiveRole;
  }


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Reunião de equipe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Data</FormLabel>
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
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hora</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="assignedTo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Responsável</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
                disabled={user?.role !== USER_ROLES.ADMIN}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o responsável" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {availableUsers.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name} ({u.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {showShareOption && (
           <FormField
            control={form.control}
            name="isShared"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    id="isShared"
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel htmlFor="isShared" className="flex items-center cursor-pointer">
                    <Share2 className="h-4 w-4 mr-2 text-muted-foreground" />
                    Compartilhar com {shareWithUserName}
                  </FormLabel>
                   <FormDescription>
                    Se marcado, este compromisso também aparecerá na agenda de {shareWithUserName}.
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Local (Opcional)</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Sala de reuniões A" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="contactPerson"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center"><Phone className="h-4 w-4 mr-2 text-muted-foreground" /> Contato (Opcional)</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Nome - (XX) XXXX-XXXX ou email@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="participants"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center"><Users className="h-4 w-4 mr-2 text-muted-foreground" /> Participantes (Opcional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Liste os participantes, separados por vírgula ou um por linha." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações (Opcional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Detalhes adicionais sobre o compromisso..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end space-x-2 pt-4">
          {onCancel && <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>Cancelar</Button>}
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (initialData?.id ? "Salvando..." : "Criando...") : (initialData?.id ? "Salvar Alterações" : "Criar Compromisso")}
          </Button>
        </div>
      </form>
    </Form>
  );
}

