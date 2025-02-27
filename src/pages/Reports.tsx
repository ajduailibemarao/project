import React, { useState } from 'react';
import { FileText, Download, Calendar, BarChart2, PieChart, FileSpreadsheet, File as FilePdf } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const Reports: React.FC = () => {
  const [reportType, setReportType] = useState('licitacoes');
  const [dateRange, setDateRange] = useState('month');
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [loading, setLoading] = useState(false);

  // Mock data for reports
  const mockLicitacoesData = [
    { id: 'PE-2025-001', modalidade: 'Pregão Eletrônico', objeto: 'Aquisição de equipamentos de informática', dataAbertura: '2025-05-15', valorEstimado: 250000, valorFinal: 230000, status: 'Concluído' },
    { id: 'TP-2025-003', modalidade: 'Tomada de Preços', objeto: 'Contratação de serviços de consultoria', dataAbertura: '2025-05-10', valorEstimado: 180000, valorFinal: null, status: 'Em Andamento' },
    { id: 'CC-2025-002', modalidade: 'Concorrência', objeto: 'Construção de novo prédio administrativo', dataAbertura: '2025-05-05', valorEstimado: 1500000, valorFinal: null, status: 'Em Andamento' },
    { id: 'CV-2025-004', modalidade: 'Convite', objeto: 'Serviços de manutenção predial', dataAbertura: '2025-05-05', valorEstimado: 75000, valorFinal: 72000, status: 'Concluído' },
    { id: 'PE-2025-005', modalidade: 'Pregão Eletrônico', objeto: 'Aquisição de material de escritório', dataAbertura: '2025-04-15', valorEstimado: 50000, valorFinal: null, status: 'Cancelado' },
  ];

  const mockLicitantesData = [
    { id: '1', razaoSocial: 'Empresa ABC Ltda', cnpj: '12.345.678/0001-90', cidade: 'São Paulo', estado: 'SP', situacao: 'Ativo', participacoes: 12, vitorias: 5 },
    { id: '2', razaoSocial: 'Tecnologia XYZ S.A.', cnpj: '98.765.432/0001-10', cidade: 'São Paulo', estado: 'SP', situacao: 'Ativo', participacoes: 8, vitorias: 3 },
    { id: '3', razaoSocial: 'Construções Rápidas Ltda', cnpj: '45.678.901/0001-23', cidade: 'Rio de Janeiro', estado: 'RJ', situacao: 'Ativo', participacoes: 15, vitorias: 7 },
    { id: '4', razaoSocial: 'Consultoria Financeira Ltda', cnpj: '56.789.012/0001-34', cidade: 'Belo Horizonte', estado: 'MG', situacao: 'Inativo', participacoes: 5, vitorias: 1 },
    { id: '5', razaoSocial: 'Distribuidora de Alimentos S.A.', cnpj: '67.890.123/0001-45', cidade: 'Recife', estado: 'PE', situacao: 'Ativo', participacoes: 10, vitorias: 4 },
  ];

  const mockPenalidadesData = [
    { id: '1', fornecedor: 'Empresa ABC Ltda', cnpj: '12.345.678/0001-90', tipoSancao: 'Advertência', dataInicio: '2025-01-15', dataFim: '2025-04-15', status: 'Ativa' },
    { id: '2', fornecedor: 'Tecnologia XYZ S.A.', cnpj: '98.765.432/0001-10', tipoSancao: 'Multa', dataInicio: '2025-02-10', dataFim: '2025-05-10', status: 'Ativa' },
    { id: '3', fornecedor: 'Construções Rápidas Ltda', cnpj: '45.678.901/0001-23', tipoSancao: 'Suspensão temporária', dataInicio: '2025-03-05', dataFim: '2026-03-05', status: 'Ativa' },
    { id: '4', fornecedor: 'Consultoria Financeira Ltda', cnpj: '56.789.012/0001-34', tipoSancao: 'Declaração de inidoneidade', dataInicio: '2025-01-20', dataFim: '2027-01-20', status: 'Ativa' },
    { id: '5', fornecedor: 'Distribuidora de Alimentos S.A.', cnpj: '67.890.123/0001-45', tipoSancao: 'Advertência', dataInicio: '2024-10-25', dataFim: '2025-01-25', status: 'Encerrada' },
  ];

  // Generate report
  const generateReport = () => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      toast.success('Relatório gerado com sucesso!');
    }, 1000);
  };

  // Export to Excel
  const exportToExcel = () => {
    let data;
    let filename;
    
    if (reportType === 'licitacoes') {
      data = mockLicitacoesData.map(item => ({
        'Identificação': item.id,
        'Modalidade': item.modalidade,
        'Objeto': item.objeto,
        'Data de Abertura': format(new Date(item.dataAbertura), 'dd/MM/yyyy'),
        'Valor Estimado (R$)': item.valorEstimado.toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
        'Valor Final (R$)': item.valorFinal ? item.valorFinal.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : 'N/A',
        'Status': item.status,
        'Economia (R$)': item.valorFinal ? (item.valorEstimado - item.valorFinal).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : 'N/A',
        'Economia (%)': item.valorFinal ? ((item.valorEstimado - item.valorFinal) / item.valorEstimado * 100).toFixed(2) + '%' : 'N/A'
      }));
      filename = 'relatorio_licitacoes';
    } else if (reportType === 'licitantes') {
      data = mockLicitantesData.map(item => ({
        'Razão Social': item.razaoSocial,
        'CNPJ': item.cnpj,
        'Cidade/UF': `${item.cidade}/${item.estado}`,
        'Situação': item.situacao,
        'Participações': item.participacoes,
        'Vitórias': item.vitorias,
        'Taxa de Sucesso': ((item.vitorias / item.participacoes) * 100).toFixed(2) + '%'
      }));
      filename = 'relatorio_licitantes';
    } else {
      data = mockPenalidadesData.map(item => ({
        'Fornecedor': item.fornecedor,
        'CNPJ': item.cnpj,
        'Tipo de Sanção': item.tipoSancao,
        'Data de Início': format(new Date(item.dataInicio), 'dd/MM/yyyy'),
        'Data de Fim': format(new Date(item.dataFim), 'dd/MM/yyyy'),
        'Status': item.status
      }));
      filename = 'relatorio_penalidades';
    }
    
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Relatório');
    
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    saveAs(blob, `${filename}_${format(new Date(), 'dd-MM-yyyy')}.xlsx`);
    toast.success('Relatório exportado para Excel com sucesso!');
  };

  // Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    let title;
    let data;
    let columns;
    
    if (reportType === 'licitacoes') {
      title = 'Relatório de Licitações';
      columns = ['ID', 'Modalidade', 'Valor Estimado', 'Status'];
      data = mockLicitacoesData.map(item => [
        item.id,
        item.modalidade,
        `R$ ${item.valorEstimado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
        item.status
      ]);
    } else if (reportType === 'licitantes') {
      title = 'Relatório de Licitantes';
      columns = ['Razão Social', 'CNPJ', 'Cidade/UF', 'Situação'];
      data = mockLicitantesData.map(item => [
        item.razaoSocial,
        item.cnpj,
        `${item.cidade}/${item.estado}`,
        item.situacao
      ]);
    } else {
      title = 'Relatório de Penalidades';
      columns = ['Fornecedor', 'Tipo de Sanção', 'Período', 'Status'];
      data = mockPenalidadesData.map(item => [
        item.fornecedor,
        item.tipoSancao,
        `${format(new Date(item.dataInicio), 'dd/MM/yyyy')} a ${format(new Date(item.dataFim), 'dd/MM/yyyy')}`,
        item.status
      ]);
    }
    
    doc.setFontSize(18);
    doc.text(title, 14, 22);
    
    doc.setFontSize(11);
    doc.text(`Data de geração: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, 30);
    doc.text(`Período: ${format(new Date(startDate), 'dd/MM/yyyy')} a ${format(new Date(endDate), 'dd/MM/yyyy')}`, 14, 38);
    
    autoTable(doc, {
      head: [columns],
      body: data,
      startY: 45,
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [59, 130, 246], textColor: 255 },
      alternateRowStyles: { fillColor: [240, 240, 240] }
    });
    
    doc.save(`relatorio_${reportType}_${format(new Date(), 'dd-MM-yyyy')}.pdf`);
    toast.success('Relatório exportado para PDF com sucesso!');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
      </div>
      
      {/* Report Configuration */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Configuração do Relatório</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label htmlFor="reportType" className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Relatório
            </label>
            <select
              id="reportType"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="licitacoes">Licitações</option>
              <option value="licitantes">Licitantes</option>
              <option value="penalidades">Penalidades</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="dateRange" className="block text-sm font-medium text-gray-700 mb-1">
              Período Predefinido
            </label>
            <select
              id="dateRange"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="today">Hoje</option>
              <option value="week">Última Semana</option>
              <option value="month">Último Mês</option>
              <option value="quarter">Último Trimestre</option>
              <option value="year">Último Ano</option>
              <option value="custom">Personalizado</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
              Data Inicial
            </label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              disabled={dateRange !== 'custom'}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md disabled:bg-gray-100 disabled:text-gray-500"
            />
          </div>
          
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
              Data Final
            </label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              disabled={dateRange !== 'custom'}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md disabled:bg-gray-100 disabled:text-gray-500"
            />
          </div>
        </div>
        
        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={generateReport}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Gerando...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                Gerar Relatório
              </>
            )}
          </button>
          
          <div className="relative">
            <button
              type="button"
              onClick={() => document.getElementById('exportOptions')?.classList.toggle('hidden')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </button>
            
            <div id="exportOptions" className="hidden absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
              <div className="py-1" role="menu" aria-orientation="vertical">
                <button
                  onClick={exportToExcel}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  role="menuitem"
                >
                  <FileSpreadsheet className="mr-3 h-5 w-5 text-green-500" />
                  Exportar para Excel
                </button>
                <button
                  onClick={exportToPDF}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  role="menuitem"
                >
                  <FilePdf className="mr-3 h-5 w-5 text-red-500" />
                  Exportar para PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Report Preview */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">Visualização do Relatório</h2>
          <div className="flex space-x-2">
            <button
              type="button"
              className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm leading-5 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <BarChart2 className="h-4 w-4 mr-1" />
              Gráfico de Barras
            </button>
            <button
              type="button"
              className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm leading-5 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <PieChart className="h-4 w-4 mr-1" />
              Gráfico de Pizza
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          {reportType === 'licitacoes' && (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Identificação
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Modalidade
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Objeto
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data de Abertura
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor Estimado
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor Final
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {mockLicitacoesData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.modalidade}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {item.objeto}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(item.dataAbertura), 'dd/MM/yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      R$ {item.valorEstimado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.valorFinal ? `R$ ${item.valorFinal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${item.status === 'Concluído' ? 'bg-green-100 text-green-800' : 
                          item.status === 'Em Andamento' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'}`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          
          {reportType === 'licitantes' && (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Razão Social
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CNPJ
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cidade/UF
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Situação
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Participações
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vitórias
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Taxa de Sucesso
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {mockLicitantesData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.razaoSocial}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.cnpj}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.cidade}/{item.estado}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${item.situacao === 'Ativo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {item.situacao}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.participacoes}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.vitorias}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {((item.vitorias / item.participacoes) * 100).toFixed(2)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          
          {reportType === 'penalidades' && (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fornecedor
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CNPJ
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo de Sanção
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data de Início
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data de Fim
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {mockPenalidadesData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.fornecedor}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.cnpj}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.tipoSancao}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(item.dataInicio), 'dd/MM/yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(item.dataFim), 'dd/MM/yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${item.status === 'Ativa' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total de Registros</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {reportType === 'licitacoes' 
                        ? mockLicitacoesData.length 
                        : reportType === 'licitantes' 
                          ? mockLicitantesData.length 
                          : mockPenalidadesData.length}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        
        {reportType === 'licitacoes' && (
          <>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Valor Total Estimado</dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          R$ {mockLicitacoesData.reduce((sum, item) => sum + item.valorEstimado, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Economia Gerada</dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          R$ {mockLicitacoesData
                            .filter(item => item.valorFinal)
                            .reduce((sum, item) => sum + (item.valorEstimado - (item.valorFinal || 0)), 0)
                            .toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
        
        {reportType === 'licitantes' && (
          <>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total de Participações</dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          {mockLicitantesData.reduce((sum, item) => sum + item.participacoes, 0)}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Taxa Média de Sucesso</dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          {(mockLicitantesData.reduce((sum, item) => sum + (item.vitorias / item.participacoes), 0) / mockLicitantesData.length * 100).toFixed(2)}%
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
        
        {reportType === 'penalidades' && (
          <>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-red-500 rounded-md p-3">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Penalidades Ativas</dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          {mockPenalidadesData.filter(item => item.status === 'Ativa').length}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Penalidades Encerradas</dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          {mockPenalidadesData.filter(item => item.status === 'Encerrada').length}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Reports;