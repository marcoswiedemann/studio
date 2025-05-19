
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppointments } from "@/contexts/appointment-context";
import { useAuth } from "@/contexts/auth-context";
import type { Appointment, User } from "@/types";
import { USER_ROLES } from "@/lib/constants";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { FileText, Download } from "lucide-react";

export default function ReportsPage() {
  const { user, allUsers } = useAuth();
  const { appointments: allAppointmentsFromContext } = useAppointments(); // Get all appointments
  const [isLoading, setIsLoading] = useState(false);

  const getUserName = (userId: string): string => {
    const u = allUsers.find(usr => usr.id === userId);
    return u ? u.name : "Desconhecido";
  };

  const getVisibleAppointmentsForReport = (): Appointment[] => {
    if (!user) return [];

    if (user.role === USER_ROLES.ADMIN) {
      return allAppointmentsFromContext;
    }

    const mayor = allUsers.find(u => u.role === USER_ROLES.MAYOR);
    const viceMayor = allUsers.find(u => u.role === USER_ROLES.VICE_MAYOR);

    if (user.role === USER_ROLES.MAYOR) {
      return allAppointmentsFromContext.filter(appt =>
        appt.assignedTo === user.id ||
        (appt.isShared && viceMayor && appt.assignedTo === viceMayor.id)
      );
    }

    if (user.role === USER_ROLES.VICE_MAYOR) {
      return allAppointmentsFromContext.filter(appt =>
        appt.assignedTo === user.id ||
        (appt.isShared && mayor && appt.assignedTo === mayor.id)
      );
    }
    
    return []; // Should not happen for authorized roles, but as a fallback.
  };


  const generatePDFReport = () => {
    if (!user) return;
    setIsLoading(true);

    const doc = new jsPDF();
    const reportAppointments = getVisibleAppointmentsForReport().sort((a,b) => parseISO(a.date).getTime() - parseISO(b.date).getTime() || a.time.localeCompare(b.time));

    doc.setFontSize(18);
    doc.text("Relatório de Compromissos", 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Gerado em: ${format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })}`, 14, 29);
    doc.text(`Usuário: ${user.name} (${user.role})`, 14, 36);


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
        doc.text("Nenhum compromisso encontrado para este relatório.", 14, 50);
    } else {
        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 45,
            theme: 'grid',
            styles: { fontSize: 8, cellPadding: 1.5 },
            headStyles: { fillColor: [22, 160, 133], fontSize: 9, fontStyle: 'bold' }, // Example: Teal header
            columnStyles: {
                0: { cellWidth: 18 }, // Data
                1: { cellWidth: 12 }, // Hora
                2: { cellWidth: 'auto' }, // Título
                3: { cellWidth: 30 }, // Responsável
                4: { cellWidth: 25 }, // Local
                5: { cellWidth: 30 }, // Contato
                6: { cellWidth: 30 }, // Participantes
            },
            didDrawPage: (data) => {
                // Footer
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
    // This should ideally be caught by route guards or layout, but as a fallback
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
                Crie um relatório em PDF com a lista de compromissos visíveis para você.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center p-10">
            <img src="https://placehold.co/300x200.png" alt="Report Illustration" data-ai-hint="report illustration" className="mb-8 rounded-md shadow-md" />
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
