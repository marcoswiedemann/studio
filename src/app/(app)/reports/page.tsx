
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input"; // Embora não usado diretamente, Calendar pode depender
import { Label } from "@/components/ui/label";
import { useAppointments } from "@/contexts/appointment-context";
import { useAuth } from "@/contexts/auth-context";
import type { Appointment } from "@/types";
import { USER_ROLES } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  format, parseISO, 
  startOfDay, endOfDay, 
  startOfWeek, endOfWeek, 
  startOfMonth, endOfMonth, 
  startOfYear, endOfYear, 
  isWithinInterval, isBefore
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { FileText, Download, CalendarIcon } from "lucide-react";

type ReportType = "all" | "day" | "week" | "month" | "year" | "custom";

export default function ReportsPage() {
  const { user, allUsers } = useAuth();
  const { appointments: allAppointmentsFromContext } = useAppointments();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [reportType, setReportType] = useState<ReportType>("all");
  const [filterDate, setFilterDate] = useState<Date | undefined>(new Date());
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>();
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>();

  const getUserName = (userId: string): string => {
    const u = allUsers.find(usr => usr.id === userId);
    return u ? u.name : "Desconhecido";
  };

  const getVisibleAppointmentsForReport = (baseAppointments: Appointment[]): Appointment[] => {
    if (!user) return [];

    if (user.role === USER_ROLES.ADMIN) {
      return baseAppointments;
    }

    const mayor = allUsers.find(u => u.role === USER_ROLES.MAYOR);
    const viceMayor = allUsers.find(u => u.role === USER_ROLES.VICE_MAYOR);

    if (user.role === USER_ROLES.MAYOR) {
      return baseAppointments.filter(appt =>
        appt.assignedTo === user.id ||
        (appt.isShared && viceMayor && appt.assignedTo === viceMayor.id)
      );
    }

    if (user.role === USER_ROLES.VICE_MAYOR) {
      return baseAppointments.filter(appt =>
        appt.assignedTo === user.id ||
        (appt.isShared && mayor && appt.assignedTo === mayor.id)
      );
    }
    
    return [];
  };

  const generatePDFReport = () => {
    if (!user) return;
    setIsLoading(true);

    let dateFilteredAppointments = [...allAppointmentsFromContext];
    let reportPeriodTitle = "Todos os Períodos";

    if (reportType !== "all") {
      if (reportType === "custom") {
        if (!customStartDate || !customEndDate) {
          toast({ title: "Erro", description: "Por favor, selecione as datas inicial e final para o intervalo personalizado.", variant: "destructive" });
          setIsLoading(false);
          return;
        }
        if (isBefore(customEndDate, customStartDate)) {
          toast({ title: "Erro", description: "A data final deve ser posterior à data inicial.", variant: "destructive" });
          setIsLoading(false);
          return;
        }
        const rangeStart = startOfDay(customStartDate);
        const rangeEnd = endOfDay(customEndDate);
        dateFilteredAppointments = dateFilteredAppointments.filter(appt => {
          const apptDate = parseISO(appt.date);
          return isWithinInterval(apptDate, { start: rangeStart, end: rangeEnd });
        });
        reportPeriodTitle = `Período: ${format(customStartDate, "dd/MM/yyyy", { locale: ptBR })} - ${format(customEndDate, "dd/MM/yyyy", { locale: ptBR })}`;
      } else {
        if (!filterDate) {
          toast({ title: "Erro", description: "Por favor, selecione uma data para o filtro.", variant: "destructive" });
          setIsLoading(false);
          return;
        }
        let rangeStart: Date | undefined;
        let rangeEnd: Date | undefined;

        if (reportType === "day") {
          rangeStart = startOfDay(filterDate);
          rangeEnd = endOfDay(filterDate);
          reportPeriodTitle = `Dia: ${format(filterDate, "dd/MM/yyyy", { locale: ptBR })}`;
        } else if (reportType === "week") {
          rangeStart = startOfWeek(filterDate, { locale: ptBR });
          rangeEnd = endOfWeek(filterDate, { locale: ptBR });
          reportPeriodTitle = `Semana de: ${format(rangeStart, "dd/MM/yyyy", { locale: ptBR })}`;
        } else if (reportType === "month") {
          rangeStart = startOfMonth(filterDate);
          rangeEnd = endOfMonth(filterDate);
          reportPeriodTitle = `Mês: ${format(filterDate, "MMMM 'de' yyyy", { locale: ptBR })}`;
        } else if (reportType === "year") {
          rangeStart = startOfYear(filterDate);
          rangeEnd = endOfYear(filterDate);
          reportPeriodTitle = `Ano: ${format(filterDate, "yyyy", { locale: ptBR })}`;
        }
        
        if (rangeStart && rangeEnd) {
          dateFilteredAppointments = dateFilteredAppointments.filter(appt => {
            const apptDate = parseISO(appt.date);
            return isWithinInterval(apptDate, { start: rangeStart!, end: rangeEnd! });
          });
        }
      }
    }

    const reportAppointments = getVisibleAppointmentsForReport(dateFilteredAppointments)
      .sort((a,b) => parseISO(a.date).getTime() - parseISO(b.date).getTime() || a.time.localeCompare(b.time));

    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Relatório de Compromissos", 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(reportPeriodTitle, 14, 29);
    doc.text(`Gerado em: ${format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })} por ${user.name} (${user.role})`, 14, 36);

    const tableColumn = ["Data", "Hora", "Título", "Responsável", "Local", "Contato", "Participantes"];
    const tableRows: (string | undefined)[][] = [];

    reportAppointments.forEach(appt => {
      const appointmentData = [
        format(parseISO(appt.date), "dd/MM/yy", { locale: ptBR }),
        appt.time,
        appt.title,
        getUserName(appt.assignedTo),
        appt.location || "-",
        appt.contactPerson || "-",
        appt.participants || "-",
      ];
      tableRows.push(appointmentData);
    });

    if (reportAppointments.length === 0) {
        doc.setFontSize(12);
        doc.text("Nenhum compromisso encontrado para este relatório e período.", 14, 50);
    } else {
        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 45,
            theme: 'grid',
            styles: { fontSize: 8, cellPadding: 1.5 },
            headStyles: { fillColor: [22, 160, 133], fontSize: 9, fontStyle: 'bold' },
            columnStyles: {
                0: { cellWidth: 18 }, 1: { cellWidth: 12 }, 2: { cellWidth: 'auto' },
                3: { cellWidth: 30 }, 4: { cellWidth: 25 }, 5: { cellWidth: 30 },
                6: { cellWidth: 30 },
            },
            didDrawPage: (data) => {
                const pageCount = doc.getNumberOfPages();
                doc.setFontSize(8);
                doc.text(`Página ${data.pageNumber} de ${pageCount}`, data.settings.margin.left, doc.internal.pageSize.height - 10);
            }
        });
    }
    
    doc.save(`Relatorio_Compromissos_${format(new Date(), "yyyyMMdd_HHmm")}.pdf`);
    setIsLoading(false);
  };

  if (!user || ![USER_ROLES.ADMIN, USER_ROLES.MAYOR, USER_ROLES.VICE_MAYOR].includes(user.role)) {
    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-theme(spacing.16))]">
            <p>Você não tem permissão para acessar esta página.</p>
        </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-xl">
        <CardHeader>
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-2xl">Gerar Relatórios de Compromissos</CardTitle>
              <CardDescription>
                Selecione o período e gere um relatório em PDF com a lista de compromissos.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center p-6 md:p-10 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
                <div className="space-y-2">
                    <Label htmlFor="reportType">Tipo de Relatório</Label>
                    <Select value={reportType} onValueChange={(value) => setReportType(value as ReportType)}>
                        <SelectTrigger id="reportType">
                            <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos os Períodos</SelectItem>
                            <SelectItem value="day">Diário</SelectItem>
                            <SelectItem value="week">Semanal</SelectItem>
                            <SelectItem value="month">Mensal</SelectItem>
                            <SelectItem value="year">Anual</SelectItem>
                            <SelectItem value="custom">Intervalo Personalizado</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {['day', 'week', 'month', 'year'].includes(reportType) && (
                    <div className="space-y-2">
                         <Label htmlFor="filterDate">
                            {reportType === 'day' ? 'Selecione o Dia' : 
                             reportType === 'week' ? 'Selecione um Dia da Semana' :
                             reportType === 'month' ? 'Selecione um Dia do Mês' :
                             'Selecione um Dia do Ano'}
                        </Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    id="filterDate"
                                    variant={"outline"}
                                    className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !filterDate && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {filterDate ? format(filterDate, "PPP", {locale: ptBR}) : <span>Escolha uma data</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={filterDate}
                                    onSelect={setFilterDate}
                                    initialFocus
                                    locale={ptBR}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                )}

                {reportType === 'custom' && (
                    <>
                        <div className="space-y-2">
                            <Label htmlFor="customStartDate">Data Inicial</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        id="customStartDate"
                                        variant={"outline"}
                                        className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !customStartDate && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {customStartDate ? format(customStartDate, "PPP", {locale: ptBR}) : <span>Escolha a data inicial</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={customStartDate}
                                        onSelect={setCustomStartDate}
                                        initialFocus
                                        locale={ptBR}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="customEndDate">Data Final</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        id="customEndDate"
                                        variant={"outline"}
                                        className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !customEndDate && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {customEndDate ? format(customEndDate, "PPP", {locale: ptBR}) : <span>Escolha a data final</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={customEndDate}
                                        onSelect={setCustomEndDate}
                                        initialFocus
                                        locale={ptBR}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </>
                )}
            </div>
            
            <img 
              src="https://placehold.co/200x150.png" 
              alt="Report Illustration" 
              data-ai-hint="report document" 
              className="my-6 rounded-md shadow-sm" 
            />
            
            <Button onClick={generatePDFReport} disabled={isLoading} size="lg">
                <Download className="mr-2 h-5 w-5" />
                {isLoading ? "Gerando Relatório..." : "Gerar Relatório PDF"}
            </Button>
            {isLoading && <p className="mt-4 text-sm text-muted-foreground">Por favor, aguarde enquanto o PDF é gerado...</p>}
        </CardContent>
      </Card>
    </div>
  );
}


    